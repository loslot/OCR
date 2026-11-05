"use client";

import Link from "next/link";
import { Scan, Zap, LayoutDashboard, History } from "lucide-react";
import { useGetHealthQuery } from "@/lib/api/apiSlice";

export default function LandingNavbar() {
  const { data: health, isSuccess } = useGetHealthQuery();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#080B0A]/80 backdrop-blur-xl border-b border-[#1A2720]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#111816] border border-[#1A2720] group-hover:border-[#39FF14]/50 flex items-center justify-center text-[#39FF14] shadow-[0_0_12px_rgba(57,255,20,0.15)] transition-all">
            <Scan className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <div className="font-mono font-bold text-base text-[#F5F7F5] tracking-wider flex items-center gap-1.5">
            <span>Quick</span>
            <span className="text-[#39FF14]">OCR</span>
          </div>
        </Link>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-6 font-mono text-xs text-[#8B9690]">
          <Link
            href="/#features"
            className="hover:text-[#39FF14] transition-colors"
          >
            {"// FEATURES"}
          </Link>
          <Link
            href="/#how-it-works"
            className="hover:text-[#39FF14] transition-colors"
          >
            {"// ARCHITECTURE"}
          </Link>
          <Link
            href="/dashboard"
            className="hover:text-[#39FF14] transition-colors flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>DASHBOARD</span>
          </Link>
          <Link
            href="/history"
            className="hover:text-[#39FF14] transition-colors flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5" />
            <span>HISTORY</span>
          </Link>
        </nav>

        {/* Right CTA & Status */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0D1210] border border-[#1A2720] text-[11px] font-mono">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSuccess ? "bg-[#39FF14] animate-pulse" : "bg-[#FF4D4D]"
              }`}
            />
            <span className="text-[#8B9690]">API</span>
            <span className={isSuccess ? "text-[#39FF14]" : "text-[#FF4D4D]"}>
              {isSuccess ? "v" + (health?.version || "1.0") : "OFFLINE"}
            </span>
          </div>

          <Link
            href="/scanner"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-mono text-xs font-semibold text-[#080B0A] bg-[#39FF14] hover:bg-[#00E676] shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:shadow-[0_0_25px_rgba(57,255,20,0.5)] transition-all"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>LAUNCH SCANNER</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
