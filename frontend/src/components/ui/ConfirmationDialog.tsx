"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationDialog({
  isOpen,
  title,
  description,
  confirmText = "Delete Document",
  cancelText = "Cancel",
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isLoading ? undefined : onCancel}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md p-6 rounded-xl bg-[#111816] border border-[#1A2720] shadow-[0_0_40px_rgba(0,0,0,0.8)] z-10"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-lg border ${
                  isDestructive
                    ? "bg-[#FF4D4D]/10 border-[#FF4D4D]/30 text-[#FF4D4D]"
                    : "bg-[#39FF14]/10 border-[#39FF14]/30 text-[#39FF14]"
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-mono font-semibold text-base text-[#F5F7F5] tracking-wide">
                  {title}
                </h3>
                <span className="text-xs font-mono text-[#8B9690] uppercase tracking-wider">
                  SYS_SECURITY_VERIFY
                </span>
              </div>
            </div>

            <button
              onClick={onCancel}
              disabled={isLoading}
              className="text-[#8B9690] hover:text-[#F5F7F5] p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-[#8B9690] leading-relaxed mb-6 font-sans">
            {description}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg text-xs font-mono text-[#8B9690] hover:text-[#F5F7F5] bg-[#0D1210] border border-[#1A2720] hover:border-[#1A2720]/80 transition-all disabled:opacity-50"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
                isDestructive
                  ? "bg-[#FF4D4D]/20 text-[#FF4D4D] border border-[#FF4D4D]/50 hover:bg-[#FF4D4D]/30 shadow-[0_0_15px_rgba(255,77,77,0.2)]"
                  : "bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/50 hover:bg-[#39FF14]/30 shadow-[0_0_15px_rgba(57,255,20,0.2)]"
              } disabled:opacity-50`}
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {isDestructive && <Trash2 className="w-3.5 h-3.5" />}
                  <span>{confirmText}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
