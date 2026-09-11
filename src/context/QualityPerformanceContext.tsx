import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { AuditRecord, CoderRecord } from "../types/qualityPerformance";
import type { DateFilterKey } from "../types/operations";
import {
  addAuditRecord as addAuditRecordService,
  addCoder as addCoderService,
  computeAccuracyDistribution,
  computeInsights,
  computeKPIs,
  computeRejectionReasons,
  computeSpecialtyStats,
  computeTopPerformers,
  deleteAuditRecord as deleteAuditRecordService,
  deleteCoder as deleteCoderService,
  filterDailyMetrics,
  getAuditRecords,
  getCoders,
  getCurrentQueue,
  getDailyMetrics,
  getWeeklyThroughput,
  updateAuditRecord as updateAuditRecordService,
  updateCoder as updateCoderService,
} from "../services/qualityPerformanceService";

interface QualityPerformanceContextValue {
  auditRecords: AuditRecord[];
  coders: CoderRecord[];
  dateFilter: DateFilterKey;
  kpis: ReturnType<typeof computeKPIs>;
  rejectionReasons: ReturnType<typeof computeRejectionReasons>;
  specialtyStats: ReturnType<typeof computeSpecialtyStats>;
  accuracyDistribution: ReturnType<typeof computeAccuracyDistribution>;
  topPerformers: CoderRecord[];
  dailyMetrics: ReturnType<typeof filterDailyMetrics>;
  weeklyThroughput: ReturnType<typeof getWeeklyThroughput>;
  currentQueue: ReturnType<typeof getCurrentQueue>;
  insights: ReturnType<typeof computeInsights>;
  addAuditRecord: (record: AuditRecord) => void;
  updateAuditRecord: (id: string, patch: Partial<AuditRecord>) => void;
  deleteAuditRecord: (id: string) => void;
  addCoder: (coder: CoderRecord) => void;
  updateCoder: (id: string, patch: Partial<CoderRecord>) => void;
  deleteCoder: (id: string) => void;
}

const QualityPerformanceContext = createContext<QualityPerformanceContextValue | null>(null);

export function QualityPerformanceProvider({ dateFilter, children }: { dateFilter: DateFilterKey; children: ReactNode }) {
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>(() => getAuditRecords());
  const [coders, setCoders] = useState<CoderRecord[]>(() => getCoders());
  const [dailyMetricsAll] = useState(() => getDailyMetrics());
  const [weeklyThroughput] = useState(() => getWeeklyThroughput());
  const [currentQueue] = useState(() => getCurrentQueue());

  const kpis = useMemo(() => computeKPIs(auditRecords, dateFilter), [auditRecords, dateFilter]);
  const rejectionReasons = useMemo(() => computeRejectionReasons(auditRecords), [auditRecords]);
  const specialtyStats = useMemo(() => computeSpecialtyStats(auditRecords), [auditRecords]);
  const accuracyDistribution = useMemo(() => computeAccuracyDistribution(coders), [coders]);
  const topPerformers = useMemo(() => computeTopPerformers(coders), [coders]);
  const dailyMetrics = useMemo(() => filterDailyMetrics(dailyMetricsAll, dateFilter), [dailyMetricsAll, dateFilter]);
  const insights = useMemo(
    () => computeInsights(kpis, specialtyStats, rejectionReasons),
    [kpis, specialtyStats, rejectionReasons]
  );

  const value: QualityPerformanceContextValue = {
    auditRecords,
    coders,
    dateFilter,
    kpis,
    rejectionReasons,
    specialtyStats,
    accuracyDistribution,
    topPerformers,
    dailyMetrics,
    weeklyThroughput,
    currentQueue,
    insights,
    addAuditRecord: (record) => setAuditRecords((prev) => addAuditRecordService(prev, record)),
    updateAuditRecord: (id, patch) => setAuditRecords((prev) => updateAuditRecordService(prev, id, patch)),
    deleteAuditRecord: (id) => setAuditRecords((prev) => deleteAuditRecordService(prev, id)),
    addCoder: (coder) => setCoders((prev) => addCoderService(prev, coder)),
    updateCoder: (id, patch) => setCoders((prev) => updateCoderService(prev, id, patch)),
    deleteCoder: (id) => setCoders((prev) => deleteCoderService(prev, id)),
  };

  return <QualityPerformanceContext.Provider value={value}>{children}</QualityPerformanceContext.Provider>;
}

export function useQualityPerformance() {
  const ctx = useContext(QualityPerformanceContext);
  if (!ctx) throw new Error("useQualityPerformance must be used within a QualityPerformanceProvider");
  return ctx;
}
