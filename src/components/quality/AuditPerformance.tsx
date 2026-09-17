import { CheckCircle2, Clock, FileCheck2, HelpCircle } from "lucide-react";
import type { ReactNode } from "react";
import { QualitySectionCard } from "./QualitySectionCard";
import { TrendTag } from "./TrendTag";
import { useQualityPerformance } from "../../context/QualityPerformanceContext";
import type { Trend } from "../../types/qualityPerformance";

function InnerCard({
  icon,
  bg,
  label,
  value,
  unit,
  trend,
  inverse = false,
}: {
  icon: ReactNode;
  bg: string;
  label: string;
  value: string;
  unit?: string;
  trend: Trend;
  inverse?: boolean;
}) {
  return (
    <div className={`flex flex-col justify-between rounded-2xl border border-[var(--color-border-soft)] ${bg} p-4`}>
      <div className="flex items-start justify-between">
        <p className="text-sm text-[var(--color-ink-soft)]">{label}</p>
        {icon}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-semibold leading-none text-[var(--color-ink)]">
          {value} {unit && <span className="text-sm font-normal text-[var(--color-ink-muted)]">{unit}</span>}
        </p>
        <div className="mt-2">
          <TrendTag
            trend={trend}
            inverse={inverse}
          />
        </div>
      </div>
    </div>
  );
}

function trendFor(current: number, prev: number, suffix: "pts" | "count"): Trend {
  const diff = Number((current - prev).toFixed(1));
  const direction = diff === 0 ? "flat" : diff > 0 ? "up" : "down";
  return { direction, label: suffix === "pts" ? `${Math.abs(diff)} pts vs prev` : `${Math.abs(diff)} vs prev` };
}

export function AuditPerformance() {
  const { kpis } = useQualityPerformance();

  return (
    <QualitySectionCard title="Audit Performance" subtitle="Overview of audit team performance">
      <div className="grid grid-cols-2 gap-3">
        <InnerCard
          icon={<CheckCircle2 className="h-6 w-6 text-[var(--color-info)]" strokeWidth={2} aria-hidden="true" />}
          bg="bg-[var(--color-info-soft)]"
          label="Audits completed"
          value={kpis.chartsAudited.toLocaleString()}
          unit="Charts"
          trend={trendFor(kpis.chartsAudited, kpis.prev.chartsAudited, "count")}
        />
        <InnerCard
          icon={
            <HelpCircle
              className="h-6 w-6 text-[var(--color-amber)]"
              strokeWidth={2}
              aria-hidden="true"
            />
          }
          bg="bg-[var(--color-amber-soft)]"
          label="Audits pending"
          value={`${kpis.auditsPending}`}
          unit="Charts"
          trend={trendFor(
            kpis.auditsPending,
            kpis.prev.auditsPending,
            "count"
          )}
          inverse
        />
        <InnerCard
          icon={
            <Clock
              className="h-6 w-6 text-[var(--color-primary)]"
              strokeWidth={2}
              aria-hidden="true"
            />
          }
          bg="bg-[var(--color-accent-softer)]"
          label="Avg. Audit Time"
          value={`${kpis.avgAuditTimeDays}`}
          unit="days"
          trend={trendFor(
            kpis.avgAuditTimeDays,
            kpis.prev.avgAuditTimeDays,
            "pts"
          )}
          inverse
        />
        <InnerCard
          icon={<FileCheck2 className="h-6 w-6 text-[var(--color-success)]" strokeWidth={2} aria-hidden="true" />}
          bg="bg-[var(--color-success-soft)]"
          label="First-pass Accuracy"
          value={`${kpis.firstPassAccuracy}%`}
          trend={trendFor(kpis.firstPassAccuracy, kpis.prev.firstPassAccuracy, "pts")}
        />
      </div>
    </QualitySectionCard>
  );
}
