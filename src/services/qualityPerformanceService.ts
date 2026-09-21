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
import type { CustomRange, DateFilterKey } from "../types/operations";
import {
  eachDayInWindow,
  formatMonthDay,
  hashString,
  isWithinWindow,
  parseISODate,
  randomForWindow as randomForResolvedWindow,
  resolveDateWindow,
  toISODate,
  weekdayShort,
  type ResolvedWindow,
} from "../lib/dateWindow";
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

// ---------------------------------------------------------------------------
// Cache envelope: every cached dataset is stored alongside a hash of the mock
// data it was seeded from ({ seedHash, data }). On load we recompute that hash
// from the *current* build function in dashboardData.ts and compare it to what
// was cached:
//   - hashes match  -> the mock data hasn't changed, so we trust the cache
//     (which may include the user's own add/edit/delete changes).
//   - hashes differ -> dashboardData.ts was edited since this was cached, so
//     the stale copy is dropped and replaced with the fresh mock data.
// This means editing dashboardData.ts is enough on its own to show up on the
// dashboard — no manual localStorage key bump required, and no more stale
// cached data silently overriding new mock values.
// ---------------------------------------------------------------------------
interface CacheEnvelope<T> {
  seedHash: string;
  data: T;
}

function hashValue(value: unknown): string {
  return String(hashString(JSON.stringify(value)));
}

function readCache<T>(key: string): CacheEnvelope<T> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && "seedHash" in parsed && "data" in parsed) {
      return parsed as CacheEnvelope<T>;
    }
    // Old pre-envelope cache (raw data with no seedHash) — treat as stale.
    return null;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, value: T, seedHash: string) {
  if (typeof window === "undefined") return;
  try {
    const envelope: CacheEnvelope<T> = { seedHash, data: value };
    window.localStorage.setItem(key, JSON.stringify(envelope));
  } catch {
    // ignore quota/persistence errors – state still works for this session
  }
}

function loadOrSeed<T>(key: string, seed: () => T): T {
  const fresh = seed();
  if (typeof window === "undefined") return fresh;
  const freshHash = hashValue(fresh);
  const cached = readCache<T>(key);
  if (cached && cached.seedHash === freshHash) {
    return cached.data;
  }
  writeCache(key, fresh, freshHash);
  return fresh;
}

/** Persists an edited value (add/update/delete), tagged against the current seed so it survives reloads until the mock data itself changes. */
function persist<T>(key: string, value: T, seed: () => T) {
  writeCache(key, value, hashValue(seed()));
}

export function getAuditRecords(): AuditRecord[] {
  return loadOrSeed(STORAGE_KEYS.auditRecords, buildInitialAuditRecords);
}
export function saveAuditRecords(records: AuditRecord[]) {
  persist(STORAGE_KEYS.auditRecords, records, buildInitialAuditRecords);
}

export function getCoders(): CoderRecord[] {
  return loadOrSeed(STORAGE_KEYS.coders, buildInitialCoders);
}
export function saveCoders(coders: CoderRecord[]) {
  persist(STORAGE_KEYS.coders, coders, buildInitialCoders);
}

export function getDailyMetrics(): DailyMetric[] {
  return loadOrSeed(STORAGE_KEYS.dailyMetrics, buildInitialDailyMetrics);
}
export function saveDailyMetrics(metrics: DailyMetric[]) {
  persist(STORAGE_KEYS.dailyMetrics, metrics, buildInitialDailyMetrics);
}

export function getWeeklyThroughput(): WeekdayThroughput[] {
  return loadOrSeed(STORAGE_KEYS.weeklyThroughput, buildWeeklyThroughput);
}
export function saveWeeklyThroughput(data: WeekdayThroughput[]) {
  persist(STORAGE_KEYS.weeklyThroughput, data, buildWeeklyThroughput);
}

export function getCurrentQueue(): CurrentQueueSnapshot {
  return loadOrSeed(STORAGE_KEYS.currentQueue, buildCurrentQueue);
}
export function saveCurrentQueue(data: CurrentQueueSnapshot) {
  persist(STORAGE_KEYS.currentQueue, data, buildCurrentQueue);
}

