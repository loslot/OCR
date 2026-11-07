/**
 * Centralized API configuration for QuickOCR frontend.
 *
 * Requirements:
 * - Uses Render backend URL in production (default/fallback).
 * - Uses localhost in local development (default/fallback).
 * - Handles trailing slashes safely.
 * - Handles accidental duplicate `/api` suffix in NEXT_PUBLIC_API_URL safely.
 * - Ensures browser in production never falls back to localhost.
 * - Exposes standardized endpoint paths matching FastAPI routes.
 */

export const PRODUCTION_API_URL = "https://ocr-6slt.onrender.com";
export const LOCAL_API_URL = "http://localhost:8000";

/**
 * Normalizes the API base URL:
 * - Trims whitespace
 * - Strips trailing slashes
 * - Strips any trailing `/api` suffix so that endpoints like `/api/health`
 *   and `/api/ocr/extract` do not produce duplicated `/api/api/...` paths.
 */
export function normalizeApiUrl(url: string): string {
  if (!url) return "";
  let cleaned = url.trim().replace(/\/+$/, "");
  if (cleaned.endsWith("/api")) {
    cleaned = cleaned.slice(0, -4).replace(/\/+$/, "");
  }
  return cleaned;
}

/**
 * Resolves the API base URL based on environment variables and runtime environment.
 */
export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  const isProduction = process.env.NODE_ENV === "production";

  if (envUrl && envUrl.trim().length > 0) {
    const normalized = normalizeApiUrl(envUrl);
    // Safety check: Avoid requesting localhost in production if misconfigured
    if (
      isProduction &&
      (normalized.includes("localhost") || normalized.includes("127.0.0.1"))
    ) {
      console.warn(
        `[QuickOCR API] NEXT_PUBLIC_API_URL is set to '${normalized}' in production. Falling back to '${PRODUCTION_API_URL}'.`
      );
      return PRODUCTION_API_URL;
    }
    return normalized;
  }

  // Fallback depending on environment
  return isProduction ? PRODUCTION_API_URL : LOCAL_API_URL;
}

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  HEALTH: "/api/health",
  EXTRACT: "/api/ocr/extract",
  HISTORY: "/api/ocr/history",
  DOCUMENT_BY_ID: (id: string) => `/api/ocr/${encodeURIComponent(id)}`,
} as const;
