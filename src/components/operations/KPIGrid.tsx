import { getOperationsKPIs } from "../../services/operationsService";
import type { CustomRange, DateFilterKey } from "../../types/operations";
import { KPICard } from "./KPICard";

interface KPIGridProps {
  dateFilter: DateFilterKey;
  customRange?: CustomRange;
}

export function KPIGrid({ dateFilter, customRange }: KPIGridProps) {
  const kpiData = getOperationsKPIs(dateFilter, customRange);
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 xl:grid-cols-7">
      {kpiData.map((kpi) => (
        <KPICard key={kpi.id} data={kpi} />
      ))}
    </div>
  );
}
