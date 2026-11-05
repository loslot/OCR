export interface OCRLineDetail {
  text: string;
  confidence: number;
  box?: number[][] | null;
}

export interface OCRResponse {
  document_id: string;
  filename: string;
  extracted_text: string;
  confidence: number;
  language: string;
  status: string;
  processing_time: number;
  created_at: string;
  details?: OCRLineDetail[] | null;
}

export interface HistoryResponse {
  total: number;
  items: OCRResponse[];
}

export interface DeleteResponse {
  document_id: string;
  message: string;
  success: boolean;
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  supported_languages: string[];
}

export interface ApiErrorResponse {
  detail: string;
}

export type SupportedLanguage = "en" | "km" | "km+en";
