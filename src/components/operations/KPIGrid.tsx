import { getOperationsKPIs } from "../../services/operationsService";

const kpiData = getOperationsKPIs();
import { KPICard } from "./KPICard";

export function KPIGrid() {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 xl:grid-cols-7">
      {kpiData.map((kpi) => (
        <KPICard key={kpi.id} data={kpi} />
      ))}
    </div>
  );
}
