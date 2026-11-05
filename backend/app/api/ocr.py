from typing import Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.schemas.ocr_schema import (
    DeleteResponse,
    ErrorResponse,
    HistoryResponse,
    OCRResponse,
)
from app.core.config import settings
from app.services.file_service import file_service
from app.services.ocr_service import ocr_service

router = APIRouter(prefix="/ocr", tags=["OCR"])


@router.post(
    "/extract",
    response_model=OCRResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload image and extract text",
    description="Accepts an image file (PNG, JPG, JPEG, WEBP up to 10MB) and extracts text using Tesseract OCR.",
    responses={
        400: {"model": ErrorResponse, "description": "Invalid file format or unsupported language"},
        413: {"model": ErrorResponse, "description": "File size exceeds 10MB"},
        422: {"model": ErrorResponse, "description": "Image contains no recognized text"},
        500: {"model": ErrorResponse, "description": "Internal OCR processing error"},
        503: {"model": ErrorResponse, "description": "Tesseract or requested language data is unavailable"},
    },
)
async def extract_text_from_image(
    file: UploadFile = File(..., description="Image file to process"),
    language: Optional[str] = Form(
        None,
        description="OCR language: 'en', 'km', or 'km+en' for mixed Khmer and English",
    ),
) -> OCRResponse:
    """Upload an image file, store it locally, run Tesseract with OpenCV

    preprocessing, and save the result JSON.
    """
    lang = (language or settings.TESSERACT_LANG).strip().lower()

    # 1. Validate file format and size
    filename, file_bytes = await file_service.validate_and_read_image(file)

    # 2. Generate unique document UUID
    document_id = file_service.generate_document_id()

    # 3. Save uploaded image to storage/uploads/
    file_service.save_upload_file(document_id, filename, file_bytes)

    # 4. Perform text extraction
    ocr_result = ocr_service.extract_text(
        document_id=document_id,
        filename=filename,
        image_bytes=file_bytes,
        language=lang,
    )

    # 5. Save OCR results to storage/results/{document_id}.json
    file_service.save_result(document_id, ocr_result)

    return OCRResponse(**ocr_result)


@router.get(
    "/history",
    response_model=HistoryResponse,
    summary="Retrieve previous OCR results",
    description="Returns a list of all previously processed documents ordered by most recent first.",
)
def get_ocr_history() -> HistoryResponse:
    """Retrieve history of all processed OCR documents from local JSON storage."""
    records = file_service.list_history()
    items = [OCRResponse(**rec) for rec in records]
    return HistoryResponse(total=len(items), items=items)


@router.get(
    "/{document_id}",
    response_model=OCRResponse,
    summary="Get document OCR result",
    description="Retrieves a specific document's OCR result by document_id.",
    responses={
        404: {"model": ErrorResponse, "description": "Document not found"},
    },
)
def get_document_by_id(document_id: str) -> OCRResponse:
    """Retrieve a single document's OCR result JSON by its UUID."""
    record = file_service.get_result(document_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' was not found.",
        )
    return OCRResponse(**record)


@router.delete(
    "/{document_id}",
    response_model=DeleteResponse,
    summary="Delete document and files",
    description="Deletes the document's OCR result JSON and its corresponding uploaded image.",
    responses={
        404: {"model": ErrorResponse, "description": "Document not found"},
    },
)
def delete_document_by_id(document_id: str) -> DeleteResponse:
    """Delete a document by UUID, removing both the image file and the result JSON."""
    deleted = file_service.delete_document(document_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' was not found.",
        )
    return DeleteResponse(
        document_id=document_id,
        message=f"Document '{document_id}' and associated files were deleted successfully.",
        success=True,
    )
