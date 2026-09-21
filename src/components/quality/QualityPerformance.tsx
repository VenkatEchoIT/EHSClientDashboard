import { QualityPerformanceProvider } from "../../context/QualityPerformanceContext";
import type { CustomRange, DateFilterKey } from "../../types/operations";
import { AccuracyDistribution } from "./AccuracyDistribution";
import { AuditPerformance } from "./AuditPerformance";
import { AuditThroughput } from "./AuditThroughput";
import { QualityBySpecialty } from "./QualityBySpecialty";
import { QualityInsights } from "./QualityInsights";
import { QualityKPIGrid } from "./QualityKPIGrid";
import { QualityTrendVsTarget } from "./QualityTrendVsTarget";
import { RejectionReasons } from "./RejectionReasons";
import { TopPerformers } from "./TopPerformers";
import { VolumeVsAccuracy } from "./VolumeVsAccuracy";

interface QualityPerformanceProps {
  dateFilter: DateFilterKey;
  customRange?: CustomRange;
}

export function QualityPerformance({ dateFilter, customRange }: QualityPerformanceProps) {
  return (
    <QualityPerformanceProvider dateFilter={dateFilter} customRange={customRange}>
      <div className="flex flex-col gap-6">
        <QualityKPIGrid />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <QualityTrendVsTarget />
          <RejectionReasons />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <AccuracyDistribution />
          <VolumeVsAccuracy />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <AuditPerformance />
          <QualityBySpecialty />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <TopPerformers />
          <AuditThroughput />
        </div>

        <QualityInsights />
      </div>
    </QualityPerformanceProvider>
  );
}
