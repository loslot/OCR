# QuickOCR — Frontend Web Application

The reactive, cyber-themed frontend interface for QuickOCR. Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, and **Redux Toolkit (RTK Query)**.

---

## 🚀 Key Features

- **2-Panel Scanning Workspace**: Dedicated side-by-side view for image ingestion/preview and real-time OCR telemetry.
- **Multilingual OCR Controls**: Instant switching between English (`en`), Khmer (`km`), and mixed Khmer + English (`km+en`).
- **Real-Time Editable Buffer**: Directly edit, audit, and proofread extracted text with live character and word counters.
- **One-Click Export**: Instant copy to clipboard and `.txt` file downloading.
- **Interactive Document Archive**: Search, view, and delete previous OCR records stored in the backend.
- **Render Cold-Start UX**: Integrated elapsed timers and helpful cold-start indicators for backend wake-ups.
- **Mobile Responsive Design**: Fluid navigation across mobile (320px–480px), tablet (481px–1024px), and desktop (1025px+).
- **Reduced Motion Support**: Honors `prefers-reduced-motion` for accessibility and smoothness.

---

## 📂 Frontend Structure

```text
frontend/
├── public/                     # Static assets & icons
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/          # System analytics & overview page
│   │   ├── documents/[id]/     # Single document inspection & polygon telemetry
│   │   ├── history/            # Document archive with search & language filters
│   │   ├── scanner/            # Primary 2-panel OCR scanning workspace
│   │   ├── fonts/              # Local Geist web fonts
│   │   ├── globals.css         # Cyber scanlines, scrollbars, and Tailwind base
│   │   ├── layout.tsx          # Root layout with Redux provider & background canvas
│   │   └── page.tsx            # Interactive landing page with telemetry preview
│   ├── components/
│   │   ├── effects/            # CyberGrid, CursorScanner, ScrollReveal
│   │   ├── layout/             # LandingNavbar, Navbar, Sidebar, Footer, DashboardLayout
│   │   ├── scanner/            # UploadZone, ImagePreview, OCRResult
│   │   └── ui/                 # StatCard, DocumentCard, ConfidenceBadge, etc.
│   ├── lib/
│   │   ├── api/apiSlice.ts     # RTK Query service with 60s timeout & deployed fallback
│   │   ├── store/              # Redux store & scanner UI slice
│   │   ├── validations/ocr.ts  # Zod validation schemas & client file size checks
│   │   └── utils.ts            # Byte formatting, word counting, date helpers
│   └── types/
│       └── ocr.ts              # TypeScript interfaces for API contracts
├── .env.example                # Example environment variables
├── .env.local                  # Local environment overrides
├── next.config.mjs             # Next.js configuration
├── package.json
├── tailwind.config.ts          # Custom cyber neon theme
└── tsconfig.json
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+
- **pnpm**: v8+ (recommended) or npm/yarn

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Variables
Create a local `.env.local` file:

```bash
cp .env.example .env.local
```

Configure `NEXT_PUBLIC_API_URL`:
```env
# For local FastAPI backend:
NEXT_PUBLIC_API_URL=http://localhost:8000

# For deployed Render backend:
# NEXT_PUBLIC_API_URL=https://ocr-6slt.onrender.com
```

### 4. Run Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Linting & Production Build

```bash
# Run ESLint validation
pnpm lint

# Build optimized production bundle
pnpm build

# Start production server locally
pnpm start
```

---

## 🌐 Deploy to Vercel

1. Import the repository in [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL`: `https://ocr-6slt.onrender.com`
4. Deploy!
