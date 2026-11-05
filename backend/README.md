# QuickOCR - Backend API

A lightweight, modular, and fast Optical Character Recognition (OCR) backend built with **FastAPI**, **EasyOCR**, and **OpenCV**, designed to pair seamlessly with a Next.js frontend.

---

## 🚀 Features

- **Image Upload & Validation**: Supports PNG, JPG, JPEG, and WEBP formats with a 10MB size limit and UUID generation.
- **OCR Text Extraction**: Powered by EasyOCR with single-instance initialization and OpenCV preprocessing.
- **Multilingual Support**: Supports English (`en`) out of the box, with built-in extensibility for Khmer (`km`) via custom model weights.
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
│   │   ├── ocr_service.py       # EasyOCR singleton reader & OpenCV preprocessing
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
│   └── models/                  # Custom OCR model weights (e.g. Khmer)
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
# Install PyTorch (CPU optimized)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Install FastAPI, EasyOCR, OpenCV, and other requirements
pip install -r requirements.txt
```

*(Note: On first run, EasyOCR will automatically download standard detection and recognition models into `~/.EasyOCR/model/`)*.

### 4. Configure Environment Variables (Optional)

Copy `.env.example` to `.env` if you wish to customize CORS origins, server port, or GPU settings:

```bash
cp .env.example .env
```

Default `.env` settings:
```env
PROJECT_NAME="QuickOCR API"
VERSION="1.0.0"
API_PREFIX="/api"
CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
DEFAULT_LANGUAGE="en"
OCR_GPU=false
```

### 5. Start the Development Server

From the `backend` directory, run:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API is now running at:
- **API Base URL**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

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
    "supported_languages": ["en", "km"]
  }
  ```

---

### 2. Upload Image & Extract Text
- **Endpoint**: `POST /api/ocr/extract`
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `file`: Image file (PNG, JPG, JPEG, WEBP, max 10MB) [Required]
  - `language`: `en` (default) or `km` [Optional]
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

## 🇰🇭 Khmer Language Support

EasyOCR provides native pre-trained weights for 80+ Latin and Asian languages. Khmer (`km`) uses a distinct script with stacked diacritics and sub-consonants, which requires custom recognition weights:

1. Place your trained model file (`km.pth`) and model configuration (`km.yaml`) inside `backend/storage/models/`.
2. When starting up, the service automatically detects `backend/storage/models/km.pth` and initializes the Khmer reader.
3. Pass `language="km"` in `POST /api/ocr/extract` to extract Khmer text.
4. If no custom model is installed and `km` is requested, the API returns a friendly `400 Bad Request` explaining where to place the weights, without crashing the server.

---

## 🔒 Error Handling & Status Codes

| Status Code | Meaning | Example Scenario |
|:---|:---|:---|
| **200 OK** | Success | Health check, fetch history, get document, delete document |
| **201 Created** | Created | Successful OCR image extraction |
| **400 Bad Request** | Client error | Unsupported file extension (e.g. `.gif`, `.pdf`), invalid image bytes |
| **404 Not Found** | Resource not found | Document UUID does not exist |
| **413 Content Too Large** | Payload too large | Uploaded file exceeds 10MB |
| **500 Server Error** | Internal error | Generic error message returned to client; internal tracebacks are masked |
