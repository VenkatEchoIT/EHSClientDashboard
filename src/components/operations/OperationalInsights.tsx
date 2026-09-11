import { insightData } from "../../data/operationsData";
import { InsightCard } from "./InsightCard";

export function OperationalInsights() {
  return (
    <section>
      <h2 className="text-xs font-semibold tracking-wide text-[var(--color-ink-muted)]">OPERATIONAL INSIGHTS</h2>
      <div className="mt-4 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        {insightData.map((insight) => (
          <InsightCard key={insight.id} data={insight} />
        ))}
      </div>
    </section>
  );
}
