import { ArrowLeftRight } from "lucide-react";
import { getReassignmentRate } from "../../services/operationsService";

const reassignmentRate = getReassignmentRate();
import { SectionCard } from "./SectionCard";
import { TrendTag } from "./TrendTag";

export function ReassignmentRate() {
  return (
    <SectionCard title="Reassignment Rate" subtitle="Percentage of charts re-assigned">
      <div className="flex flex-col items-center gap-3 py-2">
        <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-accent-softer)]">
          <ArrowLeftRight className="h-8 w-8 text-[var(--color-accent)]" strokeWidth={2} aria-hidden="true" />
        </span>
        <p className="text-3xl font-semibold text-[var(--color-ink)]">{reassignmentRate.percent}</p>
        <TrendTag trend={reassignmentRate.trend} inverse />
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-[var(--color-border-soft)] pt-4 text-sm">
        <div>
          <p className="text-[var(--color-ink-muted)]">Re-assigned charts</p>
          <p className="mt-0.5 text-lg font-semibold text-[var(--color-ink)]">{reassignmentRate.reassignedCharts}</p>
        </div>
        <div className="text-right">
          <p className="text-[var(--color-ink-muted)]">Total charts</p>
          <p className="mt-0.5 text-lg font-semibold text-[var(--color-ink)]">
            {reassignmentRate.totalCharts.toLocaleString()}
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
