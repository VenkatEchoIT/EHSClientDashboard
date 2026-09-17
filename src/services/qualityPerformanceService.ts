import type {
  AccuracyBucket,
  AuditRecord,
  CoderRecord,
  CurrentQueueSnapshot,
  DailyMetric,
  QualityInsightsData,
  QualityKPIs,
  RejectionReasonStat,
  SpecialtyStat,
  WeekdayThroughput,
} from "../types/qualityPerformance";
import type { DateFilterKey } from "../types/operations";
import {
  buildCurrentQueue,
  buildInitialAuditRecords,
  buildInitialCoders,
  buildInitialDailyMetrics,
  buildWeeklyThroughput,
} from "../data/dashboardData";

const STORAGE_KEYS = {
  auditRecords: "qp_audit_records_v1",
  coders: "qp_coders_v1",
  dailyMetrics: "qp_daily_metrics_v1",
  weeklyThroughput: "qp_weekly_throughput_v1",
  currentQueue: "qp_current_queue_v1",
};

function loadOrSeed<T>(key: string, seed: () => T): T {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    // fall through to reseed on parse/storage errors
  }
  const value = seed();
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota/persistence errors – state still works for this session
  }
  return value;
}

function persist<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore persistence errors
  }
}

export function getAuditRecords(): AuditRecord[] {
  return loadOrSeed(STORAGE_KEYS.auditRecords, buildInitialAuditRecords);
}
export function saveAuditRecords(records: AuditRecord[]) {
  persist(STORAGE_KEYS.auditRecords, records);
}

export function getCoders(): CoderRecord[] {
  return loadOrSeed(STORAGE_KEYS.coders, buildInitialCoders);
}
export function saveCoders(coders: CoderRecord[]) {
  persist(STORAGE_KEYS.coders, coders);
}

export function getDailyMetrics(): DailyMetric[] {
  return loadOrSeed(STORAGE_KEYS.dailyMetrics, buildInitialDailyMetrics);
}
export function saveDailyMetrics(metrics: DailyMetric[]) {
  persist(STORAGE_KEYS.dailyMetrics, metrics);
}

export function getWeeklyThroughput(): WeekdayThroughput[] {
  return loadOrSeed(STORAGE_KEYS.weeklyThroughput, buildWeeklyThroughput);
}
export function saveWeeklyThroughput(data: WeekdayThroughput[]) {
  persist(STORAGE_KEYS.weeklyThroughput, data);
}

export function getCurrentQueue(): CurrentQueueSnapshot {
  return loadOrSeed(STORAGE_KEYS.currentQueue, buildCurrentQueue);
}
export function saveCurrentQueue(data: CurrentQueueSnapshot) {
  persist(STORAGE_KEYS.currentQueue, data);
}

// ---------------------------------------------------------------------------
// CRUD helpers for audit records (used by the "View All" management surface).
// ---------------------------------------------------------------------------
export function addAuditRecord(records: AuditRecord[], record: AuditRecord): AuditRecord[] {
  const next = [...records, record];
  saveAuditRecords(next);
  return next;
}
export function updateAuditRecord(records: AuditRecord[], id: string, patch: Partial<AuditRecord>): AuditRecord[] {
  const next = records.map((r) => (r.id === id ? { ...r, ...patch } : r));
  saveAuditRecords(next);
  return next;
}
export function deleteAuditRecord(records: AuditRecord[], id: string): AuditRecord[] {
  const next = records.filter((r) => r.id !== id);
  saveAuditRecords(next);
  return next;
}

export function addCoder(coders: CoderRecord[], coder: CoderRecord): CoderRecord[] {
  const next = [...coders, coder];
  saveCoders(next);
  return next;
}
export function updateCoder(coders: CoderRecord[], id: string, patch: Partial<CoderRecord>): CoderRecord[] {
  const next = coders.map((c) => (c.id === id ? { ...c, ...patch } : c));
  saveCoders(next);
  return next;
}
export function deleteCoder(coders: CoderRecord[], id: string): CoderRecord[] {
  const next = coders.filter((c) => c.id !== id);
  saveCoders(next);
  return next;
}

// ---------------------------------------------------------------------------
// Date-filter windowing. Records don't carry per-chart dates (they're specialty
// rollups), so the date filter scales the underlying totals the same way the
// Operations tab's filter narrows its own window — a smaller window means a
// smaller, proportionally consistent slice of the same activity.
// ---------------------------------------------------------------------------
const FILTER_WINDOW_DAYS: Record<DateFilterKey, number> = {
  today: 1,
  "7d": 7,
  "30d": 30,
  month: 30,
  custom: 30,
};

function scaleForWindow(dateFilter: DateFilterKey): number {
  const days = FILTER_WINDOW_DAYS[dateFilter] ?? 30;
  return Math.min(1, days / 30);
}

export function filterDailyMetrics(metrics: DailyMetric[], dateFilter: DateFilterKey): DailyMetric[] {
  const days = FILTER_WINDOW_DAYS[dateFilter] ?? 30;
  if (days >= metrics.length) return metrics;
  return metrics.slice(metrics.length - days);
}

