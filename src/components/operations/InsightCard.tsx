import {
  AlertTriangle,
  Calendar,
  Clock,
  Inbox,
  ShieldCheck,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { InsightCardData } from "../../types/operations";
import { TrendTag } from "./TrendTag";

const iconMap: Record<InsightCardData["icon"], LucideIcon> = {
  clock: Clock,
  alertTriangle: AlertTriangle,
  shieldCheck: ShieldCheck,
  trendingUp: TrendingUp,
  calendar: Calendar,
  inbox: Inbox,
};

const toneClasses: Record<InsightCardData["tone"], { bg: string; icon: string }> = {
  accent: { bg: "bg-[var(--color-accent-softer)]", icon: "text-[var(--color-accent)]" },
  amber: { bg: "bg-[var(--color-amber-soft)]", icon: "text-[var(--color-amber)]" },
  success: { bg: "bg-[var(--color-success-soft)]", icon: "text-[var(--color-success)]" },
  info: { bg: "bg-[var(--color-info-soft)]", icon: "text-[var(--color-info)]" },
  danger: { bg: "bg-[var(--color-danger-soft)]", icon: "text-[var(--color-danger)]" },
  alert: { bg: "bg-[#FFE1D7]", icon: "text-[#AE380F]", },
};

export function InsightCard({ data }: { data: InsightCardData }) {
  const Icon = iconMap[data.icon];
  const tone = toneClasses[data.tone];

  const isInverseTrend =
    data.label === "Current Bottleneck" ||
    data.label === "Overdue Charts";

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border border-[#e1e1e1] ${tone.bg} p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--color-ink-soft)]">
          {data.label}
        </p>

        <Icon
          className={`h-6 w-6 ${tone.icon}`}
          strokeWidth={2}
          aria-hidden="true"
        />
      </div>

      <div>
        <p className="mb-1 text-[24px] font-semibold leading-tight text-[var(--color-ink)]">
          {data.value}
        </p>

        {data.supporting && (
          <p className="text-sm text-[var(--color-ink-muted)]">
            {data.supporting}
          </p>
        )}
      </div>

      {data.trend && (
        <TrendTag
          trend={data.trend}
          inverse={isInverseTrend}
        />
      )}
    </div>
  );
}