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
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
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
    DEFAULT_LANGUAGE: str = "en"
    SUPPORTED_LANGUAGES: List[str] = ["en", "km", "km+en"]
    TESSERACT_CMD: str = "tesseract"
    TESSDATA_DIR: Optional[Path] = None
    TESSERACT_LANG_ENGLISH: str = "eng"
    TESSERACT_LANG_KHMER: str = "khm"
    TESSERACT_LANG_MIXED: str = "khm+eng"
    TESSERACT_PSM: int = 6
    OCR_DENOISE_STRENGTH: int = 10
    OCR_TARGET_HEIGHT: int = 1800

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

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
