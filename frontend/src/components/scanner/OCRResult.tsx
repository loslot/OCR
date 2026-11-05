"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Copy,
  Check,
  Download,
  FileText,
  Clock,
  Sparkles,
  ArrowUpRight,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { OCRResponse } from "@/types/ocr";
import ConfidenceBadge from "@/components/ui/ConfidenceBadge";
import { countWords, downloadTextFile } from "@/lib/utils";
import { toast } from "sonner";

interface OCRResultProps {
  result: OCRResponse | null;
  onReset: () => void;
}

export default function OCRResult({
  result,
  onReset,
}: OCRResultProps) {
  const [copied, setCopied] = useState(false);
  const [editedText, setEditedText] = useState<string | null>(null);
  const [showSegments, setShowSegments] = useState(false);

  // If user edited text, display edited text; otherwise the original extracted text
  const currentText = editedText !== null ? editedText : result?.extracted_text || "";

  const handleCopy = () => {
    if (!currentText) return;
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    toast.success("Text copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!currentText || !result) return;
    downloadTextFile(result.filename, currentText);
    toast.success("Downloaded TXT file.");
  };

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[420px] rounded-2xl bg-[#111816]/70 border border-[#1A2720] p-8 text-center backdrop-blur-md">
        <div className="w-16 h-16 rounded-2xl bg-[#0D1210] border border-[#1A2720] flex items-center justify-center text-[#8B9690] mb-4">
          <FileText className="w-8 h-8 opacity-40" />
        </div>
        <h4 className="font-mono text-base font-semibold text-[#F5F7F5] mb-2">
          SCANNER STANDBY
        </h4>
        <p className="text-sm text-[#8B9690] max-w-sm font-sans">
          Upload an image on the left panel and click &ldquo;Extract Text Now&rdquo; to decrypt characters with EasyOCR.
        </p>

        <div className="mt-6 flex items-center gap-2 text-xs font-mono text-[#8B9690]/80">
          <span className="w-2 h-2 rounded-full bg-[#00E676]/50 animate-pulse" />
          <span>OCR ENGINE IDLE // READY FOR INPUT</span>
        </div>
      </div>
    );
  }

  const wordCount = countWords(currentText);
  const charCount = currentText.length;
  const lineSegments = result.details || [];

  return (
    <div className="flex flex-col h-full rounded-2xl bg-[#111816]/90 border border-[#1A2720] p-5 shadow-xl backdrop-blur-md">
      {/* Top Bar: Status, Confidence, Processing time */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1A2720]">
        <div className="flex items-center gap-2 flex-wrap">
          <ConfidenceBadge score={result.confidence} />
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0D1210] border border-[#1A2720] text-xs font-mono text-[#8B9690]">
            <Clock className="w-3.5 h-3.5 text-[#39FF14]" />
            <span>{result.processing_time.toFixed(2)}s</span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#0D1210] border border-[#1A2720] text-[#00E676] uppercase">
            {result.language.toUpperCase()}
          </span>
        </div>

        {/* Action Buttons: Copy & Download */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-[#F5F7F5] bg-[#0D1210] border border-[#1A2720] hover:border-[#39FF14]/40 hover:text-[#39FF14] transition-all"
            title="Copy Text"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#39FF14]" />
                <span>COPIED</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>COPY</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-[#080B0A] bg-[#39FF14] hover:bg-[#00E676] transition-all shadow-[0_0_15px_rgba(57,255,20,0.25)]"
            title="Download TXT"
          >
            <Download className="w-3.5 h-3.5" />
            <span>DOWNLOAD TXT</span>
          </button>
        </div>
      </div>

      {/* Editable Extracted Text Area */}
      <div className="relative my-4 flex-1 flex flex-col min-h-[280px]">
        <div className="flex items-center justify-between text-xs font-mono text-[#8B9690] mb-2 px-1">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#39FF14]" />
            EXTRACTED TEXT BUFFER (EDITABLE)
          </span>
          <span>
            {wordCount} words • {charCount} chars
          </span>
        </div>

        <textarea
          value={currentText}
          onChange={(e) => setEditedText(e.target.value)}
          placeholder="Extracted text will appear here..."
          rows={12}
          className="w-full flex-1 p-4 rounded-xl bg-[#080B0A] border border-[#1A2720] focus:border-[#39FF14]/50 focus:ring-1 focus:ring-[#39FF14]/40 text-[#F5F7F5] font-mono text-sm leading-relaxed resize-none outline-none selection:bg-[#39FF14]/20 selection:text-[#39FF14] transition-all"
        />
      </div>

      {/* Segment Breakdown Accordion */}
      {lineSegments.length > 0 && (
        <div className="mb-4 rounded-xl bg-[#0D1210] border border-[#1A2720] overflow-hidden">
          <button
            type="button"
            onClick={() => setShowSegments(!showSegments)}
            className="w-full p-3 flex items-center justify-between text-xs font-mono text-[#8B9690] hover:text-[#F5F7F5] transition-colors"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#00E676]" />
              DETECTED SEGMENTS ({lineSegments.length} bounding boxes)
            </span>
            {showSegments ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showSegments && (
            <div className="p-3 border-t border-[#1A2720] max-h-48 overflow-y-auto space-y-2">
              {lineSegments.map((seg, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded bg-[#080B0A] border border-[#1A2720]/60 flex items-center justify-between gap-3 text-xs font-mono"
                >
                  <span className="text-[#F5F7F5] truncate">{seg.text}</span>
                  <span className="text-[11px] text-[#39FF14] shrink-0">
                    {(seg.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom bar: link to Document Detail & Scan Another */}
      <div className="pt-3 border-t border-[#1A2720] flex items-center justify-between">
        <Link
          href={`/documents/${result.document_id}`}
          className="text-xs font-mono text-[#00E676] hover:text-[#39FF14] flex items-center gap-1 transition-colors"
        >
          <span>VIEW DOCUMENT RECORD</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>

        <button
          onClick={onReset}
          className="text-xs font-mono text-[#8B9690] hover:text-[#F5F7F5] transition-colors"
        >
          Scan New Image
        </button>
      </div>
    </div>
  );
}
