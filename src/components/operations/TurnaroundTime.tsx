import { getTurnaroundData } from "../../services/operationsService";

const { stages: turnaroundData, bottleneck: turnaroundBottleneck, slowestChart } = getTurnaroundData();
import { SectionCard } from "./SectionCard";

export function TurnaroundTime() {
  return (
    <SectionCard title="Turnaround Time" subtitle="Median days per stage">
      <div className="flex flex-col gap-4">
        {turnaroundData.map((stage) => {
          const widthPercent = Math.min(100, (stage.days / stage.maxDays) * 100);
          const isBottleneck = stage.label === turnaroundBottleneck.label;
          return (
            <div key={stage.id}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-[var(--color-ink-soft)]">{stage.label}</span>
                <span className="font-semibold text-[var(--color-ink)]">{stage.days}d</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-neutral-soft)]">
                <div
                  className={`h-full rounded-full ${isBottleneck ? "bg-[var(--color-accent)]" : "bg-[var(--color-amber)]"}`}
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--color-border-soft)] pt-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-[var(--color-ink-muted)]">Current bottleneck</span>
          <span className="inline-flex items-center rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-sm font-semibold text-[var(--color-accent)]">
            {turnaroundBottleneck.label} ({turnaroundBottleneck.days})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[var(--color-ink-muted)]">Slowest chart in range</span>
          <span className="font-semibold text-[var(--color-ink)]">{slowestChart.id}</span>
          <span className="font-semibold text-[var(--color-danger)]">{slowestChart.days}</span>
        </div>
      </div>
    </SectionCard>
  );
}