export function computeKPIs(records: AuditRecord[], dateFilter: DateFilterKey): QualityKPIs {
  const scale = scaleForWindow(dateFilter);
  const totals = records.reduce(
    (acc, r) => {
      acc.charts += r.chartsAudited;
      acc.passed += r.passed;
      acc.failed += r.failed;
      acc.rejected += r.rejected;
      acc.reworked += r.reworked;
      acc.pending += r.pending;
      acc.weightedFirstPass += r.chartsAudited * r.firstPassAccuracy;
      acc.weightedAuditTime += r.chartsAudited * r.auditTimeDays;
      return acc;
    },
    { charts: 0, passed: 0, failed: 0, rejected: 0, reworked: 0, pending: 0, weightedFirstPass: 0, weightedAuditTime: 0 }
  );

  const chartsAudited = Math.round(totals.charts * scale);
  const passRate = totals.charts ? Number(((totals.passed / totals.charts) * 100).toFixed(1)) : 0;
  const firstPassAccuracy = totals.charts ? Number((totals.weightedFirstPass / totals.charts).toFixed(1)) : 0;
  const reworkRate = totals.charts ? Number(((totals.reworked / totals.charts) * 100).toFixed(1)) : 0;
  const failedAuditChecks = Math.round(totals.failed * scale);
  const rejectedRecords = Math.round(totals.rejected * scale);
  const auditsPending = Math.round(totals.pending * scale);
  const avgAuditTimeDays = totals.charts ? Number((totals.weightedAuditTime / totals.charts).toFixed(1)) : 0;

  // "Previous period" comparisons: a stable synthetic baseline derived from the
  // current totals plus the known trend deltas shown across the reference cards.
  return {
    passRate,
    firstPassAccuracy,
    reworkRate,
    failedAuditChecks,
    rejectedRecords,
    chartsAudited,
    auditsPending,
    avgAuditTimeDays,
    prev: {
      passRate: Number((passRate - 1.4).toFixed(1)),
      firstPassAccuracy: Number((firstPassAccuracy - 1.4).toFixed(1)),
      reworkRate: Number((reworkRate + 0.9).toFixed(1)),
      failedAuditChecks: Math.max(0, failedAuditChecks - 8),
      rejectedRecords: Math.max(0, rejectedRecords - 3),
      chartsAudited: Math.max(0, chartsAudited - 156),
      auditsPending: auditsPending + 12,
      avgAuditTimeDays: Number((avgAuditTimeDays + 0.2).toFixed(1)),
    },
  };
}

export function computeRejectionReasons(records: AuditRecord[]): RejectionReasonStat[] {
  const totals = new Map<string, number>();
  records.forEach((r) => {
    Object.entries(r.reasonBreakdown).forEach(([reason, count]) => {
      totals.set(reason, (totals.get(reason) ?? 0) + count);
    });
  });
  const grandTotal = Array.from(totals.values()).reduce((a, b) => a + b, 0) || 1;
  return Array.from(totals.entries())
    .map(([reason, count]) => ({
      reason: reason as RejectionReasonStat["reason"],
      count,
      percent: Math.round((count / grandTotal) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

export function computeSpecialtyStats(records: AuditRecord[]): SpecialtyStat[] {
  return records
    .filter((r) => r.specialty !== "Other")
    .map((r) => ({
      specialty: r.specialty,
      chartsAudited: r.chartsAudited,
      passRate: r.passRate,
      failed: r.failed,
      firstPassAccuracy: r.firstPassAccuracy,
      reworkRate: r.reworkRate,
      trend: [r.passRate - 3, r.passRate - 1.5, r.passRate - 2, r.passRate - 0.5, r.passRate + 0.3, r.passRate],
    }));
}

export function computeAccuracyDistribution(coders: CoderRecord[]): AccuracyBucket[] {
  const buckets: AccuracyBucket[] = [
    { bucket: "<70%", count: 0 },
    { bucket: "70-80%", count: 0 },
    { bucket: "80-90%", count: 0 },
    { bucket: "90-95%", count: 0 },
    { bucket: "95-100%", count: 0 },
  ];
  coders.forEach((c) => {
    const a = c.firstPassAccuracy;
    if (a < 70) buckets[0].count++;
    else if (a < 80) buckets[1].count++;
    else if (a < 90) buckets[2].count++;
    else if (a < 95) buckets[3].count++;
    else buckets[4].count++;
  });
  return buckets;
}

export function computeTopPerformers(coders: CoderRecord[], limit = 5): CoderRecord[] {
  return [...coders].sort((a, b) => b.passRate - a.passRate).slice(0, limit);
}

export function computeInsights(kpis: QualityKPIs, specialtyStats: SpecialtyStat[], reasons: RejectionReasonStat[]): QualityInsightsData {
  const topSpecialty = [...specialtyStats].sort((a, b) => b.passRate - a.passRate)[0];
  const topReason = reasons[0];
  const reworkHoursPerChart = 0.3; // assumed avg hours spent reworking a chart
  const chartsReworkedEstimate = Math.round((kpis.chartsAudited * kpis.reworkRate) / 100);
  return {
    qualityVsTargetPts: Number((95 - kpis.passRate).toFixed(1)),
    improvementPts: Number((kpis.passRate - kpis.prev.passRate).toFixed(1)),
    topSpecialty: { specialty: topSpecialty?.specialty ?? "—", passRate: topSpecialty?.passRate ?? 0 },
    mostCommonError: { reason: topReason?.reason ?? "—", percent: topReason?.percent ?? 0 },
    reworkSavingsHours: Math.round(chartsReworkedEstimate * reworkHoursPerChart * 0.5),
  };
}
