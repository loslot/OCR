"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { UploadCloud, Image as ImageIcon, AlertCircle } from "lucide-react";
import { validateUploadFile, ALLOWED_EXTENSIONS } from "@/lib/validations/ocr";
import { toast } from "sonner";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export default function UploadZone({
  onFileSelected,
  disabled = false,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const processFile = (file: File) => {
    setErrorMessage(null);
    const validation = validateUploadFile(file);
    if (!validation.valid) {
      const err = validation.error || "Invalid file.";
      setErrorMessage(err);
      toast.error(err);
      return;
    }
    onFileSelected(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`relative group cursor-pointer rounded-2xl p-8 sm:p-12 text-center border-2 border-dashed transition-all duration-300 backdrop-blur-md overflow-hidden ${
          isDragging
            ? "border-[#39FF14] bg-[#39FF14]/10 shadow-[0_0_25px_rgba(57,255,20,0.2)]"
            : "border-[#1A2720] hover:border-[#39FF14]/50 bg-[#111816]/70 hover:bg-[#111816]"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        {/* Corner Reticle Accents */}
        <span className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#39FF14]/40 group-hover:border-[#39FF14] transition-colors" />
        <span className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#39FF14]/40 group-hover:border-[#39FF14] transition-colors" />
        <span className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#39FF14]/40 group-hover:border-[#39FF14] transition-colors" />
        <span className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#39FF14]/40 group-hover:border-[#39FF14] transition-colors" />

        {/* Center Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-[#0D1210] border border-[#1A2720] flex items-center justify-center text-[#00E676] group-hover:text-[#39FF14] group-hover:border-[#39FF14]/40 group-hover:scale-105 transition-all duration-300 shadow-md">
          {isDragging ? (
            <UploadCloud className="w-8 h-8 animate-bounce text-[#39FF14]" />
          ) : (
            <ImageIcon className="w-8 h-8" />
          )}
        </div>

        {/* Text */}
        <h3 className="mt-5 text-base sm:text-lg font-mono font-semibold text-[#F5F7F5] group-hover:text-[#39FF14] transition-colors">
          {isDragging ? "DROP IMAGE TO INITIALIZE SCAN" : "DRAG & DROP IMAGE HERE"}
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-[#8B9690] font-sans max-w-sm mx-auto">
          Or <span className="text-[#39FF14] underline underline-offset-4">browse file</span> from your device. Supports PNG, JPG, JPEG, and WEBP.
        </p>

        {/* Format & Size badges */}
        <div className="mt-6 flex items-center justify-center gap-2 flex-wrap text-[11px] font-mono text-[#8B9690]">
          <span className="px-2 py-0.5 rounded bg-[#080B0A] border border-[#1A2720]">
            MAX: 10 MB
          </span>
          {ALLOWED_EXTENSIONS.map((ext) => (
            <span
              key={ext}
              className="px-2 py-0.5 rounded bg-[#080B0A] border border-[#1A2720]"
            >
              {ext.toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      {/* Validation Error Banner */}
      {errorMessage && (
        <div className="mt-3 p-3 rounded-lg bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 text-[#FF4D4D] text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
