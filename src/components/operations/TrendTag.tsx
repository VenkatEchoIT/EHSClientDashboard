import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import type { KPITone, Trend } from "../../types/operations";

interface TrendTagProps {
  trend: Trend;
  tone?: KPITone;
  size?: "sm" | "md";
  inverse?: boolean;
}

export function TrendTag({
  trend,
  size = "sm",
  inverse = false,
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
    const isPositive = inverse
      ? trend.direction === "down"
      : trend.direction === "up";

    colorClass = isPositive
      ? "text-[var(--color-success)]"
      : "text-[var(--color-danger)]";
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