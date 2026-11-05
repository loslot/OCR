import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { SupportedLanguage } from "@/types/ocr";

interface ScannerState {
  selectedLanguage: SupportedLanguage;
  filePreviewUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  activeDocumentId: string | null;
  isEditingText: boolean;
  editedText: string | null;
  searchQuery: string;
  viewMode: "grid" | "list";
}

const initialState: ScannerState = {
  selectedLanguage: "en",
  filePreviewUrl: null,
  fileName: null,
  fileSize: null,
  activeDocumentId: null,
  isEditingText: false,
  editedText: null,
  searchQuery: "",
  viewMode: "grid",
};

export const scannerSlice = createSlice({
  name: "scanner",
  initialState,
  reducers: {
    setSelectedLanguage: (state, action: PayloadAction<SupportedLanguage>) => {
      state.selectedLanguage = action.payload;
    },
    setFilePreview: (
      state,
      action: PayloadAction<{
        previewUrl: string;
        fileName: string;
        fileSize: number;
      }>
    ) => {
      state.filePreviewUrl = action.payload.previewUrl;
      state.fileName = action.payload.fileName;
      state.fileSize = action.payload.fileSize;
    },
    clearFilePreview: (state) => {
      state.filePreviewUrl = null;
      state.fileName = null;
      state.fileSize = null;
      state.isEditingText = false;
      state.editedText = null;
    },
    setActiveDocumentId: (state, action: PayloadAction<string | null>) => {
      state.activeDocumentId = action.payload;
    },
    setIsEditingText: (state, action: PayloadAction<boolean>) => {
      state.isEditingText = action.payload;
    },
    setEditedText: (state, action: PayloadAction<string | null>) => {
      state.editedText = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setViewMode: (state, action: PayloadAction<"grid" | "list">) => {
      state.viewMode = action.payload;
    },
    resetScanner: (state) => {
      state.filePreviewUrl = null;
      state.fileName = null;
      state.fileSize = null;
      state.isEditingText = false;
      state.editedText = null;
    },
  },
});

export const {
  setSelectedLanguage,
  setFilePreview,
  clearFilePreview,
  setActiveDocumentId,
  setIsEditingText,
  setEditedText,
  setSearchQuery,
  setViewMode,
  resetScanner,
} = scannerSlice.actions;

export default scannerSlice.reducer;
