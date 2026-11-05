import { ShieldCheck, AlertCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfidenceBadgeProps {
  score: number; // 0.0 - 1.0 or 0 - 100
  className?: string;
  showIcon?: boolean;
}

export default function ConfidenceBadge({
  score,
  className,
  showIcon = true,
}: ConfidenceBadgeProps) {
  // Normalize score to percentage (0 - 100)
  const normalized = score <= 1 ? Math.round(score * 100) : Math.round(score);

  let colorClasses = "bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/30";
  let Icon = ShieldCheck;

  if (normalized >= 85) {
    colorClasses = "bg-[#39FF14]/15 text-[#39FF14] border-[#39FF14]/40 shadow-[0_0_10px_rgba(57,255,20,0.15)]";
    Icon = ShieldCheck;
  } else if (normalized >= 65) {
    colorClasses = "bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30";
    Icon = ShieldCheck;
  } else if (normalized >= 45) {
    colorClasses = "bg-[#FFB020]/15 text-[#FFB020] border-[#FFB020]/40";
    Icon = AlertTriangle;
  } else {
    colorClasses = "bg-[#FF4D4D]/15 text-[#FF4D4D] border-[#FF4D4D]/40";
    Icon = AlertCircle;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border tracking-wider",
        colorClasses,
        className
      )}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{normalized}% CONF</span>
    </span>
  );
}
