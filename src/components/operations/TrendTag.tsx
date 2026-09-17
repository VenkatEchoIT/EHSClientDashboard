import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import type { KPITone, Trend } from "../../types/operations";

interface TrendTagProps {
  trend: Trend;
  size?: "sm" | "md";
  inverse?: boolean;
  tone?: KPITone;
}

const toneColorClass: Record<KPITone, string> = {
  accent: "text-[var(--color-accent)]",
  amber: "text-[var(--color-amber)]",
  success: "text-[var(--color-success)]",
  info: "text-[var(--color-info)]",
  neutral: "text-[var(--color-ink-muted)]",
};

export function TrendTag({
  trend,
  size = "sm",
  inverse = false,
  tone,
}: TrendTagProps) {
  const Icon =
    trend.direction === "down"
      ? ArrowDown
      : trend.direction === "up"
        ? ArrowUp
        : Minus;

  const textSize =
    size === "sm"
      ? "text-sm"
      : "text-base";

  let colorClass = "text-[var(--color-ink-muted)]";

  if (trend.direction !== "flat") {
    if (tone) {
      colorClass = toneColorClass[tone];
    } else {
      const isPositive = inverse
        ? trend.direction === "down"
        : trend.direction === "up";

      colorClass = isPositive
        ? "text-[var(--color-success)]"
        : "text-[var(--color-danger)]";
    }
  }

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