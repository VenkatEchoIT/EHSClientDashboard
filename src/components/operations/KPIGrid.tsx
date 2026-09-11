import { kpiData } from "../../data/operationsData";
import { KPICard } from "./KPICard";

export function KPIGrid() {
  return (
    <div className="-mx-4 flex gap-3.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4 xl:grid-cols-7">
      {kpiData.map((kpi) => (
        <KPICard key={kpi.id} data={kpi} />
      ))}
    </div>
  );
}
