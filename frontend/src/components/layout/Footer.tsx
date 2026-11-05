import Link from "next/link";
import { Scan } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[#1A2720] bg-[#080B0A] relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#1A2720]/60">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#111816] border border-[#1A2720] flex items-center justify-center text-[#39FF14]">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <span className="font-mono font-bold text-sm text-[#F5F7F5] tracking-wider">
                Quick<span className="text-[#39FF14]">OCR</span>
              </span>
              <span className="text-xs font-mono text-[#8B9690] block">
                Advanced Local Neural Optical Character Extraction
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-6 text-xs font-mono text-[#8B9690]">
            <Link href="/scanner" className="hover:text-[#39FF14] transition-colors">
              {"// SCANNER"}
            </Link>
            <Link href="/dashboard" className="hover:text-[#39FF14] transition-colors">
              {"// DASHBOARD"}
            </Link>
            <Link href="/history" className="hover:text-[#39FF14] transition-colors">
              {"// HISTORY"}
            </Link>
          </div>
        </div>

        {/* Bottom copyright & specs */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#8B9690]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14]" />
            <span>POWERED BY FASTAPI • EASYOCR • OPENCV • NEXT.JS</span>
          </div>

          <div>
            &copy; {new Date().getFullYear()} QuickOCR. All rights reserved. Zero database dependency.
          </div>
        </div>
      </div>
    </footer>
  );
}
