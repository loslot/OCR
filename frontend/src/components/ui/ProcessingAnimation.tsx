"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Terminal, Cpu, Sparkles } from "lucide-react";

const TELEMETRY_LOGS = [
  "INGESTING IMAGE STREAM...",
  "INITIALIZING OPENCV PREPROCESSOR...",
  "NORMALIZING CONTRAST & ADAPTIVE THRESHOLD...",
  "COMPUTING EASYOCR NEURAL TENSORS...",
  "EVALUATING BOUNDING BOX SEGMENTS...",
  "CALCULATING STATISTICAL CONFIDENCE MATRIX...",
  "PARSING EXTRACTED TEXT BUFFER...",
  "FINALIZING METADATA ENCODING...",
];

export default function ProcessingAnimation() {
  const [logIndex, setLogIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const logInterval = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % TELEMETRY_LOGS.length);
    }, 450);

    const timerInterval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(logInterval);
      clearInterval(timerInterval);
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[320px] rounded-xl bg-[#080B0A]/95 border border-[#1A2720] p-6 flex flex-col justify-between overflow-hidden">
      {/* Background cyber laser grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#39FF14_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

      {/* Sweeping laser scanner beam */}
      <motion.div
        animate={{
          top: ["0%", "100%", "0%"],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#39FF14] to-transparent shadow-[0_0_15px_#39FF14] z-10 pointer-events-none"
      />

      {/* Top Status */}
      <div className="relative z-10 flex items-center justify-between border-b border-[#1A2720] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14]">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-mono text-sm font-semibold text-[#F5F7F5] tracking-wide flex items-center gap-2">
              NEURAL OCR SCANNING
              <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-ping" />
            </h4>
            <span className="text-[11px] font-mono text-[#8B9690]">
              CORE // GPU_EMULATION_ACCELERATED
            </span>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded bg-[#0D1210] border border-[#1A2720] text-xs font-mono text-[#39FF14]">
          SCAN_ACTIVE
        </span>
      </div>

      {/* Center Radar / Waveform Visualizer */}
      <div className="relative z-10 my-8 flex flex-col items-center justify-center">
        <div className="relative w-28 h-28 rounded-full border border-[#1A2720] flex items-center justify-center">
          {/* Animated concentric rings */}
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full border border-[#39FF14]/40"
          />
          <motion.div
            animate={{ scale: [1.2, 1.6, 1.2], opacity: [0.3, 0.05, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            className="absolute inset-0 rounded-full border border-[#00E676]/30"
          />
          <div className="w-12 h-12 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/50 flex items-center justify-center shadow-[0_0_20px_rgba(57,255,20,0.3)]">
            <Sparkles className="w-6 h-6 text-[#39FF14] animate-spin" />
          </div>
        </div>

        <p className="mt-4 text-xs font-mono text-[#8B9690] tracking-wider">
          ANALYZING PIXEL FREQUENCIES
        </p>
      </div>

      {/* Terminal Telemetry Logs & Cold Start Notice */}
      <div className="relative z-10 space-y-2">
        {elapsedSeconds > 5 && (
          <div className="p-2.5 rounded-lg bg-[#FFB020]/10 border border-[#FFB020]/30 text-[#FFB020] text-xs font-mono flex items-center justify-between">
            <span>Render cold-start in progress: Initializing backend container...</span>
            <span className="font-semibold">{elapsedSeconds}s</span>
          </div>
        )}

        <div className="p-3 rounded-lg bg-[#050706] border border-[#1A2720] font-mono text-xs">
          <div className="flex items-center justify-between text-[#8B9690] mb-2 border-b border-[#1A2720]/60 pb-1.5">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#39FF14]" />
              <span className="text-[10px] uppercase tracking-wider">OCR_PIPELINE_STDOUT</span>
            </div>
            <span className="text-[10px] text-[#39FF14]">{elapsedSeconds}s ELAPSED</span>
          </div>
          <div className="text-[#39FF14] flex items-center gap-2">
            <span className="text-[#8B9690]">&gt;</span>
            <span className="truncate">{TELEMETRY_LOGS[logIndex]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
