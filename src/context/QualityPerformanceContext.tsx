import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { AuditRecord, CoderRecord } from "../types/qualityPerformance";
import type { CustomRange, DateFilterKey } from "../types/operations";
import {
  addAuditRecord as addAuditRecordService,
  addCoder as addCoderService,
  computeAccuracyDistribution,
  computeCurrentQueue,
  computeInsights,
  computeKPIs,
  computeRejectionReasons,
  computeSpecialtyStats,
  computeThroughputWindow,
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
  throughputWindow: ReturnType<typeof computeThroughputWindow>;
  currentQueue: ReturnType<typeof computeCurrentQueue>;
  insights: ReturnType<typeof computeInsights>;
  addAuditRecord: (record: AuditRecord) => void;
  updateAuditRecord: (id: string, patch: Partial<AuditRecord>) => void;
  deleteAuditRecord: (id: string) => void;
  addCoder: (coder: CoderRecord) => void;
  updateCoder: (id: string, patch: Partial<CoderRecord>) => void;
  deleteCoder: (id: string) => void;
}

const QualityPerformanceContext = createContext<QualityPerformanceContextValue | null>(null);

export function QualityPerformanceProvider({
  dateFilter,
  customRange,
  children,
}: {
  dateFilter: DateFilterKey;
  customRange?: CustomRange;
  children: ReactNode;
}) {
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>(() => getAuditRecords());
  const [coders, setCoders] = useState<CoderRecord[]>(() => getCoders());
  const [dailyMetricsAll] = useState(() => getDailyMetrics());
  const [weeklyThroughputBase] = useState(() => getWeeklyThroughput());
  const [currentQueueBase] = useState(() => getCurrentQueue());

  const kpis = useMemo(() => computeKPIs(auditRecords, dateFilter, customRange), [auditRecords, dateFilter, customRange]);
  const rejectionReasons = useMemo(
    () => computeRejectionReasons(auditRecords, dateFilter, customRange),
    [auditRecords, dateFilter, customRange]
  );
  const specialtyStats = useMemo(
    () => computeSpecialtyStats(auditRecords, dateFilter, customRange),
    [auditRecords, dateFilter, customRange]
  );
  const accuracyDistribution = useMemo(
    () => computeAccuracyDistribution(coders, dateFilter, customRange),
    [coders, dateFilter, customRange]
  );
  const topPerformers = useMemo(
    () => computeTopPerformers(coders, dateFilter, customRange),
    [coders, dateFilter, customRange]
  );
  const dailyMetrics = useMemo(
    () => filterDailyMetrics(dailyMetricsAll, dateFilter, customRange),
    [dailyMetricsAll, dateFilter, customRange]
  );
  const insights = useMemo(
    () => computeInsights(kpis, specialtyStats, rejectionReasons),
    [kpis, specialtyStats, rejectionReasons]
  );
  const throughputWindow = useMemo(
    () => computeThroughputWindow(weeklyThroughputBase, dateFilter, customRange),
    [weeklyThroughputBase, dateFilter, customRange]
  );
  const currentQueue = useMemo(
    () => computeCurrentQueue(currentQueueBase, dateFilter, customRange),
    [currentQueueBase, dateFilter, customRange]
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
    throughputWindow,
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