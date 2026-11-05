import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.ocr import router as ocr_router
from app.core.config import settings
from app.schemas.ocr_schema import ErrorResponse, HealthResponse
from app.services.ocr_service import ocr_service

# Configure application logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("quickocr")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan event handler to ensure OCR engine is initialized once at startup."""
    logger.info("Starting QuickOCR backend...")
    # Pre-warm OCR reader singleton
    _ = ocr_service.get_reader("en")
    logger.info("QuickOCR backend startup complete.")
    yield
    logger.info("QuickOCR backend shutting down...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for QuickOCR — lightweight, local image-to-text extraction using EasyOCR and OpenCV.",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Configure CORS for Next.js frontend (http://localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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


# Health check endpoint
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


# Include OCR routes under /api
app.include_router(ocr_router, prefix=settings.API_PREFIX)


# Root redirect or greeting for convenience
@app.get("/", include_in_schema=False)
def root_redirect():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "health": f"{settings.API_PREFIX}/health",
    }
