import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Optional
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.ocr import (
    delete_document_by_id,
    extract_text_from_image,
    get_document_by_id,
    get_ocr_history,
    router as ocr_router,
)
from app.core.config import settings
from app.schemas.ocr_schema import (
    DeleteResponse,
    ErrorResponse,
    HealthResponse,
    HistoryResponse,
    OCRResponse,
)

# Configure application logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("quickocr")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan; Tesseract is validated when OCR is requested."""
    logger.info("Starting QuickOCR backend...")
    logger.info("QuickOCR backend startup complete.")
    yield
    logger.info("QuickOCR backend shutting down...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for QuickOCR — local image-to-text extraction using Tesseract OCR and OpenCV.",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Configure CORS for Next.js frontend (production Vercel and local dev)
is_wildcard = "*" in settings.CORS_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"^https://.*\.vercel\.app$" if not is_wildcard else None,
    allow_credentials=not is_wildcard,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS", "HEAD"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,
)


# Exception handler for HTTPException to maintain consistent error schema
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


# Global fallback exception handler: hide internal server errors from client
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception(f"Unhandled error processing request {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."},
    )


# Health check endpoint (serves both /api/health and /health)
@app.get(
    "/health",
    response_model=HealthResponse,
    include_in_schema=False,
)
@app.get(
    f"{settings.API_PREFIX}/health",
    response_model=HealthResponse,
    tags=["System"],
    summary="Check backend health status",
)
def health_check() -> HealthResponse:
    """Returns the operational status, version, and supported languages."""
    return HealthResponse(
        status="ok",
        service=settings.PROJECT_NAME,
        version=settings.VERSION,
        supported_languages=settings.SUPPORTED_LANGUAGES,
    )


# Include standard OCR routes under /api (e.g. /api/ocr/extract, /api/ocr/history)
app.include_router(ocr_router, prefix=settings.API_PREFIX)

# Also mount OCR routes without /api prefix (/ocr/extract, /ocr/history) to avoid 404
app.include_router(ocr_router, include_in_schema=False)


# Direct route aliases for /api/extract and /extract (in case /ocr subpath is omitted)
@app.post(
    f"{settings.API_PREFIX}/extract",
    response_model=OCRResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
@app.post(
    "/extract",
    response_model=OCRResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
async def extract_alias(
    file: UploadFile = File(..., description="Image file to process"),
    language: Optional[str] = Form(None),
) -> OCRResponse:
    """Convenience alias for /api/ocr/extract."""
    return await extract_text_from_image(file=file, language=language)


# Direct route aliases for /api/history and /history
@app.get(
    f"{settings.API_PREFIX}/history",
    response_model=HistoryResponse,
    include_in_schema=False,
)
@app.get(
    "/history",
    response_model=HistoryResponse,
    include_in_schema=False,
)
def history_alias() -> HistoryResponse:
    """Convenience alias for /api/ocr/history."""
    return get_ocr_history()


# Root redirect or greeting for convenience
@app.get("/", include_in_schema=False)
def root_redirect():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "health": f"{settings.API_PREFIX}/health",
    }
