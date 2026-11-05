"use client";

import { useState, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import UploadZone from "@/components/scanner/UploadZone";
import ImagePreview from "@/components/scanner/ImagePreview";
import OCRResult from "@/components/scanner/OCRResult";
import ProcessingAnimation from "@/components/ui/ProcessingAnimation";
import { useExtractTextMutation } from "@/lib/api/apiSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  setSelectedLanguage,
  setFilePreview,
  clearFilePreview,
} from "@/lib/store/scannerSlice";
import type { OCRResponse, SupportedLanguage } from "@/types/ocr";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export default function ScannerPage() {
  const dispatch = useAppDispatch();
  const { selectedLanguage } = useAppSelector((state) => state.scanner);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedResult, setExtractedResult] = useState<OCRResponse | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);

  const replaceInputRef = useRef<HTMLInputElement | null>(null);

  const [extractText, { isLoading: isExtracting }] = useExtractTextMutation();

  const handleFileSelected = (file: File) => {
    // Revoke previous object URL if any
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(url);
    setExtractedResult(null);
    setExtractError(null);

    dispatch(
      setFilePreview({
        previewUrl: url,
        fileName: file.name,
        fileSize: file.size,
      })
    );
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setExtractedResult(null);
    setExtractError(null);
    dispatch(clearFilePreview());
  };

  const handleExtract = async () => {
    if (!selectedFile) {
      toast.error("Please upload an image first.");
      return;
    }

    setExtractError(null);
    try {
      const result = await extractText({
        file: selectedFile,
        language: selectedLanguage,
      }).unwrap();

      setExtractedResult(result);
      const confPercent = (result.confidence * 100).toFixed(0);
      toast.success(
        `Extraction complete! Confidence: ${confPercent}% in ${result.processing_time.toFixed(2)}s`
      );
    } catch (err: unknown) {
      let message = "An error occurred during OCR text extraction. Please try again.";
      if (err && typeof err === "object") {
        const errorObj = err as { data?: { detail?: string }; message?: string };
        message = errorObj.data?.detail || errorObj.message || message;
      }
      setExtractError(message);
      toast.error(message);
    }
  };

  const handleLanguageChange = (lang: SupportedLanguage) => {
    dispatch(setSelectedLanguage(lang));
  };

  return (
    <DashboardLayout>
      {/* Hidden file input for replacing image */}
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileSelected(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="font-mono text-2xl sm:text-3xl font-bold text-[#F5F7F5] tracking-tight">
          OPTICAL SCANNER WORKSPACE
        </h1>
        <p className="mt-1 text-sm text-[#8B9690] font-sans">
          Upload an image on the left to extract text and bounding box metadata with EasyOCR.
        </p>
      </div>

      {/* Error banner if extraction failed */}
      {extractError && (
        <div className="mb-6 p-4 rounded-xl bg-[#FF4D4D]/10 border border-[#FF4D4D]/40 text-[#FF4D4D] text-xs font-mono flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>ERROR: {extractError}</span>
          </div>
          <button
            onClick={() => setExtractError(null)}
            className="text-[11px] underline uppercase tracking-wider hover:text-[#F5F7F5]"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Two-Panel Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Panel: Image Ingestion & Preview */}
        <div className="flex flex-col h-full min-h-[460px]">
          {!selectedFile || !previewUrl ? (
            <UploadZone
              onFileSelected={handleFileSelected}
              disabled={isExtracting}
            />
          ) : (
            <ImagePreview
              file={selectedFile}
              previewUrl={previewUrl}
              isProcessing={isExtracting}
              selectedLanguage={selectedLanguage}
              onLanguageChange={handleLanguageChange}
              onExtract={handleExtract}
              onRemove={handleRemoveImage}
              onReplaceRequest={() => replaceInputRef.current?.click()}
            />
          )}
        </div>

        {/* Right Panel: Extraction Output / Telemetry */}
        <div className="flex flex-col h-full min-h-[460px]">
          {isExtracting ? (
            <ProcessingAnimation />
          ) : (
            <OCRResult
              result={extractedResult}
              onReset={handleRemoveImage}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
