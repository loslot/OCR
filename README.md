# QuickOCR // High-Velocity Cyber Neural Optical Engine

A modern, production-ready, full-stack Optical Character Recognition (OCR) web application designed for high accuracy, privacy, and sub-second text extraction. Built with a reactive **Next.js 14 (App Router)** frontend and a high-performance **Python FastAPI** backend powered by **Tesseract OCR 5** and **OpenCV**.

---

## 🌐 Live Deployments

| Component | Platform | URL |
|:---|:---|:---|
| **Frontend** | Vercel | [https://ocr-g3tg.vercel.app](https://ocr-g3tg.vercel.app) |
| **Backend API** | Render | [https://ocr-6slt.onrender.com](https://ocr-6slt.onrender.com) |
| **Interactive API Docs** | Render | [https://ocr-6slt.onrender.com/docs](https://ocr-6slt.onrender.com/docs) |

---

## ⚡ Main Features

- **Multi-Format Ingestion**: Upload or drag-and-drop PNG, JPG, JPEG, and WEBP images up to 10MB.
- **Multilingual Recognition**: Full native support for English (`en`), Khmer (`km`), and mixed Khmer + English (`km+en`).
- **OpenCV Image Processing**: Grayscale conversion, adaptive thresholding, bilateral denoising, and dynamic aspect-ratio scaling.
- **Line & Segment Bounding Boxes**: Isolates words and lines with individual polygon coordinates and confidence scoring.
- **Live Editable Text Buffer**: Edit extracted text in real time with dynamic word and character counts.
- **One-Click Export**: Copy text to clipboard or download formatted `.txt` transcripts.
- **Database-Free Persistence**: Zero database dependency. Document metadata, images, and JSON results persist in local filesystem storage.
- **Cyber-Themed Reactive UI**: Framer Motion smooth animations, responsive mobile navigation, live HUD scanner telemetry, and dark cyber aesthetic.
- **Cold-Start Resilience**: Built-in Render cold-start detection with friendly timers and indicators.
- **Accessibility & Motion Preference**: Full support for `prefers-reduced-motion` and responsive mobile layouts (320px to 4K).

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18, TypeScript 5)
- **State & Data Fetching**: [Redux Toolkit](https://redux-toolkit.js.org/) with [RTK Query](https://redux-toolkit.js.org/rtk-query/overview)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/) with cyber neon palette
- **Animations**: [Framer Motion 14](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Validation**: [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

### Backend
- **Framework**: [FastAPI 0.110+](https://fastapi.tiangolo.com/) (Python 3.12)
- **ASGI Server**: [Uvicorn](https://www.uvicorn.org/) with standard uvloop
- **OCR Engine**: [Tesseract OCR 5](https://github.com/tesseract-ocr/tesseract) via [pytesseract](https://pypi.org/project/pytesseract/)
- **Computer Vision**: [OpenCV (Headless)](https://opencv.org/) & [NumPy](https://numpy.org/)
- **Data Schemas**: [Pydantic v2](https://docs.pydantic.dev/) & [Pydantic Settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
- **Containerization**: Docker (Debian Bookworm slim)

---

## 📂 Project Architecture & Directory Structure

```text
OCR/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── ocr.py               # REST endpoints (/extract, /history, /{id}, DELETE)
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   └── config.py            # Pydantic BaseSettings, dynamic CORS & tessdata paths
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── ocr_schema.py        # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── file_service.py      # Upload validation, sanitization, and JSON storage
│   │   │   └── ocr_service.py       # Tesseract OCR invocation & OpenCV preprocessing
│   │   ├── __init__.py
│   │   └── main.py                  # FastAPI entry point, CORS middleware, lifespan
│   ├── storage/
│   │   ├── uploads/                 # Stored uploaded images
│   │   └── results/                 # Stored OCR results (JSON format)
│   ├── tessdata/                    # Local OCR models (eng.traineddata, khm.traineddata)
│   ├── tests/
│   │   ├── test_ocr_api.py          # API route integration tests
│   │   └── test_ocr_service.py      # Core service & preprocessing unit tests
│   ├── .env.example                 # Backend environment variable template
│   ├── .gitignore
│   ├── Dockerfile                   # Docker image installing Tesseract 5 & traineddata
│   ├── requirements.txt             # Core Python dependencies
│   ├── requirements-dev.txt         # Development & testing dependencies
│   └── README.md
│
├── frontend/
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/           # System analytics & overview page
│   │   │   ├── documents/[id]/      # Detailed document telemetry & bounding boxes
│   │   │   ├── history/             # Document archive with search & filtering
│   │   │   ├── scanner/             # Core 2-panel OCR scanning workspace
│   │   │   ├── fonts/               # Geist Sans & Geist Mono local web fonts
│   │   │   ├── globals.css          # Cyber scanlines, scrollbars, and Tailwind base
│   │   │   ├── layout.tsx           # Global root layout with Redux & background grid
│   │   │   └── page.tsx             # Interactive landing page with telemetry preview
│   │   ├── components/
│   │   │   ├── effects/             # CyberGrid, CursorScanner, ScrollReveal
│   │   │   ├── layout/              # LandingNavbar, Navbar, Sidebar, Footer
│   │   │   ├── scanner/             # UploadZone, ImagePreview, OCRResult
│   │   │   └── ui/                  # StatCard, DocumentCard, ConfidenceBadge, etc.
│   │   ├── lib/
│   │   │   ├── api/                 # RTK Query API slice (apiSlice.ts)
│   │   │   ├── store/               # Redux store & scanner slice
│   │   │   ├── validations/         # Zod schemas (ocr.ts)
│   │   │   └── utils.ts             # Date, byte, word formatting utilities
│   │   └── types/
│   │       └── ocr.ts               # Shared TypeScript interfaces
│   ├── .env.example                 # Frontend environment variable template
│   ├── .env.local                   # Local development environment overrides
│   ├── next.config.mjs
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── .gitignore                       # Repository-wide gitignore
├── render.yaml                      # Render Blueprint specification for Docker runtime
└── README.md                        # Master documentation
```

---

## ⚙️ Environment Variables

### 1. Frontend Configuration (`frontend/.env.local`)

```env
# Production backend on Render:
NEXT_PUBLIC_API_URL=https://ocr-6slt.onrender.com

# For local development with FastAPI running on port 8000 (or 8001):
# NEXT_PUBLIC_API_URL=http://localhost:8000
```

> [!IMPORTANT]
> When configuring Vercel: Set `NEXT_PUBLIC_API_URL` to `https://ocr-6slt.onrender.com` in **Vercel Dashboard > Settings > Environment Variables**. Verify that the letter **`l`** is used (not the digit `1`).

### 2. Backend Configuration (`backend/.env`)

```env
PROJECT_NAME="QuickOCR API"
VERSION="1.0.0"
API_PREFIX="/api"

# CORS Allowed Origins (comma-separated or JSON list)
CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,https://ocr-g3tg.vercel.app"

# OCR Settings
TESSERACT_LANG="khm+eng"
TESSERACT_CMD="/usr/bin/tesseract"
# TESSDATA_DIR="/path/to/tessdata"  # Automatically resolves to backend/tessdata if present

TESSERACT_LANG_ENGLISH="eng"
TESSERACT_LANG_KHMER="khm"
TESSERACT_LANG_MIXED="khm+eng"
TESSERACT_PSM=6
OCR_DENOISE_STRENGTH=10
OCR_TARGET_HEIGHT=1800
```

---

## 💻 Local Installation & Setup

### Prerequisites
- **Node.js**: v18.17+ or v20+
- **pnpm**: v8+ (or npm / yarn)
- **Python**: v3.10 – v3.12
- **Tesseract OCR 5** with English and Khmer language packages

#### Installing Tesseract on your host machine:

**Ubuntu / Debian:**
```bash
sudo apt update
sudo apt install tesseract-ocr tesseract-ocr-eng tesseract-ocr-khm
```

**macOS (Homebrew):**
```bash
brew install tesseract
brew install tesseract-lang
```

**Windows:**
Download the installer from the [UB-Mannheim Tesseract repository](https://github.com/UB-Mannheim/tesseract/wiki) and ensure the executable is added to your system `PATH`.

---

### Step 1: Clone the Repository

```bash
git clone git@github.com:loslot/OCR.git
cd OCR
```

---

### Step 2: Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   # On Windows: .\.venv\Scripts\activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   pip install -r requirements-dev.txt
   ```

4. Create your local `.env` file:
   ```bash
   cp .env.example .env
   ```

5. Run automated tests to verify your setup:
   ```bash
   python -m pytest tests -v
   ```

6. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   The backend will be running at `http://localhost:8000`. You can inspect the interactive Swagger API documentation at `http://localhost:8000/docs`.

---

### Step 3: Frontend Setup

1. Open a separate terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies using pnpm:
   ```bash
   pnpm install
   ```

3. Create your `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```
   *(Ensure `NEXT_PUBLIC_API_URL=http://localhost:8000` for local development).*

4. Run the development server:
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Production Deployment Guide

### Backend on Render

> [!WARNING]
> Tesseract OCR requires C++ system libraries and traineddata packages (`apt-get install tesseract-ocr ...`). Render's native "Python" runtime does not have root package installation capabilities. Therefore, **the backend must be deployed using the Docker runtime**.

#### Option A: Automatic Blueprint Deployment (Recommended)
1. Go to the [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** > **Blueprint**.
3. Select your `OCR` repository.
4. Render will read `render.yaml` from the root directory, create the `quickocr-api` Docker web service, set the health-check path `/api/health`, and configure environment variables automatically.

#### Option B: Manual Web Service Deployment
1. Click **New +** > **Web Service**.
2. Connect your GitHub repository.
3. Choose **Docker** as the Runtime (NOT Python).
4. Set **Root Directory** to `backend`.
5. Set **Dockerfile Path** to `./Dockerfile` (or `Dockerfile`).
6. Set **Health Check Path** to `/api/health`.
7. Under **Environment Variables**, add:
   - `CORS_ORIGINS`: `https://ocr-g3tg.vercel.app,http://localhost:3000,http://127.0.0.1:3000`
   - `TESSERACT_LANG`: `khm+eng`
   - `TESSERACT_CMD`: `/usr/bin/tesseract`
8. Deploy! Render will build the container using `backend/Dockerfile` and start Uvicorn.

---

### Frontend on Vercel

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** > **Project** and import your repository.
3. Set **Root Directory** to `frontend`.
4. Framework Preset: **Next.js**.
5. Under **Environment Variables**, add:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://ocr-6slt.onrender.com`
6. Click **Deploy**.

---

## 📡 API Endpoint Reference

| Method | Endpoint | Description | Status Code |
|:---|:---|:---|:---|
| `GET` | `/api/health` | Health-check endpoint verifying service status & languages | `200 OK` |
| `POST` | `/api/ocr/extract` | Upload an image (`multipart/form-data`) and run OCR extraction | `201 Created` |
| `GET` | `/api/ocr/history` | Retrieve all saved document extractions ordered by newest first | `200 OK` |
| `GET` | `/api/ocr/{id}` | Retrieve a specific document by its UUID | `200 OK` / `404 Not Found` |
| `DELETE`| `/api/ocr/{id}` | Delete a document's JSON record and uploaded image file | `200 OK` / `404 Not Found` |

### Sample Extraction Request (`curl`)

```bash
curl -X POST https://ocr-6slt.onrender.com/api/ocr/extract \
  -H "Origin: https://ocr-g3tg.vercel.app" \
  -F "file=@sample_receipt.png" \
  -F "language=km+en"
```

### Sample Extraction Response (`201 Created`)

```json
{
  "document_id": "9d81d2f0-1090-48e2-b883-9e4eb0179a52",
  "filename": "sample_receipt.png",
  "extracted_text": "TOTAL AMOUNT: $45.00\nTHANK YOU FOR VISITING",
  "confidence": 0.942,
  "language": "km+en",
  "status": "completed",
  "processing_time": 0.428,
  "created_at": "2026-11-07T07:15:20.123456+00:00",
  "details": [
    {
      "text": "TOTAL AMOUNT: $45.00",
      "confidence": 0.961,
      "box": [[25, 40], [260, 40], [260, 75], [25, 75]]
    },
    {
      "text": "THANK YOU FOR VISITING",
      "confidence": 0.923,
      "box": [[25, 90], [390, 90], [390, 120], [25, 120]]
    }
  ]
}
```

---

## 🔍 Troubleshooting Guide

### 1. Vercel Frontend displays "Disconnected" or "Failed to retrieve history"
- **Cause A (Cold-Start Delay)**: Render's free tier spins down inactive web services after 15 minutes. The initial wake-up can take 30–50 seconds. The UI now displays a friendly "Connecting / Cold-Start" notice while waiting.
- **Cause B (Typo in URL)**: Ensure the Vercel environment variable `NEXT_PUBLIC_API_URL` is exactly `https://ocr-6slt.onrender.com` (letter `l`), NOT `ocr-6s1t` (digit `1`).
- **Cause C (CORS Rejection)**: Verify `CORS_ORIGINS` on Render includes `https://ocr-g3tg.vercel.app`.

### 2. Backend returns `503 Service Unavailable: Tesseract OCR is not installed`
- **Cause**: The Render service was deployed as a native "Python" service instead of a "Docker" service.
- **Fix**: Switch the environment in Render Dashboard to **Docker** (or redeploy via Blueprint `render.yaml`).

### 3. Image extraction returns `422 Unprocessable Entity`
- **Cause**: Tesseract could not detect any text characters in the image (e.g. low resolution, blurred photo, or completely blank image).
- **Fix**: Ensure the image is focused and high-contrast. The application automatically applies adaptive thresholding and scaling, but extremely degraded scans may need manual cropping or illumination.

---

## 🧪 Testing Summary

```bash
# Backend pytest suite (16 tests covering API, CORS, validation, and OCR logic)
cd backend && PYTHONPATH=. .venv/bin/pytest tests -v

# Frontend lint & production build
cd frontend && pnpm lint && pnpm build
```

---

## 📄 License

This project is licensed under the MIT License.
