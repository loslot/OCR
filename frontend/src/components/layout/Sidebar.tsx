"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Scan,
  History,
  Home,
  Activity,
  Zap,
  X,
} from "lucide-react";
import { useGetHealthQuery } from "@/lib/api/apiSlice";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onCloseMobile?: () => void;
}

export default function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { data: health, isSuccess, isError } = useGetHealthQuery(undefined, {
    pollingInterval: 15000,
  });

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "OCR Scanner",
      href: "/scanner",
      icon: Scan,
    },
    {
      label: "History",
      href: "/history",
      icon: History,
    },
    {
      label: "Landing Page",
      href: "/",
      icon: Home,
    },
  ];

  return (
    <aside className="w-64 h-full bg-[#0D1210]/95 border-r border-[#1A2720] flex flex-col justify-between p-5 backdrop-blur-xl">
      {/* Top: Logo & System Identity */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            onClick={onCloseMobile}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#111816] border border-[#1A2720] group-hover:border-[#39FF14]/50 flex items-center justify-center text-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.15)] transition-all">
              <Scan className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div>
              <div className="font-mono font-bold text-base text-[#F5F7F5] tracking-wider flex items-center gap-1.5">
                <span>Quick</span>
                <span className="text-[#39FF14]">OCR</span>
              </div>
              <div className="text-[10px] font-mono text-[#8B9690] uppercase tracking-widest">
                CYBER_NEURAL_v1.0
              </div>
            </div>
          </Link>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg bg-[#111816] border border-[#1A2720] text-[#8B9690] hover:text-[#F5F7F5]"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#8B9690] px-3 mb-2">
            TERMINAL_NAV
          </div>
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-mono text-xs tracking-wide transition-all group relative",
                  isActive
                    ? "bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 shadow-[0_0_15px_rgba(57,255,20,0.1)]"
                    : "text-[#8B9690] hover:text-[#F5F7F5] hover:bg-[#111816] border border-transparent"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive
                      ? "text-[#39FF14]"
                      : "text-[#8B9690] group-hover:text-[#F5F7F5]"
                  )}
                />
                <span>{item.label}</span>

                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#39FF14] shadow-[0_0_8px_#39FF14]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Quick Scan CTA */}
        <div className="mt-8 pt-6 border-t border-[#1A2720]">
          <Link
            href="/scanner"
            onClick={onCloseMobile}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl font-mono text-xs font-semibold text-[#080B0A] bg-[#39FF14] hover:bg-[#00E676] shadow-[0_0_15px_rgba(57,255,20,0.3)] transition-all"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>LAUNCH SCANNER</span>
          </Link>
        </div>
      </div>

      {/* Bottom: Live Backend API Health & Telemetry */}
      <div className="pt-4 border-t border-[#1A2720]">
        <div className="p-3 rounded-xl bg-[#080B0A] border border-[#1A2720] text-xs font-mono">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-[#8B9690] uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-[#39FF14]" />
              API_BACKEND
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-mono",
                isSuccess
                  ? "text-[#39FF14] bg-[#39FF14]/10"
                  : isError
                  ? "text-[#FF4D4D] bg-[#FF4D4D]/10"
                  : "text-[#FFB020] bg-[#FFB020]/10"
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  isSuccess
                    ? "bg-[#39FF14] animate-pulse"
                    : isError
                    ? "bg-[#FF4D4D]"
                    : "bg-[#FFB020] animate-ping"
                )}
              />
              {isSuccess ? "ONLINE" : isError ? "OFFLINE" : "CONNECTING"}
            </span>
          </div>

          <div className="text-[10px] text-[#8B9690] truncate">
            {health?.service || "FastAPI OCR"} • v{health?.version || "1.0.0"}
          </div>

          {health?.supported_languages && (
            <div className="mt-1 text-[10px] text-[#8B9690] flex items-center gap-1">
              <span>LANGS:</span>
              <span className="text-[#F5F7F5]">
                {health.supported_languages.join(", ").toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
