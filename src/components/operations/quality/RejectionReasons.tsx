import { SectionCard } from "../SectionCard";
import { useQualityPerformance } from "../../../context/QualityPerformanceContext";

const barColors = ["#e8631f", "#f0975a", "#eba91f", "#f6cf8d", "#e2d9cb"];

export function RejectionReasons() {
  const { rejectionReasons, kpis } = useQualityPerformance();
  const maxCount = Math.max(...rejectionReasons.map((r) => r.count), 1);

  return (
    <SectionCard title="Why charts were returned or rejected" subtitle="Breakdown of rejection reasons">
      <div className="flex flex-col gap-4">
        {rejectionReasons.map((item, index) => (
          <div key={item.reason} className="flex items-center gap-3">
            <span className="w-40 shrink-0 text-sm text-[var(--color-ink-soft)]">{item.reason}</span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-[var(--color-neutral-soft)]">
              <div
                className="h-full rounded-full"
                style={{ width: `${(item.count / maxCount) * 100}%`, backgroundColor: barColors[index % barColors.length] }}
              />
            </div>
            <span className="w-20 shrink-0 text-right text-sm font-semibold text-[var(--color-ink)]">
              {item.count} <span className="font-normal text-[var(--color-ink-muted)]">({item.percent}%)</span>
            </span>
          </div>
        ))}
      </div>
      <div className="mt-5 flex justify-end border-t border-[var(--color-border-soft)] pt-3 text-sm">
        <span className="text-[var(--color-ink-muted)]">Total</span>
        <span className="ml-2 font-semibold text-[var(--color-ink)]">{kpis.failedAuditChecks}</span>
      </div>
    </SectionCard>
  );
}
