"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface DetectedWord {
  word: string;
  length: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export default function CursorScanner() {
  const [enabled, setEnabled] = useState(false);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [activeWord, setActiveWord] = useState<DetectedWord | null>(null);

  // Raw cursor position
  const rawX = useMotionValue(-200);
  const rawY = useMotionValue(-200);

  // Target width & height motion values (for buttery smooth spring resizing)
  const rawTargetWidth = useMotionValue(32);
  const rawTargetHeight = useMotionValue(32);

  // Spring physics for coordinates (fluid inertia following the mouse pointer)
  const springConfig = { damping: 26, stiffness: 320, mass: 0.45 };
  const cursorX = useSpring(rawX, springConfig);
  const cursorY = useSpring(rawY, springConfig);

  // Spring physics for dynamic word-length sizing
  const sizeSpringConfig = { damping: 24, stiffness: 300, mass: 0.4 };
  const reticleWidth = useSpring(rawTargetWidth, sizeSpringConfig);
  const reticleHeight = useSpring(rawTargetHeight, sizeSpringConfig);

  // Soft spotlight spring with slightly higher damping for fluid ambient lighting
  const spotX = useSpring(rawX, { damping: 35, stiffness: 220 });
  const spotY = useSpring(rawY, { damping: 35, stiffness: 220 });

  // Store last detected word name to prevent unnecessary React state updates
  const lastWordRef = useRef<string | null>(null);

  useEffect(() => {
    // Check touch devices or prefers-reduced-motion
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (isTouch || prefersReducedMotion) {
      return;
    }

    setEnabled(true);

    // Dynamic word detection helper
    const detectWordUnderPoint = (x: number, y: number): DetectedWord | null => {
      let range: Range | null = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const doc = document as any;

      if (typeof doc.caretRangeFromPoint === "function") {
        range = doc.caretRangeFromPoint(x, y);
      } else if (typeof doc.caretPositionFromPoint === "function") {
        const pos = doc.caretPositionFromPoint(x, y);
        if (pos && pos.offsetNode) {
          try {
            range = document.createRange();
            range.setStart(pos.offsetNode, pos.offset);
            range.setEnd(pos.offsetNode, pos.offset);
          } catch {
            range = null;
          }
        }
      }

      if (!range) return null;

      const node = range.startContainer;
      if (!node || node.nodeType !== Node.TEXT_NODE) return null;

      const text = node.textContent;
      if (!text || !text.trim()) return null;

      let offset = range.startOffset;
      if (offset >= text.length || /\s/.test(text[offset])) {
        if (offset > 0 && !/\s/.test(text[offset - 1])) {
          offset = offset - 1;
        } else {
          return null;
        }
      }

      // Scan left to find word boundary
      let start = offset;
      while (start > 0 && !/\s/.test(text[start - 1])) {
        start--;
      }

      // Scan right to find word boundary
      let end = offset;
      while (end < text.length && !/\s/.test(text[end])) {
        end++;
      }

      const rawWord = text.slice(start, end);
      // Clean word boundaries (strip leading/trailing punctuation)
      const cleanWord = rawWord.replace(
        /^[^\w\u1780-\u17FF]+|[^\w\u1780-\u17FF]+$/g,
        ""
      );
      if (!cleanWord || cleanWord.length === 0) return null;

      try {
        const wordRange = document.createRange();
        const prefixOffset = rawWord.indexOf(cleanWord);
        const wordStart = start + (prefixOffset >= 0 ? prefixOffset : 0);
        const wordEnd = wordStart + cleanWord.length;

        wordRange.setStart(node, wordStart);
        wordRange.setEnd(node, wordEnd);
        const rect = wordRange.getBoundingClientRect();

        if (rect.width > 0 && rect.height > 0) {
          const paddingX = 20;
          const paddingY = 16;
          // Validate cursor is within vicinity of word
          if (
            x >= rect.left - paddingX &&
            x <= rect.right + paddingX &&
            y >= rect.top - paddingY &&
            y <= rect.bottom + paddingY
          ) {
            return {
              word: cleanWord,
              length: cleanWord.length,
              width: rect.width,
              height: rect.height,
              centerX: rect.left + rect.width / 2,
              centerY: rect.top + rect.height / 2,
            };
          }
        }
      } catch {
        return null;
      }

      return null;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const clientX = e.clientX;
      const clientY = e.clientY;

      rawX.set(clientX);
      rawY.set(clientY);

      // Check if cursor is over interactive elements
      const target = e.target as HTMLElement | null;
      const isInteractive = Boolean(
        target &&
          (target.closest("button") ||
            target.closest("a") ||
            target.closest("input") ||
            target.closest("textarea") ||
            target.closest("select") ||
            target.closest("[role='button']") ||
            target.closest(".interactive"))
      );
      setIsHoveringInteractive(isInteractive);

      // Detect word under cursor
      const detected = detectWordUnderPoint(clientX, clientY);

      if (detected) {
        // Dynamically adjust reticle width to match word length + padding
        const newWidth = Math.max(48, Math.round(detected.width + 16));
        const newHeight = Math.max(26, Math.round(detected.height + 8));

        rawTargetWidth.set(newWidth);
        rawTargetHeight.set(newHeight);

        if (lastWordRef.current !== detected.word) {
          lastWordRef.current = detected.word;
          setActiveWord(detected);
        }
      } else {
        // Default size when over empty space or interactive buttons without text
        const defaultSize = isInteractive ? 42 : 30;
        rawTargetWidth.set(defaultSize);
        rawTargetHeight.set(defaultSize);

        if (lastWordRef.current !== null) {
          lastWordRef.current = null;
          setActiveWord(null);
        }
      }
    };

    const handlePointerDown = () => {
      setIsClicking(true);
    };

    const handlePointerUp = () => {
      setIsClicking(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [rawX, rawY, rawTargetWidth, rawTargetHeight]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
    >
      {/* 1. Soft green cursor-following spotlight */}
      <motion.div
        style={{
          x: spotX,
          y: spotY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        className="absolute w-[360px] h-[360px] rounded-full bg-[radial-gradient(circle,rgba(57,255,20,0.06)_0%,rgba(0,230,118,0.02)_40%,transparent_70%)] blur-[40px] pointer-events-none will-change-transform"
      />

      {/* 2. Cyber Scanner Reticle / Crosshair that moves around with cursor */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        className="absolute pointer-events-none flex flex-col items-center justify-center will-change-transform"
      >
        {/* Dynamic HUD Word Length & Telemetry Pill */}
        {activeWord && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-7 px-2 py-0.5 rounded bg-[#080B0A]/95 border border-[#39FF14]/50 shadow-[0_0_10px_rgba(57,255,20,0.25)] text-[10px] font-mono text-[#39FF14] whitespace-nowrap tracking-wider flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse" />
            <span className="text-[#8B9690]">&ldquo;</span>
            <span className="font-semibold">{activeWord.word}</span>
            <span className="text-[#8B9690]">&rdquo;</span>
            <span className="text-[#8B9690]">•</span>
            <span className="text-[#00E676]">{activeWord.length} CH</span>
            <span className="text-[#8B9690]">•</span>
            <span className="text-[#8B9690]">{Math.round(activeWord.width)}PX</span>
          </motion.div>
        )}

        {/* Viewfinder Box that dynamically fits the word length */}
        <motion.div
          style={{
            width: reticleWidth,
            height: reticleHeight,
          }}
          className={`relative border rounded-sm flex items-center justify-center transition-colors duration-150 ${
            activeWord
              ? "border-[#39FF14] bg-[#39FF14]/[0.08] shadow-[0_0_15px_rgba(57,255,20,0.3)]"
              : isHoveringInteractive
              ? "border-[#39FF14] bg-[#39FF14]/[0.04]"
              : "border-[rgba(57,255,20,0.4)] border-dashed"
          }`}
        >
          {/* 4 Viewfinder Corner Brackets */}
          <span className="absolute -top-[2px] -left-[2px] w-2 h-2 border-t-2 border-l-2 border-[#39FF14]" />
          <span className="absolute -top-[2px] -right-[2px] w-2 h-2 border-t-2 border-r-2 border-[#39FF14]" />
          <span className="absolute -bottom-[2px] -left-[2px] w-2 h-2 border-b-2 border-l-2 border-[#39FF14]" />
          <span className="absolute -bottom-[2px] -right-[2px] w-2 h-2 border-b-2 border-r-2 border-[#39FF14]" />

          {/* Laser Scanline Beam inside Word Box */}
          {activeWord && (
            <motion.div
              animate={{
                left: ["0%", "100%", "0%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-0 bottom-0 w-[2px] bg-[#39FF14] shadow-[0_0_8px_#39FF14] opacity-80 pointer-events-none"
            />
          )}

          {/* Center Precision Aim Crosshair */}
          <div className="relative flex items-center justify-center">
            {/* Horizontal crosshair ticks */}
            <span className="w-2.5 h-[1px] bg-[#39FF14]/60" />
            {/* Center Dot */}
            <motion.div
              animate={{
                scale: isClicking ? 1.6 : activeWord ? 1.2 : 1,
                backgroundColor: activeWord || isHoveringInteractive ? "#39FF14" : "#00E676",
              }}
              className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_#39FF14] mx-[1px]"
            />
            {/* Horizontal crosshair ticks */}
            <span className="w-2.5 h-[1px] bg-[#39FF14]/60" />
          </div>
        </motion.div>

        {/* Click Scanner Ring Ripple */}
        {isClicking && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0.9 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute w-12 h-12 rounded-full border border-[#39FF14] shadow-[0_0_15px_#39FF14]"
          />
        )}
      </motion.div>
    </div>
  );
}
