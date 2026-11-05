"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Zap, Terminal } from "lucide-react";
import { useGetHealthQuery } from "@/lib/api/apiSlice";

interface NavbarProps {
  onToggleMobileSidebar: () => void;
}

export default function Navbar({ onToggleMobileSidebar }: NavbarProps) {
  const pathname = usePathname();
  const { isSuccess } = useGetHealthQuery();

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "OVERVIEW_DASHBOARD";
    if (pathname === "/scanner") return "OPTICAL_SCANNER_WORKSPACE";
    if (pathname === "/history") return "DOCUMENT_ARCHIVE_HISTORY";
    if (pathname.startsWith("/documents/")) return "DOCUMENT_TELEMETRY_DETAIL";
    return "CYBER_TERMINAL";
  };

  return (
    <header className="h-16 border-b border-[#1A2720] bg-[#080B0A]/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between z-30">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg bg-[#111816] border border-[#1A2720] text-[#8B9690] hover:text-[#F5F7F5] transition-colors"
          title="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#39FF14] hidden sm:block" />
          <h2 className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-[#F5F7F5]">
            {getPageTitle()}
          </h2>
        </div>
      </div>

      {/* Right: Health Telemetry & Action */}
      <div className="flex items-center gap-3">
        {/* Backend Status indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#111816] border border-[#1A2720] text-xs font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              isSuccess ? "bg-[#39FF14] shadow-[0_0_8px_#39FF14]" : "bg-[#FF4D4D]"
            }`}
          />
          <span className="text-[#8B9690]">API:</span>
          <span className={isSuccess ? "text-[#39FF14]" : "text-[#FF4D4D]"}>
            {isSuccess ? "LINK_ESTABLISHED" : "DISCONNECTED"}
          </span>
        </div>

        {/* New Scan Button shortcut */}
        {pathname !== "/scanner" && (
          <Link
            href="/scanner"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-[#080B0A] bg-[#39FF14] hover:bg-[#00E676] shadow-[0_0_15px_rgba(57,255,20,0.25)] transition-all"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">NEW SCAN</span>
          </Link>
        )}
      </div>
    </header>
  );
}
