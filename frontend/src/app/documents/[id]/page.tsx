"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Check,
  Download,
  Trash2,
  Clock,
  Globe,
  Layers,
  FileText,
  Calendar,
  AlertCircle,
  Hash,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ConfidenceBadge from "@/components/ui/ConfidenceBadge";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import {
  useGetDocumentByIdQuery,
  useDeleteDocumentMutation,
} from "@/lib/api/apiSlice";
import {
  countWords,
  formatDate,
  downloadTextFile,
} from "@/lib/utils";
import { toast } from "sonner";

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const {
    data: document,
    isLoading,
    isError,
  } = useGetDocumentByIdQuery(documentId, {
    skip: !documentId,
  });

  const [deleteDocument, { isLoading: isDeleting }] = useDeleteDocumentMutation();

  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editableText, setEditableText] = useState<string | null>(null);

  const currentText = editableText !== null ? editableText : document?.extracted_text || "";

  const handleCopy = () => {
    if (!currentText) return;
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    toast.success("Extracted text copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!currentText || !document) return;
    downloadTextFile(document.filename, currentText);
    toast.success("Downloaded TXT file.");
  };

  const handleDelete = async () => {
    if (!document) return;
    try {
      await deleteDocument(document.document_id).unwrap();
      toast.success(`Document "${document.filename}" deleted.`);
      setShowDeleteModal(false);
      router.push("/history");
    } catch {
      toast.error("Failed to delete document from backend.");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-6 bg-[#1A2720] rounded w-32" />
          <div className="h-10 bg-[#111816] rounded w-2/3" />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-[#111816] rounded-xl" />
            ))}
          </div>
          <div className="h-96 bg-[#111816] rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !document) {
    return (
      <DashboardLayout>
        <div className="p-12 rounded-3xl bg-[#111816]/80 border border-[#1A2720] text-center max-w-lg mx-auto my-12">
          <AlertCircle className="w-12 h-12 text-[#FF4D4D] mx-auto mb-4" />
          <h2 className="font-mono text-xl font-bold text-[#F5F7F5] mb-2">
            DOCUMENT NOT FOUND
          </h2>
          <p className="text-sm font-sans text-[#8B9690] mb-8">
            The requested document ID &ldquo;{documentId}&rdquo; was not found in backend storage or has been deleted.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/history"
              className="px-5 py-2.5 rounded-xl font-mono text-xs font-semibold text-[#080B0A] bg-[#39FF14] hover:bg-[#00E676] transition-all"
            >
              RETURN TO HISTORY
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const wordCount = countWords(currentText);
  const charCount = currentText.length;
  const lineSegments = document.details || [];

  return (
    <DashboardLayout>
      {/* Delete Confirmation Modal */}
      <ConfirmationDialog
        isOpen={showDeleteModal}
        title="Delete Document"
        description={`Are you sure you want to permanently delete "${document.filename}" and its associated image and JSON telemetry? This action cannot be undone.`}
        confirmText="Delete Document"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Top Breadcrumb Link */}
      <div className="mb-6">
        <Link
          href="/history"
          className="inline-flex items-center gap-2 text-xs font-mono text-[#8B9690] hover:text-[#39FF14] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO HISTORY</span>
        </Link>
      </div>

      {/* Header with Title & Action Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#1A2720]">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#0D1210] border border-[#1A2720] text-[#8B9690] flex items-center gap-1">
              <Hash className="w-3 h-3 text-[#39FF14]" />
              {document.document_id}
            </span>
            <ConfidenceBadge score={document.confidence} />
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#0D1210] border border-[#1A2720] text-[#00E676]">
              {document.status.toUpperCase()}
            </span>
          </div>

          <h1
            className="font-mono text-xl sm:text-2xl font-bold text-[#F5F7F5] truncate max-w-2xl"
            title={document.filename}
          >
            {document.filename}
          </h1>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-medium text-[#F5F7F5] bg-[#111816] border border-[#1A2720] hover:border-[#39FF14]/40 hover:text-[#39FF14] transition-all"
            title="Copy Extracted Text"
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
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-medium text-[#080B0A] bg-[#39FF14] hover:bg-[#00E676] shadow-[0_0_15px_rgba(57,255,20,0.25)] transition-all"
            title="Download TXT"
          >
            <Download className="w-3.5 h-3.5" />
            <span>DOWNLOAD TXT</span>
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2 rounded-xl text-[#8B9690] hover:text-[#FF4D4D] bg-[#111816] border border-[#1A2720] hover:border-[#FF4D4D]/40 transition-all"
            title="Delete Document"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-[#111816]/90 border border-[#1A2720]">
          <span className="text-[10px] font-mono text-[#8B9690] uppercase block mb-1">
            LANGUAGE
          </span>
          <div className="font-mono text-lg font-bold text-[#F5F7F5] flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#39FF14]" />
            <span>{document.language.toUpperCase()}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#111816]/90 border border-[#1A2720]">
          <span className="text-[10px] font-mono text-[#8B9690] uppercase block mb-1">
            PROCESSING TIME
          </span>
          <div className="font-mono text-lg font-bold text-[#F5F7F5] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#39FF14]" />
            <span>{document.processing_time.toFixed(2)}s</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#111816]/90 border border-[#1A2720]">
          <span className="text-[10px] font-mono text-[#8B9690] uppercase block mb-1">
            WORD & CHAR COUNT
          </span>
          <div className="font-mono text-lg font-bold text-[#F5F7F5] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#00E676]" />
            <span>{wordCount}w / {charCount}c</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#111816]/90 border border-[#1A2720]">
          <span className="text-[10px] font-mono text-[#8B9690] uppercase block mb-1">
            CREATED AT
          </span>
          <div className="font-mono text-xs sm:text-sm font-semibold text-[#F5F7F5] flex items-center gap-1.5 pt-1">
            <Calendar className="w-3.5 h-3.5 text-[#39FF14]" />
            <span>{formatDate(document.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Extracted Text Section */}
      <div className="rounded-2xl bg-[#111816]/90 border border-[#1A2720] p-6 mb-8 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-3 text-xs font-mono text-[#8B9690]">
          <span className="flex items-center gap-2 text-[#F5F7F5] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#39FF14]" />
            COMPLETE EXTRACTED TEXT
          </span>
          <span>Editable buffer</span>
        </div>

        <textarea
          value={currentText}
          onChange={(e) => setEditableText(e.target.value)}
          rows={14}
          className="w-full p-4 rounded-xl bg-[#080B0A] border border-[#1A2720] focus:border-[#39FF14]/50 focus:ring-1 focus:ring-[#39FF14]/30 text-[#F5F7F5] font-mono text-sm leading-relaxed outline-none resize-y selection:bg-[#39FF14]/20 selection:text-[#39FF14]"
        />
      </div>

      {/* Line Details / Bounding Boxes if available */}
      {lineSegments.length > 0 && (
        <div className="rounded-2xl bg-[#111816]/90 border border-[#1A2720] p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono text-sm font-semibold text-[#F5F7F5] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00E676]" />
              SEGMENTATION TELEMETRY ({lineSegments.length} TEXT REGIONS)
            </h3>
            <span className="text-xs font-mono text-[#8B9690]">
              BOUNDING COORDINATES & CONFIDENCE
            </span>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {lineSegments.map((segment, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#080B0A] border border-[#1A2720]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="text-[10px] text-[#8B9690] px-1.5 py-0.5 rounded bg-[#111816] border border-[#1A2720] shrink-0">
                    #{idx + 1}
                  </span>
                  <span className="text-[#F5F7F5] font-mono break-words">
                    {segment.text}
                  </span>
                </div>

                <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
                  {segment.box && (
                    <span className="text-[10px] text-[#8B9690]">
                      BOX: [{segment.box[0]?.[0]},{segment.box[0]?.[1]}]
                    </span>
                  )}
                  <ConfidenceBadge score={segment.confidence} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
