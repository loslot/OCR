# REST API Specification & Endpoint Contracts

This document details the complete REST API specification for the QuickOCR backend service.

**Base URL (Production)**: `https://ocr-6slt.onrender.com`  
**Base URL (Local)**: `http://localhost:8000` (or `http://localhost:8001`)  
**Prefix**: `/api`

---

## 1. System Health Check

### `GET /api/health`

Verifies backend service availability and reports supported OCR language models.

#### Request
```http
GET /api/health HTTP/1.1
Host: ocr-6slt.onrender.com
```

#### Response (`200 OK`)
```json
{
  "status": "ok",
  "service": "QuickOCR API",
  "version": "1.0.0",
  "supported_languages": ["en", "km", "km+en"]
}
```

---

## 2. Ingest Image & Extract Text

### `POST /api/ocr/extract`

Accepts an image file via `multipart/form-data`, validates dimensions and format, applies OpenCV filters, runs Tesseract OCR, and persists the result JSON.

#### Request Parameters
- `file` (binary, required): Image file (PNG, JPG, JPEG, WEBP up to 10MB).
- `language` (form string, optional): `en` (default), `km`, or `km+en`.

#### Example Request (`curl`)
```bash
curl -X POST https://ocr-6slt.onrender.com/api/ocr/extract \
  -H "Origin: https://ocr-g3tg.vercel.app" \
  -F "file=@receipt.png;type=image/png" \
  -F "language=km+en"
```

#### Response (`201 Created`)
```json
{
  "document_id": "c1f7b884-2114-41b2-bf91-92518e382b6b",
  "filename": "receipt.png",
  "extracted_text": "TOTAL: $24.50\nTHANK YOU",
  "confidence": 0.952,
  "language": "km+en",
  "status": "completed",
  "processing_time": 0.412,
  "created_at": "2026-11-07T07:20:00.000000+00:00",
  "details": [
    {
      "text": "TOTAL: $24.50",
      "confidence": 0.965,
      "box": [[10, 20], [180, 20], [180, 50], [10, 50]]
    },
    {
      "text": "THANK YOU",
      "confidence": 0.939,
      "box": [[10, 60], [150, 60], [150, 90], [10, 90]]
    }
  ]
}
```

#### Error Responses
- `400 Bad Request`: Empty image, unsupported file extension, or corrupted image bytes.
- `413 Content Too Large`: File exceeds 10MB.
- `422 Unprocessable Content`: Image decoded successfully but contains zero recognized text characters.
- `503 Service Unavailable`: Tesseract binary or requested language traineddata is not installed.

---

## 3. Retrieve Extraction Archive

### `GET /api/ocr/history`

Returns a list of all saved document extraction results, ordered by newest first.

#### Response (`200 OK`)
```json
{
  "total": 1,
  "items": [
    {
      "document_id": "c1f7b884-2114-41b2-bf91-92518e382b6b",
      "filename": "receipt.png",
      "extracted_text": "TOTAL: $24.50\nTHANK YOU",
      "confidence": 0.952,
      "language": "km+en",
      "status": "completed",
      "processing_time": 0.412,
      "created_at": "2026-11-07T07:20:00.000000+00:00",
      "details": [...]
    }
  ]
}
```

---

## 4. Retrieve Document by ID

### `GET /api/ocr/{document_id}`

Retrieves the OCR result and telemetry for a specific document UUID.

#### Response (`200 OK`)
Returns the `OCRResponse` schema identical to the extraction response.

#### Error Response (`404 Not Found`)
```json
{
  "detail": "Document with ID 'non-existent-uuid' was not found."
}
```

---

## 5. Delete Document

### `DELETE /api/ocr/{document_id}`

Deletes the document's JSON record and its uploaded image file from local storage.

#### Response (`200 OK`)
```json
{
  "document_id": "c1f7b884-2114-41b2-bf91-92518e382b6b",
  "message": "Document 'c1f7b884-2114-41b2-bf91-92518e382b6b' and associated files were deleted successfully.",
  "success": true
}
```
