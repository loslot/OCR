import json
import os
import re
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from fastapi import HTTPException, UploadFile, status

from app.core.config import settings


class FileService:
    """Service to handle local file uploads, validation, and JSON result storage.."""

    @staticmethod
    def generate_document_id() -> str:
        """Generate a unique UUID4 string for a document."""
        return str(uuid.uuid4())

    @staticmethod
    def sanitize_filename(filename: Optional[str]) -> str:
        """Sanitize a filename to prevent directory traversal or invalid characters."""
        if not filename:
            return "uploaded_image.png"
        # Extract base name to avoid path traversal
        clean_name = os.path.basename(filename)
        # Remove any character that isn't alphanumeric, dot, underscore, or dash
        clean_name = re.sub(r"[^\w\-.]", "_", clean_name)
        # Ensure it's not empty
        return clean_name or "uploaded_image.png"

    @classmethod
    async def validate_and_read_image(cls, file: UploadFile) -> Tuple[str, bytes]:
        """Validate uploaded file type, MIME type, and size (<= 10MB).

        Returns:
            Tuple[str, bytes]: Sanitized original filename and file content bytes.
        """
        original_filename = file.filename or ""
        clean_filename = cls.sanitize_filename(original_filename)
        file_ext = Path(clean_filename).suffix.lower()

        # Validate file extension
        if file_ext not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Unsupported file format '{file_ext}'. Allowed formats: "
                    f"{', '.join(sorted(settings.ALLOWED_EXTENSIONS))}"
                ),
            )

        # Validate MIME content-type (if provided)
        if file.content_type and file.content_type.lower() not in settings.ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Invalid content type '{file.content_type}'. Must be one of: "
                    f"{', '.join(sorted(settings.ALLOWED_MIME_TYPES))}"
                ),
            )

        # Read content and enforce max file size
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty.",
            )

        if len(content) > settings.MAX_FILE_SIZE_BYTES:
            max_mb = settings.MAX_FILE_SIZE_BYTES // (1024 * 1024)
            # Use 413 Content Too Large (compatible with both older and newer Starlette)
            status_code = getattr(status, "HTTP_413_CONTENT_TOO_LARGE", 413)
            raise HTTPException(
                status_code=status_code,
                detail=f"File size exceeds the maximum limit of {max_mb}MB.",
            )

        return clean_filename, content

    @classmethod
    def save_upload_file(cls, document_id: str, filename: str, content: bytes) -> Path:
        """Save uploaded image bytes to storage/uploads/{document_id}_{filename}."""
        target_name = f"{document_id}_{filename}"
        target_path = settings.UPLOAD_DIR / target_name
        target_path.write_bytes(content)
        return target_path

    @classmethod
    def save_result(cls, document_id: str, result_data: Dict[str, Any]) -> Path:
        """Save OCR result dictionary to storage/results/{document_id}.json."""
        target_path = settings.RESULTS_DIR / f"{document_id}.json"
        with open(target_path, "w", encoding="utf-8") as f:
            json.dump(result_data, f, indent=2, ensure_ascii=False)
        return target_path

    @classmethod
    def get_result(cls, document_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve OCR result JSON for a given document_id."""
        result_path = settings.RESULTS_DIR / f"{document_id}.json"
        if not result_path.exists() or not result_path.is_file():
            return None

        try:
            with open(result_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError):
            return None

    @classmethod
    def list_history(cls) -> List[Dict[str, Any]]:
        """Retrieve all previous OCR results, ordered by most recent first."""
        history: List[Dict[str, Any]] = []

        if not settings.RESULTS_DIR.exists():
            return history

        for file_path in settings.RESULTS_DIR.glob("*.json"):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    history.append(data)
            except (json.JSONDecodeError, OSError):
                continue

        # Sort history by created_at descending (newest first)
        history.sort(
            key=lambda x: x.get("created_at", ""),
            reverse=True,
        )
        return history

    @classmethod
    def delete_document(cls, document_id: str) -> bool:
        """Delete document JSON and its associated uploaded image file(s)."""
        result_path = settings.RESULTS_DIR / f"{document_id}.json"
        if not result_path.exists():
            return False

        # Attempt to delete associated uploaded image file(s)
        matching_uploads = list(settings.UPLOAD_DIR.glob(f"{document_id}_*"))
        for upload_file in matching_uploads:
            try:
                upload_file.unlink(missing_ok=True)
            except OSError:
                pass

        # Delete JSON result file
        try:
            result_path.unlink(missing_ok=True)
            return True
        except OSError:
            return False


file_service = FileService()
