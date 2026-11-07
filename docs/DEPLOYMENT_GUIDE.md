# Production Deployment & Redeployment Guide

This document provides step-by-step instructions for deploying and maintaining the QuickOCR application across **Vercel** and **Render**.

---

## 1. Backend Deployment on Render

### Why Docker is Required
Tesseract OCR 5 and language packs (`tesseract-ocr-eng`, `tesseract-ocr-khm`) are Linux C++ binaries that require root `apt-get` installation. Render's native "Python" runtime does not provide root installation privileges. **You must deploy using Docker.**

### Method A: Deploy via Blueprint (Recommended)
1. Navigate to the [Render Dashboard](https://dashboard.render.com).
2. Click **New +** > **Blueprint**.
3. Connect your GitHub repository (`OCR`).
4. Render will read [`render.yaml`](file:///home/los/Downloads/OCR/OCR/render.yaml) automatically and set up:
   - **Runtime**: Docker
   - **Root Directory**: `backend`
   - **Health Check**: `/api/health`
   - **Plan**: Free
   - **Environment Variables**: `CORS_ORIGINS`, `TESSERACT_LANG`, `TESSERACT_CMD`
5. Click **Apply**.

### Method B: Manual Web Service Setup
1. In the Render Dashboard, click **New +** > **Web Service**.
2. Connect your repository.
3. Configure the following fields:
   - **Name**: `quickocr-api`
   - **Region**: Oregon or Singapore (choose the region closest to your users)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: **Docker** (DO NOT select Python)
   - **Dockerfile Path**: `./Dockerfile`
   - **Plan**: Free
4. Under **Advanced > Health Check Path**, set `/api/health`.
5. Under **Environment Variables**, add:
   - `CORS_ORIGINS`: `https://ocr-g3tg.vercel.app,http://localhost:3000,http://127.0.0.1:3000`
   - `TESSERACT_LANG`: `khm+eng`
   - `TESSERACT_CMD`: `/usr/bin/tesseract`
6. Click **Create Web Service**.

---

## 2. Frontend Deployment on Vercel

1. In the [Vercel Dashboard](https://vercel.com), click **Add New...** > **Project**.
2. Select your `OCR` repository.
3. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: Click *Edit* and select `frontend`
4. Under **Environment Variables**, add:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://ocr-6slt.onrender.com`
   *(Verify letter `l`, not digit `1`).*
5. Click **Deploy**.

---

## 3. Redeployment Checklist

When pushing new code:

1. **Push Changes to GitHub**:
   ```bash
   git add -A
   git commit -m "feat: updates"
   git push origin main
   ```
2. **Backend**: Render automatically triggers a new Docker build upon detecting pushes to `main`.
3. **Frontend**: Vercel automatically creates a new production deployment. If you need to redeploy manually, go to Deployments > Redeploy (uncheck *Use existing build cache*).