// ---------------------------------------------------------------------------
// Audit Throughput card ("Audit Throughput & Backlog" chart + Current Audit
// Queue stat). The base rows above are a fixed weekday anchor; these two
// derive the window-specific view the same way computeKPIs/computeSpecialtyStats
// do, so the chart and the "Current Audit Queue" figure actually move when the
// date filter changes instead of always showing the seeded snapshot.
// ---------------------------------------------------------------------------
export interface ThroughputWindow {
  /** Every day in the active window (used only to find the best pass-rate day). */
  series: WeekdayThroughput[];
  /** Window totals — what the 2-bar chart plots. */
  totalAudited: number;
  totalPending: number;
  bestDay: WeekdayThroughput | null;
}

/**
 * Full-window audit throughput, used for the "Audit Throughput & Backlog"
 * card. The card itself now plots just two bars (total Charts Audited vs
 * total Pending Queue across the whole selected range, same treatment as the
 * Operations Daily Throughput card), so per-day figures are only needed here
 * to work out the best pass-rate day.
 */
export function computeThroughputWindow(
  base: WeekdayThroughput[],
  dateFilter: DateFilterKey,
  customRange?: CustomRange
): ThroughputWindow {
  const window = windowFor(dateFilter, customRange);
  const scale = Math.min(1.6, scaleForWindow(dateFilter, customRange));
  const random = randomForResolvedWindow(window, "weekly-throughput");

  const series = eachDayInWindow(window).map((date, i) => {
    const template = base[i % base.length];
    const jitter = (random() - 0.5) * 1.6;
    return {
      day: weekdayShort(date),
      date: toISODate(date),
      label: formatMonthDay(date),
      chartsAudited: Math.max(1, Math.round(template.chartsAudited * scale * (0.95 + random() * 0.1))),
      pendingQueue: Math.max(0, Math.round(template.pendingQueue * scale * (0.95 + random() * 0.1))),
      passRate: Number(Math.max(60, Math.min(100, template.passRate + jitter)).toFixed(1)),
    };
  });

  return {
    series,
    totalAudited: series.reduce((sum, d) => sum + d.chartsAudited, 0),
    totalPending: series.reduce((sum, d) => sum + d.pendingQueue, 0),
    bestDay: [...series].sort((a, b) => b.passRate - a.passRate)[0] ?? null,
  };
}

