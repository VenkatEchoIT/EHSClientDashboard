import { useState } from "react";
import { ChartAging } from "../components/operations/ChartAging";
import { ChartPipeline } from "../components/operations/ChartPipeline";
import { DailyThroughput } from "../components/operations/DailyThroughput";
import { DashboardFooter } from "../components/operations/DashboardFooter";
import { KPIGrid } from "../components/operations/KPIGrid";
import { OperationalInsights } from "../components/operations/OperationalInsights";
import { OperationsHeader } from "../components/operations/OperationsHeader";
import { QualityPerformance } from "../components/quality/QualityPerformance";
import { ReassignmentRate } from "../components/operations/ReassignmentRate";
import { TurnaroundTime } from "../components/operations/TurnaroundTime";
import { WorkloadByPriority } from "../components/operations/WorkloadByPriority";
import { WorkloadByTeam } from "../components/operations/WorkloadByTeam";
import type { CustomRange, DashboardTab, DateFilterKey } from "../types/operations";

export function Operations() {
  const [dateFilter, setDateFilter] = useState<DateFilterKey>("30d");
  const [customRange, setCustomRange] = useState<CustomRange | undefined>(undefined);
  const [tab, setTab] = useState<DashboardTab>("operations");

  return (
    <div className="w-full mx-auto max-w-[1820px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-6">
        <OperationsHeader
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          customRange={customRange}
          onCustomRangeChange={setCustomRange}
          tab={tab}
          onTabChange={setTab}
        />

        {tab === "quality" ? (
          <QualityPerformance dateFilter={dateFilter} customRange={customRange} />
        ) : (
          <>
            <KPIGrid dateFilter={dateFilter} customRange={customRange} />
            <ChartPipeline dateFilter={dateFilter} customRange={customRange} />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <DailyThroughput dateFilter={dateFilter} customRange={customRange} />
              <TurnaroundTime dateFilter={dateFilter} customRange={customRange} />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <ChartAging dateFilter={dateFilter} customRange={customRange} />
              <WorkloadByPriority dateFilter={dateFilter} customRange={customRange} />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <WorkloadByTeam dateFilter={dateFilter} customRange={customRange} />
              <ReassignmentRate dateFilter={dateFilter} customRange={customRange} />
            </div>

            <OperationalInsights dateFilter={dateFilter} customRange={customRange} />
          </>
        )}

        <DashboardFooter />
      </div>
    </div>
  );
}
