import { useMemo } from "react";
import { KPICard } from "../KPICard";
import { useQualityPerformance } from "../../../context/QualityPerformanceContext";
import type { KPICardData } from "../../../types/operations";

function delta(current: number, prev: number, unit: "pts" | "count" | "pct") {
  const diff = Number((current - prev).toFixed(1));
  const direction = diff === 0 ? "flat" : diff > 0 ? "up" : "down";
  const magnitude = Math.abs(diff);
  const label =
    unit === "pts" ? `${magnitude} pts vs prev` : unit === "pct" ? `${magnitude}% vs prev` : `${magnitude} vs prev`;
  return { direction, label } as const;
}

export function QualityKPIGrid() {
  const { kpis } = useQualityPerformance();

  const cards: KPICardData[] = useMemo(
    () => [
      {
        id: "pass-rate",
        label: "Pass rate / overall quality",
        value: `${kpis.passRate}%`,
        trend: delta(kpis.passRate, kpis.prev.passRate, "pts"),
        sparkline: [76, 84, 82, 80, 90, 86, kpis.passRate],
        tone: "accent",
        visual: "bar",
        barValue: kpis.passRate,
        footnote: [{ label: "Target", value: "95%" }],
      },
      {
        id: "first-pass-accuracy",
        label: "First-pass accuracy",
        value: `${kpis.firstPassAccuracy}%`,
        trend: delta(kpis.firstPassAccuracy, kpis.prev.firstPassAccuracy, "pts"),
        sparkline: [88, 89.5, 89, 88.6, 90, 90.5, kpis.firstPassAccuracy],
        tone: "amber",
        visual: "bar",
        barValue: kpis.firstPassAccuracy,
        footnote: [{ label: "Target", value: "95%" }],
      },
      {
        id: "rework-rate",
        label: "Rework rate",
        value: `${kpis.reworkRate}%`,
        trend: delta(kpis.reworkRate, kpis.prev.reworkRate, "pts"),
        sparkline: [8.5, 8.1, 7.9, 7.6, 7.2, 7.0, kpis.reworkRate],
        tone: "amber",
        visual: "sparkline",
      },
      {
        id: "failed-audit-checks",
        label: "Failed audit checks",
        value: `${kpis.failedAuditChecks}`,
        trend: delta(kpis.failedAuditChecks, kpis.prev.failedAuditChecks, "count"),
        sparkline: [70, 72, 68, 74, 71, 76, kpis.failedAuditChecks],
        tone: "accent",
        visual: "sparkline",
      },
      {
        id: "rejected-records",
        label: "Rejected records",
        value: `${kpis.rejectedRecords}`,
        trend: delta(kpis.rejectedRecords, kpis.prev.rejectedRecords, "count"),
        sparkline: [15, 17, 14, 18, 16, 17, kpis.rejectedRecords],
        tone: "accent",
        visual: "sparkline",
      },
      {
        id: "charts-audited",
        label: "Charts audited",
        value: kpis.chartsAudited.toLocaleString(),
        trend: delta(kpis.chartsAudited, kpis.prev.chartsAudited, "count"),
        tone: "accent",
        visual: "none",
        footnote: [{ label: "Audits pending", value: `${kpis.auditsPending}` }],
      },
    ],
    [kpis]
  );

  return (
    <div className="-mx-4 flex gap-3.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <KPICard key={card.id} data={card} />
      ))}
    </div>
  );
}
