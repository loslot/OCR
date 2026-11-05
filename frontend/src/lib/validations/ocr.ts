import { z } from "zod";

// Constraints matching backend FastAPI configuration
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];
export const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];

// 1. File Upload Schema
export const fileUploadSchema = z.object({
  file: z
    .custom<File>((val) => val instanceof File, "Please select an image file")
    .refine((file) => file && file.size > 0, "Uploaded file cannot be empty")
    .refine(
      (file) => file && file.size <= MAX_FILE_SIZE,
      `File size exceeds 10MB limit. Current size is ${(file: File) => (file.size / (1024 * 1024)).toFixed(1)}MB.`
    )
    .refine((file) => {
      if (!file) return false;
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      const hasValidExt = ALLOWED_EXTENSIONS.includes(ext);
      const hasValidType = file.type ? ALLOWED_IMAGE_TYPES.includes(file.type) : true;
      return hasValidExt && hasValidType;
    }, "Unsupported format. Only PNG, JPG, JPEG, and WEBP images are supported."),
  language: z.enum(["en", "km"]).default("en"),
});

export type FileUploadFormValues = z.infer<typeof fileUploadSchema>;

// Helper function to validate a single file client-side
export function validateUploadFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "No file selected." };
  }
  if (file.size === 0) {
    return { valid: false, error: "The selected file is empty." };
  }
  if (file.size > MAX_FILE_SIZE) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size (${sizeMb}MB) exceeds the maximum limit of 10MB.`,
    };
  }
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Unsupported file extension '${ext}'. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`,
    };
  }
  if (file.type && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid MIME type '${file.type}'. Allowed: PNG, JPG, WEBP.`,
    };
  }
  return { valid: true };
}

// 2. OCR Response Schema
export const ocrLineDetailSchema = z.object({
  text: z.string(),
  confidence: z.number().min(0).max(1),
  box: z.array(z.array(z.number())).nullable().optional(),
});

export const ocrResponseSchema = z.object({
  document_id: z.string().min(1, "Document ID is required"),
  filename: z.string().min(1, "Filename is required"),
  extracted_text: z.string(),
  confidence: z.number().min(0).max(1),
  language: z.string().default("en"),
  status: z.string().default("completed"),
  processing_time: z.number().nonnegative(),
  created_at: z.string(),
  details: z.array(ocrLineDetailSchema).nullable().optional(),
});

// 3. History Response Schema
export const historyResponseSchema = z.object({
  total: z.number().nonnegative(),
  items: z.array(ocrResponseSchema),
});

// 4. Delete Response Schema
export const deleteResponseSchema = z.object({
  document_id: z.string(),
  message: z.string(),
  success: z.boolean(),
});

// 5. Health Response Schema
export const healthResponseSchema = z.object({
  status: z.string(),
  service: z.string(),
  version: z.string(),
  supported_languages: z.array(z.string()),
});
