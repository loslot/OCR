import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: string;
  status?: "active" | "idle" | "warning";
  className?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  status = "active",
  className,
}: StatCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case "active":
        return "bg-[#39FF14]";
      case "warning":
        return "bg-[#FFB020]";
      case "idle":
      default:
        return "bg-[#8B9690]";
    }
  };

  return (
    <div
      className={cn(
        "relative group p-5 rounded-xl bg-[#111816]/90 border border-[#1A2720] hover:border-[#39FF14]/40 transition-all duration-300 backdrop-blur-md overflow-hidden",
        className
      )}
    >
      {/* Subtle hover gradient highlight */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/5 rounded-full blur-2xl group-hover:bg-[#39FF14]/10 transition-colors pointer-events-none" />

      {/* Top row: Label & Icon */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs uppercase font-mono tracking-widest text-[#8B9690] flex items-center gap-1.5">
          <span className={cn("w-1.5 h-1.5 rounded-full", getStatusColor())} />
          {title}
        </span>
        <div className="p-2 rounded-lg bg-[#0D1210] border border-[#1A2720] text-[#00E676] group-hover:text-[#39FF14] group-hover:border-[#39FF14]/30 transition-colors">
          {icon}
        </div>
      </div>

      {/* Main Value */}
      <div className="flex items-baseline gap-2">
        <div className="text-2xl sm:text-3xl font-mono font-bold text-[#F5F7F5] tracking-tight">
          {value}
        </div>
        {trend && (
          <span className="text-xs font-mono text-[#00E676] bg-[#00E676]/10 px-1.5 py-0.5 rounded">
            {trend}
          </span>
        )}
      </div>

      {/* Subtitle / Telemetry */}
      {subtitle && (
        <p className="mt-2 text-xs text-[#8B9690] font-sans flex items-center gap-2">
          {subtitle}
        </p>
      )}

      {/* Bottom accent cyber line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#39FF14]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
