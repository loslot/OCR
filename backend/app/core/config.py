import os
from pathlib import Path
from typing import List, Optional, Set, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration settings."""

    # Project Information
    PROJECT_NAME: str = "QuickOCR API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    # CORS Settings (Next.js frontend support)
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://ocr-g3tg.vercel.app",
    ]

    # Storage Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    STORAGE_DIR: Path = BASE_DIR / "storage"
    UPLOAD_DIR: Path = STORAGE_DIR / "uploads"
    RESULTS_DIR: Path = STORAGE_DIR / "results"

    # Upload Constraints (Maximum 10MB)
    MAX_FILE_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB
    ALLOWED_EXTENSIONS: Set[str] = {".png", ".jpg", ".jpeg", ".webp"}
    ALLOWED_MIME_TYPES: Set[str] = {
        "image/png",
        "image/jpeg",
        "image/pjpeg",
        "image/webp",
    }

    # OCR Settings
    TESSERACT_LANG: str = os.getenv("TESSERACT_LANG", "khm+eng")
    SUPPORTED_LANGUAGES: List[str] = ["en", "km", "km+en"]
    TESSERACT_CMD: str = os.getenv("TESSERACT_CMD", "tesseract")
    TESSDATA_DIR: Optional[Path] = None
    TESSERACT_LANG_ENGLISH: str = "eng"
    TESSERACT_LANG_KHMER: str = "khm"
    TESSERACT_LANG_MIXED: str = "khm+eng"
    TESSERACT_PSM: int = 6
    OCR_DENOISE_STRENGTH: int = 10
    OCR_TARGET_HEIGHT: int = 1800

    @property
    def resolved_tessdata_dir(self) -> Optional[str]:
        """Resolve tessdata directory from env or local repository directory."""
        if self.TESSDATA_DIR and Path(self.TESSDATA_DIR).is_dir():
            return str(self.TESSDATA_DIR)
        local_tessdata = self.BASE_DIR / "tessdata"
        if local_tessdata.is_dir() and any(local_tessdata.glob("*.traineddata")):
            return str(local_tessdata)
        return None

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                try:
                    import json
                    parsed = json.loads(v)
                    if isinstance(parsed, list):
                        v = parsed
                except Exception:
                    pass
            if isinstance(v, str):
                origins = [origin.strip() for origin in v.split(",") if origin.strip()]
            else:
                origins = v
        elif isinstance(v, (list, tuple, set)):
            origins = list(v)
        else:
            origins = []

        # Normalize trailing slashes and ensure distinct values
        normalized: List[str] = []
        for origin in origins:
            if not isinstance(origin, str):
                continue
            cleaned = origin.strip().rstrip("/")
            if cleaned and cleaned not in normalized:
                normalized.append(cleaned)

        # Retain production frontend and localhost for reliable communication
        if "*" not in normalized:
            for required in [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "https://ocr-g3tg.vercel.app",
            ]:
                if required not in normalized:
                    normalized.append(required)

        return normalized

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()

# Ensure required storage directories exist
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.RESULTS_DIR.mkdir(parents=True, exist_ok=True)
