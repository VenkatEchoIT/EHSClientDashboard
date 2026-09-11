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
import type { DashboardTab, DateFilterKey } from "../types/operations";

export function Operations() {
  const [dateFilter, setDateFilter] = useState<DateFilterKey>("30d");
  const [tab, setTab] = useState<DashboardTab>("operations");

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-6">
        <OperationsHeader
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          tab={tab}
          onTabChange={setTab}
        />

        {tab === "quality" ? (
          <QualityPerformance dateFilter={dateFilter} />
        ) : (
          <>
            <KPIGrid />
            <ChartPipeline />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <DailyThroughput />
              <TurnaroundTime />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <ChartAging />
              <WorkloadByPriority />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <WorkloadByTeam />
              <ReassignmentRate />
            </div>

            <OperationalInsights />
          </>
        )}

        <DashboardFooter />
      </div>
    </div>
  );
}
