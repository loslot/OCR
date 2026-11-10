"use client";

import { useState } from "react";
import Link from "next/link";
import { Scan, Zap, LayoutDashboard, History, Menu, X } from "lucide-react";
import { useGetHealthQuery } from "@/lib/api/apiSlice";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingNavbar() {
  const { data: health, isSuccess, isLoading } = useGetHealthQuery();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "// FEATURES", href: "/#features" },
    { label: "// ARCHITECTURE", href: "/#how-it-works" },
    { label: "DASHBOARD", href: "/dashboard", icon: LayoutDashboard },
    { label: "HISTORY", href: "/history", icon: History },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#080B0A]/85 backdrop-blur-xl border-b border-[#1A2720]">
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

        {/* Desktop Center Nav */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6 font-mono text-xs text-[#8B9690]">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-[#39FF14] transition-colors flex items-center gap-1.5"
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right CTA & Status */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0D1210] border border-[#1A2720] text-[11px] font-mono">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSuccess
                  ? "bg-[#39FF14] animate-pulse"
                  : isLoading
                  ? "bg-[#FFB020] animate-ping"
                  : "bg-[#FF4D4D]"
              }`}
            />
            <span className="text-[#8B9690]">API</span>
            <span
              className={
                isSuccess
                  ? "text-[#39FF14]"
                  : isLoading
                  ? "text-[#FFB020]"
                  : "text-[#FF4D4D]"
              }
            >
              {isSuccess
                ? "v" + (health?.version || "1.0")
                : isLoading
                ? "CONNECTING"
                : "OFFLINE"}
            </span>
          </div>

          <Link
            href="/scanner"
            className="hidden sm:flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-xl font-mono text-[10px] md:text-xs font-semibold text-[#080B0A] bg-[#39FF14] hover:bg-[#00E676] shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:shadow-[0_0_25px_rgba(57,255,20,0.5)] transition-all"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>LAUNCH SCANNER</span>
          </Link>

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#111816] border border-[#1A2720] text-[#8B9690] hover:text-[#F5F7F5] focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#39FF14]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-b border-[#1A2720] bg-[#080B0A]/95 backdrop-blur-2xl px-4 py-5 overflow-hidden"
          >
            <nav className="flex flex-col gap-3 font-mono text-sm">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-xl bg-[#111816] border border-[#1A2720] hover:border-[#39FF14]/40 text-[#F5F7F5] flex items-center gap-3 transition-colors"
                  >
                    {Icon && <Icon className="w-4 h-4 text-[#39FF14]" />}
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              <div className="pt-2 flex flex-col gap-3">
                <Link
                  href="/scanner"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 px-4 rounded-xl font-mono text-xs font-semibold text-[#080B0A] bg-[#39FF14] hover:bg-[#00E676] shadow-[0_0_20px_rgba(57,255,20,0.3)] flex items-center justify-center gap-2 transition-all"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>LAUNCH SCANNER</span>
                </Link>

                <div className="p-2.5 rounded-xl bg-[#0D1210] border border-[#1A2720] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#8B9690]">BACKEND STATUS:</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSuccess
                          ? "bg-[#39FF14] animate-pulse"
                          : isLoading
                          ? "bg-[#FFB020] animate-ping"
                          : "bg-[#FF4D4D]"
                      }`}
                    />
                    <span
                      className={
                        isSuccess
                          ? "text-[#39FF14]"
                          : isLoading
                          ? "text-[#FFB020]"
                          : "text-[#FF4D4D]"
                      }
                    >
                      {isSuccess ? "CONNECTED" : isLoading ? "CONNECTING..." : "DISCONNECTED"}
                    </span>
                  </div>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
