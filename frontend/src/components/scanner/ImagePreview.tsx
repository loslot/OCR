"use client";

import { Trash2, RefreshCw, Zap, Globe } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import type { SupportedLanguage } from "@/types/ocr";

interface ImagePreviewProps {
  file: File;
  previewUrl: string;
  isProcessing: boolean;
  selectedLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onExtract: () => void;
  onRemove: () => void;
  onReplaceRequest: () => void;
}

export default function ImagePreview({
  file,
  previewUrl,
  isProcessing,
  selectedLanguage,
  onLanguageChange,
  onExtract,
  onRemove,
  onReplaceRequest,
}: ImagePreviewProps) {
  return (
    <div className="flex flex-col h-full rounded-2xl bg-[#111816]/90 border border-[#1A2720] p-5 shadow-xl backdrop-blur-md">
      {/* Header bar: File Info & Quick Actions */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#1A2720]">
        <div className="min-w-0">
          <h4
            className="font-mono text-sm font-semibold text-[#F5F7F5] truncate"
            title={file.name}
          >
            {file.name}
          </h4>
          <span className="text-xs font-mono text-[#8B9690]">
            {formatBytes(file.size)} • {file.type || "IMAGE"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onReplaceRequest}
            disabled={isProcessing}
            className="p-2 rounded-lg text-[#8B9690] hover:text-[#39FF14] bg-[#0D1210] border border-[#1A2720] hover:border-[#39FF14]/30 transition-all disabled:opacity-50"
            title="Replace Image"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onRemove}
            disabled={isProcessing}
            className="p-2 rounded-lg text-[#8B9690] hover:text-[#FF4D4D] bg-[#0D1210] border border-[#1A2720] hover:border-[#FF4D4D]/30 transition-all disabled:opacity-50"
            title="Remove Image"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Frame with Cyber Reticle */}
      <div className="relative my-4 flex-1 min-h-[300px] sm:min-h-[360px] rounded-xl bg-[#080B0A] border border-[#1A2720] overflow-hidden flex items-center justify-center p-2 group">
        {/* Background micro grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#1A2720_1px,transparent_1px)] [background-size:12px_12px] opacity-40 pointer-events-none" />

        {/* The Uploaded Image */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Upload Preview"
            className="max-h-[380px] w-auto max-w-full object-contain rounded transition-all duration-300"
          />

          {/* Laser Scanner beam overlay while processing */}
          {isProcessing && (
            <>
              <div className="absolute inset-0 bg-[#39FF14]/5 pointer-events-none" />
              <div className="absolute left-0 right-0 h-1 bg-[#39FF14] shadow-[0_0_20px_#39FF14] animate-scanline pointer-events-none z-10" />
            </>
          )}
        </div>

        {/* Viewfinder Target Accents */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#39FF14]/50 pointer-events-none" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#39FF14]/50 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#39FF14]/50 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#39FF14]/50 pointer-events-none" />

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded bg-[#080B0A]/85 border border-[#1A2720] text-[11px] font-mono text-[#8B9690] pointer-events-none">
          {isProcessing ? "PROCESSING STREAM..." : "BUFFER READY FOR EXTRACTION"}
        </div>
      </div>

      {/* Language Selector & Extraction Trigger */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0D1210] p-3 rounded-xl border border-[#1A2720]">
          <div className="flex items-center gap-2 text-xs font-mono text-[#8B9690]">
            <Globe className="w-4 h-4 text-[#39FF14] shrink-0" />
            <span className="text-[11px] sm:text-xs">OCR RECOGNITION LANGUAGE:</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs flex-wrap">
            <button
              type="button"
              onClick={() => onLanguageChange("en")}
              disabled={isProcessing}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg border text-center transition-all ${
                selectedLanguage === "en"
                  ? "bg-[#39FF14]/15 border-[#39FF14] text-[#39FF14] font-semibold shadow-[0_0_10px_rgba(57,255,20,0.2)]"
                  : "bg-[#080B0A] border-[#1A2720] text-[#8B9690] hover:text-[#F5F7F5]"
              }`}
            >
              EN (English)
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange("km")}
              disabled={isProcessing}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg border text-center transition-all ${
                selectedLanguage === "km"
                  ? "bg-[#39FF14]/15 border-[#39FF14] text-[#39FF14] font-semibold shadow-[0_0_10px_rgba(57,255,20,0.2)]"
                  : "bg-[#080B0A] border-[#1A2720] text-[#8B9690] hover:text-[#F5F7F5]"
              }`}
            >
              KM (Khmer)
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange("km+en")}
              disabled={isProcessing}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg border text-center transition-all ${
                selectedLanguage === "km+en"
                  ? "bg-[#39FF14]/15 border-[#39FF14] text-[#39FF14] font-semibold shadow-[0_0_10px_rgba(57,255,20,0.2)]"
                  : "bg-[#080B0A] border-[#1A2720] text-[#8B9690] hover:text-[#F5F7F5]"
              }`}
            >
              KM + EN
            </button>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onExtract}
          disabled={isProcessing}
          className="relative group w-full py-3.5 px-6 rounded-xl font-mono text-sm font-semibold tracking-wider text-[#080B0A] bg-[#39FF14] hover:bg-[#00E676] transition-all duration-300 shadow-[0_0_25px_rgba(57,255,20,0.35)] hover:shadow-[0_0_35px_rgba(57,255,20,0.55)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 overflow-hidden"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-[#080B0A] border-t-transparent rounded-full animate-spin" />
              <span>SCANNING & EXTRACTING TEXT...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-current" />
              <span>EXTRACT TEXT NOW</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
