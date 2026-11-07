import logging
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

import cv2
import numpy as np
import pytesseract
from fastapi import HTTPException, status
from pytesseract import Output
from pytesseract.pytesseract import TesseractError, TesseractNotFoundError

from app.core.config import settings

logger = logging.getLogger(__name__)


class OCRService:
    """Tesseract OCR with OpenCV preprocessing and line-level result details."""

    _instance: Optional["OCRService"] = None

    def __new__(cls) -> "OCRService":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._configure()
        return cls._instance

    def _configure(self) -> None:
        """Set the executable configured by the operator; no machine path is assumed."""
        pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

    def _tessdata_config(self) -> str:
        tessdata_dir = settings.resolved_tessdata_dir
        if tessdata_dir:
            return f'--tessdata-dir "{tessdata_dir}"'
        return ""

    def _available_languages(self) -> set[str]:
        try:
            return set(pytesseract.get_languages(config=self._tessdata_config()))
        except TesseractNotFoundError as exc:
            logger.error("Tesseract executable '%s' was not found", settings.TESSERACT_CMD)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=("Tesseract OCR is not installed or could not be found. "
                        "Install Tesseract and set TESSERACT_CMD if it is outside PATH."),
            ) from exc
        except TesseractError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Could not read Tesseract language data: {exc}",
            ) from exc

    def get_language(self, language: Optional[str] = None) -> Tuple[str, str]:
        """Return the Tesseract language code and canonical API language label."""
        lang = (language or settings.TESSERACT_LANG).strip().lower().replace("_", "+")
        language_map = {
            "en": (settings.TESSERACT_LANG_ENGLISH, "en"),
            "english": (settings.TESSERACT_LANG_ENGLISH, "en"),
            "eng": (settings.TESSERACT_LANG_ENGLISH, "en"),
            "km": (settings.TESSERACT_LANG_KHMER, "km"),
            "khmer": (settings.TESSERACT_LANG_KHMER, "km"),
            "khm": (settings.TESSERACT_LANG_KHMER, "km"),
            "km+en": (settings.TESSERACT_LANG_MIXED, "km+en"),
            "en+km": (settings.TESSERACT_LANG_MIXED, "km+en"),
            "khm+eng": (settings.TESSERACT_LANG_MIXED, "km+en"),
            "eng+khm": (settings.TESSERACT_LANG_MIXED, "km+en"),
            "mixed": (settings.TESSERACT_LANG_MIXED, "km+en"),
        }
        if lang not in language_map:
            supported = ", ".join(settings.SUPPORTED_LANGUAGES)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported language '{language}'. Supported languages: {supported}",
            )

        tesseract_lang, canonical = language_map[lang]
        available = self._available_languages()
        missing = [code for code in tesseract_lang.split("+") if code not in available]
        if missing:
            if settings.TESSERACT_LANG_KHMER in missing:
                detail = ("Khmer language data ('khm') is missing. Install the Tesseract Khmer "
                          "traineddata package or set TESSDATA_DIR to a directory containing khm.traineddata.")
            elif settings.TESSERACT_LANG_ENGLISH in missing:
                detail = ("English language data ('eng') is missing. Install the Tesseract English "
                          "traineddata package or set TESSDATA_DIR to a directory containing eng.traineddata.")
            else:
                detail = f"Tesseract language data is missing: {', '.join(missing)}."
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=detail)
        return tesseract_lang, canonical

    @staticmethod
    def preprocess_image(image_bytes: bytes) -> np.ndarray:
        """Decode and prepare a page using grayscale, denoising, thresholding and scaling."""
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Uploaded image is empty.")
        image = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
        if image is None or image.size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not decode image. Please upload a valid, non-corrupted image.",
            )

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        denoised = cv2.fastNlMeansDenoising(
            gray, None, h=settings.OCR_DENOISE_STRENGTH, templateWindowSize=7, searchWindowSize=21
        )
        height = denoised.shape[0]
        target_height = max(1, settings.OCR_TARGET_HEIGHT)
        scale = min(3.0, target_height / height) if height < target_height else 1.0
        if scale != 1.0:
            denoised = cv2.resize(
                denoised, None, fx=scale, fy=scale,
                interpolation=cv2.INTER_CUBIC if scale > 1 else cv2.INTER_AREA,
            )

        # Adaptive threshold handles uneven page lighting while preserving Khmer marks.
        block_size = max(3, min(41, (min(denoised.shape[:2]) // 30) | 1))
        return cv2.adaptiveThreshold(
            denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, block_size, 11
        )

    @staticmethod
    def _format_details(data: Dict[str, List[Any]]) -> List[Dict[str, Any]]:
        """Group Tesseract word output into lines while retaining response box shape."""
        grouped: Dict[tuple, Dict[str, Any]] = {}
        count = len(data.get("text", []))
        for i in range(count):
            word = str(data["text"][i]).strip()
            try:
                confidence = float(data["conf"][i])
            except (TypeError, ValueError):
                continue
            if not word or confidence < 0:
                continue
            key = tuple(data[name][i] for name in ("page_num", "block_num", "par_num", "line_num"))
            left, top = int(data["left"][i]), int(data["top"][i])
            right, bottom = left + int(data["width"][i]), top + int(data["height"][i])
            if key not in grouped:
                grouped[key] = {"words": [], "confidence": [], "left": left, "top": top,
                                "right": right, "bottom": bottom}
            line = grouped[key]
            line["words"].append(word)
            line["confidence"].append(confidence / 100.0)
            line["left"] = min(line["left"], left)
            line["top"] = min(line["top"], top)
            line["right"] = max(line["right"], right)
            line["bottom"] = max(line["bottom"], bottom)

        details = []
        for line in grouped.values():
            x1, y1, x2, y2 = line["left"], line["top"], line["right"], line["bottom"]
            details.append({
                "text": " ".join(line["words"]),
                "confidence": round(sum(line["confidence"]) / len(line["confidence"]), 4),
                "box": [[x1, y1], [x2, y1], [x2, y2], [x1, y2]],
            })
        return details

    def extract_text(
        self,
        document_id: str,
        filename: str,
        image_bytes: bytes,
        language: Optional[str] = None,
    ) -> Dict[str, Any]:
        start_time = time.perf_counter()
        tesseract_language, canonical_language = self.get_language(language)
        processed = self.preprocess_image(image_bytes)
        config = f"--psm {settings.TESSERACT_PSM} {self._tessdata_config()}".strip()
        try:
            data = pytesseract.image_to_data(
                processed, lang=tesseract_language, config=config, output_type=Output.DICT
            )
        except TesseractNotFoundError as exc:
            raise HTTPException(
                status_code=503,
                detail="Tesseract OCR is not installed or could not be found. Install it and configure TESSERACT_CMD.",
            ) from exc
        except TesseractError as exc:
            logger.exception("Tesseract failed for document %s", document_id)
            raise HTTPException(status_code=500, detail=f"Tesseract OCR processing failed: {exc}") from exc
        except Exception as exc:
            logger.exception("OCR inference failed for document %s", document_id)
            raise HTTPException(
                status_code=500, detail="OCR processing encountered an unexpected error."
            ) from exc

        details = self._format_details(data)
        if not details:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="No text was detected in the image. Try a clearer, higher-resolution image.",
            )
        confidence = round(sum(item["confidence"] for item in details) / len(details), 4)
        return {
            "document_id": document_id,
            "filename": filename,
            "extracted_text": "\n".join(item["text"] for item in details),
            "confidence": confidence,
            "language": canonical_language,
            "status": "completed",
            "processing_time": round(time.perf_counter() - start_time, 4),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "details": details,
        }


ocr_service = OCRService()
