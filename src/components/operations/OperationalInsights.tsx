import { getOperationsInsights } from "../../services/operationsService";
import type { CustomRange, DateFilterKey } from "../../types/operations";
import { InsightCard } from "./InsightCard";

interface OperationalInsightsProps {
  dateFilter: DateFilterKey;
  customRange?: CustomRange;
}

export function OperationalInsights({ dateFilter, customRange }: OperationalInsightsProps) {
  const insightData = getOperationsInsights(dateFilter, customRange);
  return (
    <section>
      <h2 className="text-[18px] font-semibold tracking-wide text-[var(--color-ink-soft)]">OPERATIONAL INSIGHTS</h2>
      <div className="mt-4 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        {insightData.map((insight) => (
          <InsightCard key={insight.id} data={insight} />
        ))}
      </div>
    </section>
  );
}
