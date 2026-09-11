import { ArrowDown, ArrowUp } from "lucide-react";
import type { KPITone, Trend } from "../../types/operations";

interface TrendTagProps {
  trend: Trend;
  tone?: KPITone;
  size?: "sm" | "md";
}

const colorByDirection: Record<Trend["direction"], string> = {
  up: "text-[var(--color-success)]",
  down: "text-[var(--color-danger)]",
  flat: "text-[var(--color-ink-muted)]",
};

const colorByTone: Record<KPITone, string> = {
  accent: "text-[var(--color-accent)]",
  amber: "text-[var(--color-amber)]",
  success: "text-[var(--color-success)]",
  info: "text-[var(--color-info)]",
  neutral: "text-[var(--color-ink-muted)]",
};

export function TrendTag({
  trend,
  tone,
  size = "sm",
}: TrendTagProps) {
  const Icon =
    trend.direction === "down"
      ? ArrowDown
      : ArrowUp;

  const textSize =
    size === "sm" ? "text-xs" : "text-sm";

  const colorClass = tone
    ? colorByTone[tone]
    : colorByDirection[trend.direction];

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium ${textSize} ${colorClass}`}
    >
      <Icon
        className="h-3.5 w-3.5"
        strokeWidth={2.5}
        aria-hidden="true"
      />
      {trend.label}
    </span>
  );
}