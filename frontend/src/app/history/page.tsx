"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  LayoutGrid,
  List as ListIcon,
  RefreshCw,
  Zap,
  AlertCircle,
  FileQuestion,
  Filter,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DocumentCard from "@/components/ui/DocumentCard";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import {
  useGetHistoryQuery,
  useDeleteDocumentMutation,
} from "@/lib/api/apiSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setViewMode } from "@/lib/store/scannerSlice";
import type { OCRResponse } from "@/types/ocr";
import { toast } from "sonner";

export default function HistoryPage() {
  const dispatch = useAppDispatch();
  const { viewMode } = useAppSelector((state) => state.scanner);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<string>("all");
  const [documentToDelete, setDocumentToDelete] = useState<OCRResponse | null>(null);

  const {
    data: history,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetHistoryQuery();

  const [deleteDocument, { isLoading: isDeleting }] = useDeleteDocumentMutation();

  // Filtered documents by filename / text and language
  const filteredDocuments = useMemo(() => {
    const items = history?.items || [];
    return items.filter((doc) => {
      const matchesSearch =
        doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.extracted_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.document_id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLang =
        selectedLanguageFilter === "all" ||
        doc.language.toLowerCase() === selectedLanguageFilter.toLowerCase();

      return matchesSearch && matchesLang;
    });
  }, [history?.items, searchTerm, selectedLanguageFilter]);

  const totalCount = history?.items?.length || 0;

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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-mono text-2xl sm:text-3xl font-bold text-[#F5F7F5] tracking-tight">
            DOCUMENT ARCHIVE // HISTORY
          </h1>
          <p className="mt-1 text-sm text-[#8B9690] font-sans">
            Browse, inspect, search, and manage previously extracted OCR records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 rounded-xl bg-[#111816] border border-[#1A2720] hover:border-[#39FF14]/40 text-[#8B9690] hover:text-[#39FF14] transition-all disabled:opacity-50"
            title="Refresh History"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-[#39FF14]" : ""}`} />
          </button>

          <Link
            href="/scanner"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-semibold text-[#080B0A] bg-[#39FF14] hover:bg-[#00E676] shadow-[0_0_15px_rgba(57,255,20,0.3)] transition-all shrink-0"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>NEW SCAN</span>
          </Link>
        </div>
      </div>

      {/* Toolbar: Search, Filters, View Mode */}
      <div className="p-4 rounded-2xl bg-[#111816]/90 border border-[#1A2720] mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 backdrop-blur-md">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8B9690] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by filename or extracted text keywords..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080B0A] border border-[#1A2720] focus:border-[#39FF14]/50 focus:ring-1 focus:ring-[#39FF14]/30 text-xs font-mono text-[#F5F7F5] outline-none transition-all placeholder:text-[#8B9690]/60"
          />
        </div>

        {/* Filter by Language & View Toggle */}
        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-[#080B0A] p-1 rounded-xl border border-[#1A2720] text-xs font-mono">
            <span className="text-[#8B9690] px-2 flex items-center gap-1">
              <Filter className="w-3 h-3 text-[#39FF14]" />
              LANG:
            </span>
            {["all", "en", "km", "km+en"].map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguageFilter(lang)}
                className={`px-2.5 py-1 rounded-lg transition-colors uppercase ${
                  selectedLanguageFilter === lang
                    ? "bg-[#39FF14]/15 text-[#39FF14] font-semibold border border-[#39FF14]/30"
                    : "text-[#8B9690] hover:text-[#F5F7F5]"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center gap-1 bg-[#080B0A] p-1 rounded-xl border border-[#1A2720]">
            <button
              onClick={() => dispatch(setViewMode("grid"))}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-[#111816] text-[#39FF14] border border-[#39FF14]/30"
                  : "text-[#8B9690] hover:text-[#F5F7F5]"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => dispatch(setViewMode("list"))}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-[#111816] text-[#39FF14] border border-[#39FF14]/30"
                  : "text-[#8B9690] hover:text-[#F5F7F5]"
              }`}
              title="List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      {!isLoading && !isError && (
        <div className="flex items-center justify-between text-xs font-mono text-[#8B9690] mb-4 px-1">
          <span>
            SHOWING {filteredDocuments.length} OF {totalCount} STORED RECORDS
          </span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-[#39FF14] hover:underline"
            >
              CLEAR SEARCH
            </button>
          )}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="p-8 rounded-2xl bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 text-center max-w-lg mx-auto my-12">
          <AlertCircle className="w-10 h-10 text-[#FF4D4D] mx-auto mb-3" />
          <h3 className="font-mono text-base font-semibold text-[#F5F7F5] mb-2">
            FAILED TO RETRIEVE HISTORY
          </h3>
          <p className="text-xs font-sans text-[#8B9690] mb-6">
            Could not connect to FastAPI server at http://localhost:8002. Please ensure the backend is running.
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl font-mono text-xs font-semibold text-[#080B0A] bg-[#39FF14] hover:bg-[#00E676] transition-all"
          >
            RETRY CONNECTION
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-[#111816]/60 border border-[#1A2720] animate-pulse h-48 flex flex-col justify-between"
            >
              <div className="h-4 bg-[#1A2720] rounded w-3/4" />
              <div className="h-20 bg-[#080B0A] rounded" />
              <div className="h-4 bg-[#1A2720] rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredDocuments.length === 0 && (
        <div className="p-12 sm:p-16 rounded-3xl bg-[#111816]/70 border border-[#1A2720] text-center max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-[#0D1210] border border-[#1A2720] flex items-center justify-center text-[#8B9690] mx-auto mb-4">
            <FileQuestion className="w-8 h-8 opacity-40" />
          </div>
          <h3 className="font-mono text-lg font-semibold text-[#F5F7F5] mb-2">
            {searchTerm ? "NO MATCHING RECORDS FOUND" : "NO OCR DOCUMENTS RECORDED"}
          </h3>
          <p className="text-sm font-sans text-[#8B9690] mb-8 leading-relaxed">
            {searchTerm
              ? `No documents matching query "${searchTerm}". Try a different filename or keyword.`
              : "No image scans have been stored in the backend yet. Launch the OCR scanner to process your first document."}
          </p>

          <Link
            href="/scanner"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-xs font-semibold text-[#080B0A] bg-[#39FF14] hover:bg-[#00E676] shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>LAUNCH SCANNER</span>
          </Link>
        </div>
      )}

      {/* Document Records */}
      {!isLoading && !isError && filteredDocuments.length > 0 && (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.document_id}
              document={doc}
              viewMode={viewMode}
              onDeleteRequest={(d) => setDocumentToDelete(d)}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
