"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  FileCheck,
  Zap,
  Clock,
  Activity,
  ArrowUpRight,
  UploadCloud,
  Sparkles,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/ui/StatCard";
import DocumentCard from "@/components/ui/DocumentCard";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import {
  useGetHistoryQuery,
  useGetHealthQuery,
  useDeleteDocumentMutation,
} from "@/lib/api/apiSlice";
import { countWords, formatRelativeTime } from "@/lib/utils";
import type { OCRResponse } from "@/types/ocr";
import { toast } from "sonner";

export default function DashboardPage() {
  const { data: history, isLoading: isHistoryLoading, refetch } =
    useGetHistoryQuery();
  const { data: health, isLoading: isHealthLoading } = useGetHealthQuery();
  const [deleteDocument, { isLoading: isDeleting }] = useDeleteDocumentMutation();

  const [documentToDelete, setDocumentToDelete] = useState<OCRResponse | null>(null);

  // Calculate stats from real backend data
  const totalDocuments = history?.total ?? (history?.items ? history.items.length : 0);

  const totalWords =
    history?.items && history.items.length > 0
      ? history.items.reduce((acc, item) => acc + countWords(item.extracted_text), 0)
      : 0;

  const averageConfidence =
    history?.items && history.items.length > 0
      ? (
          (history.items.reduce((acc, item) => acc + item.confidence, 0) /
            history.items.length) *
          100
        ).toFixed(1) + "%"
      : "N/A";

  const recentDocuments = history?.items ? history.items.slice(0, 4) : [];

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;
    try {
      await deleteDocument(documentToDelete.document_id).unwrap();
      toast.success(`Document "${documentToDelete.filename}" deleted.`);
      setDocumentToDelete(null);
      refetch();
    } catch {
      toast.error("Failed to delete document from backend.");
    }
  };

  return (
    <DashboardLayout>
      {/* Delete Confirmation Modal */}
      <ConfirmationDialog
        isOpen={!!documentToDelete}
        title="Delete Document"
        description={`Are you sure you want to permanently delete "${documentToDelete?.filename}" and its associated image and OCR data? This action cannot be undone.`}
        confirmText="Delete Document"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDocumentToDelete(null)}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-mono text-2xl sm:text-3xl font-bold text-[#F5F7F5] tracking-tight">
            SYSTEM OVERVIEW // DASHBOARD
          </h1>
          <p className="mt-1 text-sm text-[#8B9690] font-sans">
            Real-time optical character telemetry, document history, and backend health.
          </p>
        </div>

        <Link
          href="/scanner"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-semibold text-[#080B0A] bg-[#39FF14] hover:bg-[#00E676] shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all shrink-0"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>NEW EXTRACTION</span>
        </Link>
      </div>

      {/* Top Telemetry / Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Documents Processed"
          value={isHistoryLoading ? "..." : totalDocuments}
          subtitle="Total files analyzed by Tesseract OCR"
          icon={<FileCheck className="w-5 h-5" />}
        />
        <StatCard
          title="Extracted Words"
          value={isHistoryLoading ? "..." : totalWords.toLocaleString()}
          subtitle="Parsed alphanumeric tokens"
          icon={<FileText className="w-5 h-5" />}
        />
        <StatCard
          title="Avg Confidence"
          value={isHistoryLoading ? "..." : averageConfidence}
          subtitle="Neural tensor match probability"
          icon={<Sparkles className="w-5 h-5" />}
        />
        <StatCard
          title="OCR Engine Health"
          value={health?.status === "ok" ? "ACTIVE" : isHealthLoading ? "CHECKING" : "OFFLINE"}
          subtitle={
            health?.status === "ok"
              ? `FastAPI • ${health?.supported_languages?.join(", ").toUpperCase() || "EN"}`
              : isHealthLoading
              ? "Connecting to backend..."
              : "Backend unavailable"
          }
          status={health?.status === "ok" ? "active" : isHealthLoading ? "warning" : "idle"}
          icon={<Activity className="w-5 h-5" />}
        />
      </div>

      {/* Main Grid: Recent Documents & Quick Action / Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Documents */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-sm font-semibold tracking-wider text-[#F5F7F5] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#39FF14]" />
              RECENT OCR DOCUMENTS
            </h3>
            {totalDocuments > 0 && (
              <Link
                href="/history"
                className="text-xs font-mono text-[#00E676] hover:text-[#39FF14] flex items-center gap-1 transition-colors"
              >
                <span>VIEW ALL ({totalDocuments})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Loading Skeletons */}
          {isHistoryLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="p-5 rounded-xl bg-[#111816]/60 border border-[#1A2720] animate-pulse h-48 flex flex-col justify-between"
                >
                  <div className="h-4 bg-[#1A2720] rounded w-2/3" />
                  <div className="h-16 bg-[#080B0A] rounded" />
                  <div className="h-4 bg-[#1A2720] rounded w-1/3" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isHistoryLoading && recentDocuments.length === 0 && (
            <div className="p-10 rounded-2xl bg-[#111816]/70 border border-[#1A2720] text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#0D1210] border border-[#1A2720] flex items-center justify-center text-[#8B9690] mx-auto mb-4">
                <FileText className="w-7 h-7 opacity-40" />
              </div>
              <h4 className="font-mono text-base font-semibold text-[#F5F7F5] mb-2">
                NO DOCUMENTS IN ARCHIVE
              </h4>
              <p className="text-sm text-[#8B9690] max-w-sm mx-auto font-sans mb-6">
                Start by scanning your first image to populate your neural extraction telemetry.
              </p>
              <Link
                href="/scanner"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-semibold text-[#080B0A] bg-[#39FF14] hover:bg-[#00E676] shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>SCAN FIRST IMAGE</span>
              </Link>
            </div>
          )}

          {/* Document Cards */}
          {!isHistoryLoading && recentDocuments.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentDocuments.map((doc) => (
                <DocumentCard
                  key={doc.document_id}
                  document={doc}
                  viewMode="grid"
                  onDeleteRequest={(d) => setDocumentToDelete(d)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Quick Upload & Live System Stream */}
        <div className="space-y-6">
          {/* Quick Scanner Shortcut Card */}
          <div className="p-6 rounded-2xl bg-[#111816]/90 border border-[#1A2720] relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-2 text-xs font-mono text-[#39FF14] uppercase tracking-wider mb-2">
              <UploadCloud className="w-4 h-4" />
              <span>INSTANT_SCANNER</span>
            </div>
            <h4 className="font-mono text-base font-semibold text-[#F5F7F5] mb-2">
              DRAG & DROP EXTRACTION
            </h4>
            <p className="text-xs text-[#8B9690] font-sans mb-5 leading-relaxed">
              Open the dedicated two-panel scanner workspace to upload images, inspect OCR line segmentation, and export TXT files.
            </p>

            <Link
              href="/scanner"
              className="w-full py-3 rounded-xl font-mono text-xs font-semibold text-[#080B0A] bg-[#39FF14] hover:bg-[#00E676] shadow-[0_0_15px_rgba(57,255,20,0.25)] flex items-center justify-center gap-2 transition-all"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>LAUNCH SCANNER WORKSPACE</span>
            </Link>
          </div>

          {/* Activity Feed */}
          <div className="p-6 rounded-2xl bg-[#111816]/90 border border-[#1A2720] backdrop-blur-md">
            <h4 className="font-mono text-xs font-semibold tracking-wider text-[#F5F7F5] flex items-center gap-2 mb-4">
              <Clock className="w-3.5 h-3.5 text-[#00E676]" />
              RECENT INGESTION LOGS
            </h4>

            {recentDocuments.length === 0 ? (
              <p className="text-xs font-mono text-[#8B9690]">
                No recent activity registered in system storage.
              </p>
            ) : (
              <div className="space-y-3 font-mono text-xs">
                {recentDocuments.map((doc) => (
                  <div
                    key={doc.document_id}
                    className="p-3 rounded-lg bg-[#080B0A] border border-[#1A2720]/60 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-[#F5F7F5] truncate text-[11px]" title={doc.filename}>
                        {doc.filename}
                      </div>
                      <div className="text-[10px] text-[#8B9690]">
                        {formatRelativeTime(doc.created_at)} • {doc.processing_time.toFixed(2)}s
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-[#39FF14] shrink-0">
                      {(doc.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
