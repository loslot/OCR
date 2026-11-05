from typing import List, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Schema for health check response."""

    status: str = Field(..., description="Service status", examples=["ok"])
    service: str = Field(..., description="Service name", examples=["QuickOCR API"])
    version: str = Field(..., description="Service version", examples=["1.0.0"])
    supported_languages: List[str] = Field(
        ..., description="Supported OCR languages", examples=[["en", "km"]]
    )


class OCRLineDetail(BaseModel):
    """Schema for individual line / bounding box detection detail."""

    text: str = Field(..., description="Detected text segment")
    confidence: float = Field(..., description="Confidence score for this segment (0.0 - 1.0)")
    box: Optional[List[List[int]]] = Field(
        default=None, description="Bounding polygon coordinates [[x1, y1], [x2, y2], ...]"
    )


class OCRResponse(BaseModel):
    """Schema for OCR extraction result."""

    document_id: str = Field(..., description="Unique UUID for the document")
    filename: str = Field(..., description="Original filename of the uploaded image")
    extracted_text: str = Field(..., description="Complete extracted text")
    confidence: float = Field(..., description="Average confidence score (0.0 - 1.0)")
    language: str = Field(..., description="OCR language used")
    status: str = Field(..., description="Processing status (e.g. 'completed', 'failed')")
    processing_time: float = Field(..., description="Processing duration in seconds")
    created_at: str = Field(..., description="ISO 8601 timestamp of extraction")
    details: Optional[List[OCRLineDetail]] = Field(
        default=None, description="Detailed list of detected text segments"
    )


class HistoryResponse(BaseModel):
    """Schema for list of OCR history results."""

    total: int = Field(..., description="Total number of stored documents")
    items: List[OCRResponse] = Field(..., description="List of previous OCR results")


class DeleteResponse(BaseModel):
    """Schema for document deletion response."""

    document_id: str = Field(..., description="UUID of the deleted document")
    message: str = Field(..., description="Status message")
    success: bool = Field(..., description="Deletion success flag")


class ErrorResponse(BaseModel):
    """Standardized error response schema."""

    detail: str = Field(..., description="Error message detail")
