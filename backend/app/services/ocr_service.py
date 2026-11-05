import logging
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import cv2
import easyocr
import numpy as np
from fastapi import HTTPException, status

from app.core.config import settings

logger = logging.getLogger(__name__)


class OCRService:
    """Service to handle EasyOCR model initialization and text extraction

    with OpenCV image preprocessing.
    """

    _instance: Optional["OCRService"] = None
    _reader_en: Optional[easyocr.Reader] = None
    _reader_km: Optional[easyocr.Reader] = None

    def __new__(cls) -> "OCRService":
        """Singleton pattern: ensure OCRService is created only once."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize_readers()
        return cls._instance

    def _initialize_readers(self) -> None:
        """Initialize EasyOCR reader once at startup."""
        logger.info("Initializing EasyOCR reader (English)...")
        try:
            self._reader_en = easyocr.Reader(
                ["en"],
                gpu=settings.OCR_GPU,
                verbose=False,
            )
            logger.info("EasyOCR English reader loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize EasyOCR reader: {e}")
            raise RuntimeError(f"OCR model initialization failed: {e}")

        # Check if custom Khmer model weights exist
        khmer_model_path = settings.MODELS_DIR / "km.pth"
        if khmer_model_path.exists():
            try:
                logger.info("Custom Khmer model weights found. Initializing Khmer reader...")
                self._reader_km = easyocr.Reader(
                    ["en"],
                    recog_network="km",
                    model_storage_directory=str(settings.MODELS_DIR),
                    user_network_directory=str(settings.MODELS_DIR),
                    gpu=settings.OCR_GPU,
                    verbose=False,
                )
                logger.info("Khmer reader loaded successfully.")
            except Exception as e:
                logger.warning(f"Could not load custom Khmer reader: {e}")
                self._reader_km = None
        else:
            self._reader_km = None

    def get_reader(self, language: str = "en") -> easyocr.Reader:
        """Retrieve the appropriate reader for the requested language."""
        lang = language.lower().strip()
        if lang in ("en", "english"):
            if self._reader_en is None:
                self._initialize_readers()
            return self._reader_en

        if lang in ("km", "khmer"):
            if self._reader_km is not None:
                return self._reader_km
            # If custom Khmer model weights are not installed
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "EasyOCR does not bundle Khmer ('km') natively. "
                    "To enable Khmer OCR, place custom trained 'km.pth' and 'km.yaml' "
                    f"weights into '{settings.MODELS_DIR}'. "
                    "Alternatively, select language='en'."
                ),
            )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported language '{language}'. "
                f"Supported languages: {', '.join(settings.SUPPORTED_LANGUAGES)}"
            ),
        )

    @staticmethod
    def preprocess_image(image_bytes: bytes) -> np.ndarray:
        """Preprocess uploaded image using OpenCV for optimal OCR extraction.

        Applies:
        - Decoding image from memory
        - Conversion to RGB
        - Contrast enhancement / noise reduction if necessary
        """
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not decode image. Please ensure the file is a valid image.",
            )

        # Convert OpenCV BGR format to RGB for EasyOCR
        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # Check resolution; if image is extremely small, resize to improve recognition
        height, width = rgb_img.shape[:2]
        if height < 100 or width < 100:
            scale = max(2.0, 300.0 / min(height, width))
            rgb_img = cv2.resize(
                rgb_img,
                None,
                fx=scale,
                fy=scale,
                interpolation=cv2.INTER_CUBIC,
            )

        return rgb_img

    def extract_text(
        self,
        document_id: str,
        filename: str,
        image_bytes: bytes,
        language: str = "en",
    ) -> Dict[str, Any]:
        """Perform OCR extraction on image bytes and return formatted results."""
        start_time = time.perf_counter()

        # Get the initialized reader
        reader = self.get_reader(language)

        # Preprocess image with OpenCV
        preprocessed = self.preprocess_image(image_bytes)

        # Execute OCR reading
        try:
            raw_results = reader.readtext(preprocessed)
        except Exception as e:
            logger.error(f"OCR inference failed for document {document_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="OCR processing encountered an unexpected error.",
            )

        details: List[Dict[str, Any]] = []
        extracted_lines: List[str] = []
        total_confidence = 0.0

        for item in raw_results:
            bbox, text, conf = item
            clean_text = str(text).strip()
            if not clean_text:
                continue

            float_conf = round(float(conf), 4)
            # Convert bbox coordinates to standard Python int pairs [[x, y], ...]
            formatted_box = [[int(pt[0]), int(pt[1])] for pt in bbox]

            details.append({
                "text": clean_text,
                "confidence": float_conf,
                "box": formatted_box,
            })
            extracted_lines.append(clean_text)
            total_confidence += float_conf

        line_count = len(details)
        avg_confidence = round(total_confidence / line_count, 4) if line_count > 0 else 0.0
        combined_text = "\n".join(extracted_lines)
        processing_time = round(time.perf_counter() - start_time, 4)

        return {
            "document_id": document_id,
            "filename": filename,
            "extracted_text": combined_text,
            "confidence": avg_confidence,
            "language": language,
            "status": "completed",
            "processing_time": processing_time,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "details": details,
        }


# Global service instance initialized once
ocr_service = OCRService()
