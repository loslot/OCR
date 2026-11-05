# QuickOCR - Backend API

A lightweight, modular Optical Character Recognition (OCR) backend built with **FastAPI**, **Tesseract OCR**, and **OpenCV**, designed to pair seamlessly with a Next.js frontend.

---

## 🚀 Features

- **Image Upload & Validation**: Supports PNG, JPG, JPEG, and WEBP formats with a 10MB size limit and UUID generation.
- **OCR Text Extraction**: Powered by Tesseract with grayscale conversion, denoising, thresholding, and resizing.
- **Multilingual Support**: Supports English (`en`), Khmer (`km`), and mixed Khmer/English (`km+en`) using Tesseract traineddata.
- **File-Based Storage**: Completely database-free! Stores images in `storage/uploads/` and metadata/results in `storage/results/` as JSON.
- **RESTful Endpoints**: Full CRUD endpoints for document upload, extraction, history, retrieval, and deletion.
- **Next.js Ready**: Pre-configured CORS for Next.js frontend running on `http://localhost:3000`.
- **Interactive Documentation**: Swagger UI automatically available at `/docs`.

---

## 📂 Project Structure

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI application entry point, CORS & lifespan
│   ├── api/
│   │   ├── __init__.py
│   │   └── ocr.py               # REST API endpoints (/extract, /history, /{id}, DELETE)
│   ├── services/
│   │   ├── __init__.py
│   │   ├── ocr_service.py       # Tesseract invocation & OpenCV preprocessing
│   │   └── file_service.py      # File validation, uploads, and JSON storage
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── ocr_schema.py        # Pydantic request and response schemas
│   └── core/
│       ├── __init__.py
│       └── config.py            # Application settings & environment configurations
├── storage/
│   ├── uploads/                 # Uploaded image files
│   ├── results/                 # Extracted OCR results (JSON format)
├── .env.example                 # Environment variables template
├── .gitignore
├── requirements.txt             # Python project dependencies
└── README.md                    # Setup and usage documentation
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Python**: Python 3.10 – 3.12 is recommended.
- **pip** or **uv** package manager.
- **Tesseract OCR 5** with English and Khmer traineddata installed separately from Python packages.

Install Tesseract and language data with your OS package manager:

**Debian / Ubuntu:**
```bash
sudo apt update
sudo apt install tesseract-ocr tesseract-ocr-eng tesseract-ocr-khm
```

**macOS (Homebrew):**
```bash
brew install tesseract
brew install tesseract-lang
```