export function computeCurrentQueue(
  base: CurrentQueueSnapshot,
  dateFilter: DateFilterKey,
  customRange?: CustomRange
): CurrentQueueSnapshot {
  const scale = scaleForWindow(dateFilter, customRange);
  const random = randomForWindow(dateFilter, customRange, "current-queue");
  const charts = Math.max(1, Math.round(base.charts * scale * (0.9 + random() * 0.2)));
  // Shorter windows have a fresher, smaller queue, so turnaround trends down
  // with scale rather than sitting frozen at the seeded value.
  const turnaroundDays = Number(
    Math.max(0.2, base.turnaroundDays * (1.15 - scale * 0.3) + (random() - 0.5) * 0.3).toFixed(1)
  );
  return { charts, turnaroundDays };
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
/**
 * Both tabs now resolve a filter through the shared resolveDateWindow(), so
 * "This month" means month-to-date here as well (it used to mean 90 days on
 * this tab only), and a custom range means the days that were actually picked
 * rather than "the same number of days, counted back from today".
 */
function windowFor(dateFilter: DateFilterKey, customRange?: CustomRange): ResolvedWindow {
  return resolveDateWindow(dateFilter, customRange);
}

function resolveWindowDays(dateFilter: DateFilterKey, customRange?: CustomRange): number {
  return windowFor(dateFilter, customRange).days;
}

/** Volume scale relative to the 30-day reference window. Uncapped: a 60-day window really does hold more charts. */
function scaleForWindow(dateFilter: DateFilterKey, customRange?: CustomRange): number {
  return Math.max(0.03, resolveWindowDays(dateFilter, customRange) / 30);
}

/** Roster-style counts (coders on the board) can never exceed the roster itself, so this one stays capped. */
function rosterScaleForWindow(dateFilter: DateFilterKey, customRange?: CustomRange): number {
  return Math.min(1, scaleForWindow(dateFilter, customRange));
}

function randomForWindow(dateFilter: DateFilterKey, customRange?: CustomRange, salt = ""): () => number {
  return randomForResolvedWindow(windowFor(dateFilter, customRange), salt);
}

// ---------------------------------------------------------------------------
// Daily metrics windowing.
//
// The old version sliced the *tail* of the seeded series for every filter, so
// picking a range in the past (say Jun 1 - Jun 25) still rendered late-August
// days. Now the seeded series is filtered by real date when the window overlaps
// it, and any day the seed doesn't cover is generated deterministically from
// the seeded profile -- so the charts always show the dates on the filter chip.
// ---------------------------------------------------------------------------
function categoryFor(passRate: number): DailyMetric["category"] {
  if (passRate >= 95) return "at-above";
  if (passRate >= 90) return "slightly-below";
  return "well-below";
}

function synthesiseDailyMetric(date: Date, base: DailyMetric[], random: () => number): DailyMetric {
  const template = base.length ? base[Math.floor(random() * base.length) % base.length] : null;
  const isWeekendDay = date.getDay() === 0 || date.getDay() === 6;
  const baseCharts = template?.chartsAudited ?? 90;
  const chartsAudited = Math.max(
    4,
    Math.round(baseCharts * (isWeekendDay ? 0.4 : 1) * (0.8 + random() * 0.45))
  );
  const passRate = Number(
    Math.max(70, Math.min(99.5, (template?.passRate ?? 90) + (random() - 0.5) * 6)).toFixed(1)
  );
  const firstPassAccuracy = Number(
    Math.max(60, Math.min(99, (template?.firstPassAccuracy ?? 84) + (random() - 0.5) * 6)).toFixed(1)
  );
  return {
    date: toISODate(date),
    label: formatMonthDay(date),
    chartsAudited,
    firstPassAccuracy,
    passRate,
    category: categoryFor(passRate),
  };
}

export function filterDailyMetrics(
  metrics: DailyMetric[],
  dateFilter: DateFilterKey,
  customRange?: CustomRange
): DailyMetric[] {
  const window = windowFor(dateFilter, customRange);
  const random = randomForResolvedWindow(window, "daily-metrics");

  const seeded = new Map<string, DailyMetric>();
  metrics.forEach((m) => {
    const parsed = parseISODate(m.date);
    if (parsed) seeded.set(toISODate(parsed), m);
  });

  return eachDayInWindow(window).map((date) => {
    const iso = toISODate(date);
    const existing = seeded.get(iso);
    if (existing) return existing;
    return synthesiseDailyMetric(date, metrics, random);
  });
}

/** Keeps the legacy behaviour available for anything that only wants real, seeded days. */
export function seededDailyMetricsInWindow(
  metrics: DailyMetric[],
  dateFilter: DateFilterKey,
  customRange?: CustomRange
): DailyMetric[] {
  const window = windowFor(dateFilter, customRange);
  return metrics.filter((m) => {
    const parsed = parseISODate(m.date);
    return parsed ? isWithinWindow(parsed, window) : false;
  });
}

export function computeKPIs(records: AuditRecord[], dateFilter: DateFilterKey, customRange?: CustomRange): QualityKPIs {
  const scale = scaleForWindow(dateFilter, customRange);
  // Same seeded-jitter approach as computeSpecialtyStats/computeTopPerformers below,
  // so the rate-based KPIs (which aren't already moved by `scale`, since they're
  // ratios rather than totals) still read as a fresh snapshot per window instead
  // of freezing at the same figure for every date filter.
  const random = randomForWindow(dateFilter, customRange, "kpis");
  const rateJitter = (random() - 0.5) * 1.6;
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
  const passRate = totals.charts
    ? Number(Math.max(0, Math.min(100, (totals.passed / totals.charts) * 100 + rateJitter)).toFixed(1))
    : 0;
  const firstPassAccuracy = totals.charts
    ? Number(Math.max(0, Math.min(100, totals.weightedFirstPass / totals.charts + rateJitter * 0.8)).toFixed(1))
    : 0;
  const reworkRate = totals.charts
    ? Number(Math.max(0, (totals.reworked / totals.charts) * 100 - rateJitter * 0.4).toFixed(1))
    : 0;
  const failedAuditChecks = Math.round(totals.failed * scale);
  const rejectedRecords = Math.round(totals.rejected * scale);
  const auditsPending = Math.round(totals.pending * scale);
  const avgAuditTimeDays = totals.charts
    ? Number(Math.max(0, totals.weightedAuditTime / totals.charts + rateJitter * 0.05).toFixed(1))
    : 0;

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

export function computeRejectionReasons(
  records: AuditRecord[],
  dateFilter: DateFilterKey,
  customRange?: CustomRange
): RejectionReasonStat[] {
  const scale = scaleForWindow(dateFilter, customRange);
  const random = randomForWindow(dateFilter, customRange, "rejection-reasons");
  const totals = new Map<string, number>();
  records.forEach((r) => {
    Object.entries(r.reasonBreakdown).forEach(([reason, count]) => {
      // Scale to the active window, with a touch of jitter so the mix looks
      // like a genuinely different slice rather than a flat percentage cut.
      const scaled = Math.round(count * scale * (0.9 + random() * 0.2));
      totals.set(reason, (totals.get(reason) ?? 0) + scaled);
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

export function computeSpecialtyStats(
  records: AuditRecord[],
  dateFilter: DateFilterKey,
  customRange?: CustomRange
): SpecialtyStat[] {
  const scale = scaleForWindow(dateFilter, customRange);
  const random = randomForWindow(dateFilter, customRange, "specialty-stats");
  return records
    .filter((r) => r.specialty !== "Other")
    .map((r) => {
      const chartsAudited = Math.max(1, Math.round(r.chartsAudited * scale));
      const failed = Math.round(r.failed * scale);
      // Small deterministic jitter per specialty so rates read as a fresh
      // snapshot for the window rather than the exact same figure every time.
      const jitter = (random() - 0.5) * 1.8;
      const passRate = Number(Math.max(60, Math.min(99.8, r.passRate + jitter)).toFixed(1));
      const firstPassAccuracy = Number(Math.max(55, Math.min(99, r.firstPassAccuracy + jitter * 0.8)).toFixed(1));
      const reworkRate = Number(Math.max(0.5, r.reworkRate - jitter * 0.4).toFixed(1));
      return {
        specialty: r.specialty,
        chartsAudited,
        passRate,
        failed,
        firstPassAccuracy,
        reworkRate,
        trend: [passRate - 3, passRate - 1.5, passRate - 2, passRate - 0.5, passRate + 0.3, passRate].map((v) =>
          Number(Math.max(0, Math.min(100, v)).toFixed(1))
        ),
      };
    });
}

export function computeAccuracyDistribution(
  coders: CoderRecord[],
  dateFilter: DateFilterKey,
  customRange?: CustomRange
): AccuracyBucket[] {
  const scale = rosterScaleForWindow(dateFilter, customRange);
  const random = randomForWindow(dateFilter, customRange, "accuracy-distribution");
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
  // A shorter window means fewer coders had an audit reviewed in it — scale
  // the roster snapshot down accordingly instead of always showing everyone.
  return buckets.map((b) => ({
    bucket: b.bucket,
    count: scale >= 1 ? b.count : Math.round(b.count * scale * (0.9 + random() * 0.2)),
  }));
}

export function computeTopPerformers(
  coders: CoderRecord[],
  dateFilter: DateFilterKey,
  customRange?: CustomRange,
  limit = 5
): CoderRecord[] {
  const random = randomForWindow(dateFilter, customRange, "top-performers");
  // Same roster, but each window gets its own small, deterministic jitter on
  // the rates so the leaderboard isn't a frozen, identical list every time —
  // occasionally reshuffling order the way a real reporting window would.
  return [...coders]
    .map((c) => {
      const jitter = (random() - 0.5) * 1.2;
      return {
        ...c,
        passRate: Number(Math.max(0, Math.min(100, c.passRate + jitter)).toFixed(1)),
        firstPassAccuracy: Number(Math.max(0, Math.min(100, c.firstPassAccuracy + jitter * 0.8)).toFixed(1)),
      };
    })
    .sort((a, b) => b.passRate - a.passRate)
    .slice(0, limit);
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