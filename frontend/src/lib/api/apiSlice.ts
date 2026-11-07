import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  OCRResponse,
  HistoryResponse,
  DeleteResponse,
  HealthResponse,
} from "@/types/ocr";
import {
  ocrResponseSchema,
  historyResponseSchema,
  healthResponseSchema,
} from "@/lib/validations/ocr";
import { API_BASE_URL, API_ENDPOINTS } from "./config";

export const apiSlice = createApi({
  reducerPath: "ocrApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    timeout: 60000,
    // Note: Do NOT set Content-Type header manually so multipart/form-data sets boundary correctly
  }),
  tagTypes: ["History", "Document", "Health"],
  endpoints: (builder) => ({
    // 1. Health Check
    getHealth: builder.query<HealthResponse, void>({
      query: () => API_ENDPOINTS.HEALTH,
      providesTags: ["Health"],
      transformResponse: (response: unknown) => {
        const parsed = healthResponseSchema.safeParse(response);
        if (parsed.success) {
          return parsed.data;
        }
        return response as HealthResponse;
      },
    }),

    // 2. Extract Text from Image
    extractText: builder.mutation<
      OCRResponse,
      { file: File; language?: string }
    >({
      query: ({ file, language = "en" }) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("language", language);

        return {
          url: API_ENDPOINTS.EXTRACT,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["History"],
      transformResponse: (response: unknown) => {
        const parsed = ocrResponseSchema.safeParse(response);
        if (parsed.success) {
          return parsed.data;
        }
        return response as OCRResponse;
      },
    }),

    // 3. Document History
    getHistory: builder.query<HistoryResponse, void>({
      query: () => API_ENDPOINTS.HISTORY,
      providesTags: ["History"],
      transformResponse: (response: unknown) => {
        const parsed = historyResponseSchema.safeParse(response);
        if (parsed.success) {
          return parsed.data;
        }
        return response as HistoryResponse;
      },
    }),

    // 4. Single Document Detail
    getDocumentById: builder.query<OCRResponse, string>({
      query: (documentId) => API_ENDPOINTS.DOCUMENT_BY_ID(documentId),
      providesTags: (_result, _error, id) => [{ type: "Document", id }],
      transformResponse: (response: unknown) => {
        const parsed = ocrResponseSchema.safeParse(response);
        if (parsed.success) {
          return parsed.data;
        }
        return response as OCRResponse;
      },
    }),

    // 5. Delete Document
    deleteDocument: builder.mutation<DeleteResponse, string>({
      query: (documentId) => ({
        url: API_ENDPOINTS.DOCUMENT_BY_ID(documentId),
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        "History",
        { type: "Document", id },
      ],
    }),
  }),
});

export const {
  useGetHealthQuery,
  useExtractTextMutation,
  useGetHistoryQuery,
  useGetDocumentByIdQuery,
  useDeleteDocumentMutation,
} = apiSlice;