On Windows, install Tesseract using the [official installation guidance](https://github.com/tesseract-ocr/tessdoc/blob/main/Installation.md), then add `eng.traineddata` and `khm.traineddata` to its tessdata folder. The same official guide has install notes for other Linux distributions. Verify with `tesseract --list-langs`; both `eng` and `khm` must be listed. If the executable is outside `PATH`, set `TESSERACT_CMD`; set `TESSDATA_DIR` to the folder containing traineddata files when needed. The language pack names above follow the [Tesseract installation guide](https://github.com/tesseract-ocr/tessdoc/blob/main/Installation.md).

### 2. Create a Virtual Environment

Navigate into the `backend` folder:

```bash
cd backend
```

Create and activate a virtual environment:

**On Linux / macOS:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

**On Windows (Command Prompt / PowerShell):**
```bash
python -m venv .venv
.\.venv\Scripts\activate
```

*(Optional using uv for ultra-fast setup)*:
```bash
uv venv .venv --python 3.12
source .venv/bin/activate
```

### 3. Install Dependencies

For standard CPU execution (recommended for laptops / general servers):
```bash
# Install FastAPI, pytesseract, OpenCV, and other requirements
pip install -r requirements.txt
```

### 4. Configure Environment Variables (Optional)

Copy `.env.example` to `.env` if you wish to customize CORS origins or OCR settings:

```bash
cp .env.example .env
```

Default `.env` settings:
```env
PROJECT_NAME="QuickOCR API"
VERSION="1.0.0"
API_PREFIX="/api"
CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
TESSERACT_LANG="khm+eng"
TESSERACT_CMD="/usr/bin/tesseract"
# TESSDATA_DIR="/path/to/tessdata" # optional
TESSERACT_LANG_ENGLISH="eng"
TESSERACT_LANG_KHMER="khm"
TESSERACT_LANG_MIXED="khm+eng"
TESSERACT_PSM=6
OCR_DENOISE_STRENGTH=10
OCR_TARGET_HEIGHT=1800
```

### 5. Start the Development Server

From the `backend` directory, run:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8002
```

The API is now running at:
- **API Base URL**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

### Deploy on Render

This repository includes a root-level `render.yaml` Blueprint and `backend/Dockerfile`. In Render, create a Blueprint from the repository root. The service uses the free plan, builds the backend Docker image, and checks `/api/health`. The image installs Tesseract with English and Khmer traineddata and fails its build if either language is missing. The Blueprint sets `TESSERACT_LANG=khm+eng`, `TESSERACT_CMD=/usr/bin/tesseract`, and open CORS for the public, unauthenticated API. The container listens on Render's `$PORT`.

After Render deploys, copy the backend's `https://...onrender.com` URL into the frontend host's build environment as `NEXT_PUBLIC_API_URL`, then rebuild/redeploy the frontend. The frontend must use the deployed URL in production; its `localhost:8001` fallback is for local development.

For local development without installing system OCR packages, run the Docker image on port 8001:

```bash
docker build -t quickocr-backend ./backend
docker run -d --name quickocr-backend-local --restart unless-stopped \\
  -p 127.0.0.1:8001:8000 \\
  -e TESSERACT_LANG=khm+eng \\
  -e TESSERACT_CMD=/usr/bin/tesseract \\
  quickocr-backend
```

---

## 📡 API Endpoints Reference

### 1. Health Check
- **Endpoint**: `GET /api/health`
- **Description**: Verifies that the service is running and returns supported languages.
- **Example cURL**:
  ```bash
  curl -X GET http://localhost:8000/api/health
  ```
- **Response** (`200 OK`):
  ```json
  {
    "status": "ok",
    "service": "QuickOCR API",
    "version": "1.0.0",
    "supported_languages": ["en", "km", "km+en"]
  }
  ```

---

### 2. Upload Image & Extract Text
- **Endpoint**: `POST /api/ocr/extract`
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `file`: Image file (PNG, JPG, JPEG, WEBP, max 10MB) [Required]
  - `language`: `en` (default), `km`, or `km+en` [Optional]. `khm+eng` is also accepted.
- **Example cURL**:
  ```bash
  curl -X POST http://localhost:8000/api/ocr/extract \
    -F "file=@/path/to/receipt.png" \
    -F "language=en"
  ```
- **Response** (`201 Created`):
  ```json
  {
    "document_id": "4bf433d7-213c-4cf2-83ee-b36c64bc2a8b",
    "filename": "receipt.png",
    "extracted_text": "TOTAL $42.50\nTHANK YOU FOR SHOPPING",
    "confidence": 0.9421,
    "language": "en",
    "status": "completed",
    "processing_time": 0.3541,
    "created_at": "2026-11-04T13:15:00.000000+00:00",
    "details": [
      {
        "text": "TOTAL $42.50",
        "confidence": 0.9612,
        "box": [[25, 40], [250, 40], [250, 75], [25, 75]]
      },
      {
        "text": "THANK YOU FOR SHOPPING",
        "confidence": 0.9230,
        "box": [[25, 90], [380, 90], [380, 120], [25, 120]]
      }
    ]
  }
  ```

---

### 3. Retrieve Extraction History
- **Endpoint**: `GET /api/ocr/history`
- **Description**: Returns all saved document OCR records ordered by newest first.
- **Example cURL**:
  ```bash
  curl -X GET http://localhost:8000/api/ocr/history
  ```
- **Response** (`200 OK`):
  ```json
  {
    "total": 1,
    "items": [
      {
        "document_id": "4bf433d7-213c-4cf2-83ee-b36c64bc2a8b",
        "filename": "receipt.png",
        "extracted_text": "TOTAL $42.50\nTHANK YOU FOR SHOPPING",
        "confidence": 0.9421,
        "language": "en",
        "status": "completed",
        "processing_time": 0.3541,
        "created_at": "2026-11-04T13:15:00.000000+00:00"
      }
    ]
  }
  ```

---

### 4. Get a Single Document by ID
- **Endpoint**: `GET /api/ocr/{document_id}`
- **Description**: Returns the OCR result for the specified UUID.
- **Example cURL**:
  ```bash
  curl -X GET http://localhost:8000/api/ocr/4bf433d7-213c-4cf2-83ee-b36c64bc2a8b
  ```
- **Response** (`200 OK` or `404 Not Found` if not found):
  ```json
  {
    "document_id": "4bf433d7-213c-4cf2-83ee-b36c64bc2a8b",
    "filename": "receipt.png",
    "extracted_text": "TOTAL $42.50\nTHANK YOU FOR SHOPPING",
    "confidence": 0.9421,
    "language": "en",
    "status": "completed",
    "processing_time": 0.3541,
    "created_at": "2026-11-04T13:15:00.000000+00:00"
  }
  ```

---

### 5. Delete a Document
- **Endpoint**: `DELETE /api/ocr/{document_id}`
- **Description**: Permanently deletes the document's uploaded image and its result JSON.
- **Example cURL**:
  ```bash
  curl -X DELETE http://localhost:8000/api/ocr/4bf433d7-213c-4cf2-83ee-b36c64bc2a8b
  ```
- **Response** (`200 OK` or `404 Not Found`):
  ```json
  {
    "document_id": "4bf433d7-213c-4cf2-83ee-b36c64bc2a8b",
    "message": "Document '4bf433d7-213c-4cf2-83ee-b36c64bc2a8b' and associated files were deleted successfully.",
    "success": true
  }
  ```

---

## OCR languages and preprocessing

The frontend's existing `en` and `km` controls remain valid. `en` selects English only; `km` selects Khmer only; send `km+en` for mixed documents. The API also accepts `khm+eng`. Configure Tesseract model codes with `TESSERACT_LANG_ENGLISH`, `TESSERACT_LANG_KHMER`, and `TESSERACT_LANG_MIXED`.

`TESSERACT_PSM=6` treats an image as a uniform text block. Set it to another Tesseract page segmentation mode for different layouts. `OCR_DENOISE_STRENGTH` adjusts noise reduction and `OCR_TARGET_HEIGHT` controls upscaling for small images. Recognition quality depends on image quality, layout, and installed traineddata; accuracy is not guaranteed.

Missing Tesseract or language data returns a clear `503` error. Invalid/corrupted images return `400`, and images with no recognized text return `422`.

## Tests

Install the test-only HTTP client and run the backend unit and API integration tests from `backend/`:

```bash
pip install -r requirements-dev.txt
python -m unittest discover -s tests -v
```

---

## 🔒 Error Handling & Status Codes

| Status Code | Meaning | Example Scenario |
|:---|:---|:---|
| **200 OK** | Success | Health check, fetch history, get document, delete document |
| **201 Created** | Created | Successful OCR image extraction |
| **400 Bad Request** | Client error | Unsupported file extension (e.g. `.gif`, `.pdf`), invalid image bytes |
| **422 Unprocessable Entity** | No recognized text | Image is valid but Tesseract found no text |
| **404 Not Found** | Resource not found | Document UUID does not exist |
| **413 Content Too Large** | Payload too large | Uploaded file exceeds 10MB |
| **503 Service Unavailable** | OCR dependency missing | Tesseract executable or requested language data is unavailable |
| **500 Server Error** | Internal error | Generic error message returned to client; internal tracebacks are masked |
