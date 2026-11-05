"use client";

import Link from "next/link";
import { FileText, ArrowUpRight, Trash2, Copy, Check, Clock, Globe } from "lucide-react";
import { useState } from "react";
import type { OCRResponse } from "@/types/ocr";
import ConfidenceBadge from "./ConfidenceBadge";
import { formatDate, formatRelativeTime, countWords } from "@/lib/utils";
import { toast } from "sonner";

interface DocumentCardProps {
  document: OCRResponse;
  viewMode?: "grid" | "list";
  onDeleteRequest: (document: OCRResponse) => void;
}

export default function DocumentCard({
  document,
  viewMode = "grid",
  onDeleteRequest,
}: DocumentCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(document.extracted_text || "");
    setCopied(true);
    toast.success("Extracted text copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDeleteRequest(document);
  };

  const wordCount = countWords(document.extracted_text);
  const snippet =
    document.extracted_text?.slice(0, 160) || "No text detected in image.";

  if (viewMode === "list") {
    return (
      <div className="group relative p-4 rounded-xl bg-[#111816]/90 border border-[#1A2720] hover:border-[#39FF14]/30 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Info */}
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="p-2.5 rounded-lg bg-[#0D1210] border border-[#1A2720] text-[#00E676] group-hover:text-[#39FF14] transition-colors shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/documents/${document.document_id}`}
                className="font-mono text-sm font-semibold text-[#F5F7F5] hover:text-[#39FF14] truncate transition-colors max-w-xs md:max-w-md"
                title={document.filename}
              >
                {document.filename}
              </Link>
              <ConfidenceBadge score={document.confidence} />
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#0D1210] border border-[#1A2720] text-[#8B9690]">
                {document.language.toUpperCase()}
              </span>
            </div>
            <p className="mt-1 text-xs text-[#8B9690] line-clamp-1 font-mono">
              {snippet}
            </p>
          </div>
        </div>

        {/* Right: Meta & Actions */}
        <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#1A2720]/60">
          <div className="flex items-center gap-3 text-xs font-mono text-[#8B9690]">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#39FF14]/70" />
              {document.processing_time.toFixed(2)}s
            </span>
            <span title={formatDate(document.created_at)}>
              {formatRelativeTime(document.created_at)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg text-[#8B9690] hover:text-[#39FF14] bg-[#0D1210] border border-[#1A2720] hover:border-[#39FF14]/30 transition-all"
              title="Copy Extracted Text"
            >
              {copied ? (
                <Check className="w-4 h-4 text-[#39FF14]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={handleDelete}
              className="p-2 rounded-lg text-[#8B9690] hover:text-[#FF4D4D] bg-[#0D1210] border border-[#1A2720] hover:border-[#FF4D4D]/40 transition-all"
              title="Delete Document"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <Link
              href={`/documents/${document.document_id}`}
              className="p-2 rounded-lg text-[#8B9690] hover:text-[#39FF14] bg-[#0D1210] border border-[#1A2720] hover:border-[#39FF14]/30 transition-all"
              title="Open Document Detail"
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="group relative p-5 rounded-xl bg-[#111816]/90 border border-[#1A2720] hover:border-[#39FF14]/30 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-[0_0_20px_rgba(57,255,20,0.06)]">
      {/* Top Bar */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="p-2 rounded-lg bg-[#0D1210] border border-[#1A2720] text-[#00E676] group-hover:text-[#39FF14] transition-colors">
            <FileText className="w-5 h-5" />
          </div>
          <ConfidenceBadge score={document.confidence} />
        </div>

        {/* Filename */}
        <Link
          href={`/documents/${document.document_id}`}
          className="font-mono text-sm font-semibold text-[#F5F7F5] hover:text-[#39FF14] block line-clamp-1 mb-2 transition-colors"
          title={document.filename}
        >
          {document.filename}
        </Link>

        {/* Snippet */}
        <div className="p-3 rounded-lg bg-[#080B0A]/80 border border-[#1A2720]/80 mb-4 h-24 overflow-hidden">
          <p className="text-xs font-mono text-[#8B9690] line-clamp-4 leading-relaxed select-text">
            {snippet}
          </p>
        </div>
      </div>

      {/* Footer Meta & Actions */}
      <div className="pt-3 border-t border-[#1A2720] flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-[#8B9690]">
          <span className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-[#39FF14]/70" />
            {document.language.toUpperCase()}
          </span>
          <span>•</span>
          <span>{wordCount} words</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md text-[#8B9690] hover:text-[#39FF14] hover:bg-[#0D1210] transition-colors"
            title="Copy Text"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-[#39FF14]" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={handleDelete}
            className="p-1.5 rounded-md text-[#8B9690] hover:text-[#FF4D4D] hover:bg-[#0D1210] transition-colors"
            title="Delete Document"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <Link
            href={`/documents/${document.document_id}`}
            className="p-1.5 rounded-md text-[#8B9690] hover:text-[#39FF14] hover:bg-[#0D1210] transition-colors"
            title="View Details"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
