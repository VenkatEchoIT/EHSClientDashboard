import type { CustomRange, DateFilterKey } from "../types/operations";
import { buildOperationsSnapshot, dateFilters, subProjectOptions, type OperationsSnapshot } from "../data/dashboardData";
import { resolveDateWindow } from "../lib/dateWindow";

const snapshotCache = new Map<string, OperationsSnapshot>();

function cacheKey(dateFilter: DateFilterKey, customRange?: CustomRange): string {
  return `${dateFilter}:${customRange?.start ?? ""}:${customRange?.end ?? ""}`;
}

function getSnapshot(dateFilter: DateFilterKey, customRange?: CustomRange): OperationsSnapshot {
  const key = cacheKey(dateFilter, customRange);
  let snapshot = snapshotCache.get(key);
  if (!snapshot) {
    snapshot = buildOperationsSnapshot(dateFilter, customRange);
    // Keep the cache small; this is mock data, not a real store.
    if (snapshotCache.size > 20) snapshotCache.clear();
    snapshotCache.set(key, snapshot);
  }
  return snapshot;
}

export function getDateFilters() {
  return dateFilters;
}

export function getSubProjectOptions() {
  return subProjectOptions;
}

export function getOperationsKPIs(dateFilter: DateFilterKey, customRange?: CustomRange) {
  return getSnapshot(dateFilter, customRange).kpiData;
}

export function getPipelineData(dateFilter: DateFilterKey, customRange?: CustomRange) {
  return getSnapshot(dateFilter, customRange).pipelineData;
}

export function getDailyThroughputData(dateFilter: DateFilterKey, customRange?: CustomRange) {
  return getSnapshot(dateFilter, customRange).dailyThroughputData;
}

export function getThroughputMeta(dateFilter: DateFilterKey, customRange?: CustomRange) {
  const snapshot = getSnapshot(dateFilter, customRange);
  const window = resolveDateWindow(dateFilter, customRange);
  const granularity =
    snapshot.throughputGranularity ?? (dateFilter === "today" ? "hour" : "day");
  const format = (date: Date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return {
    granularity,
    days: window.days,
    rangeLabel: window.days === 1 ? format(window.start) : `${format(window.start)} – ${format(window.end)}`,
  };
}

export function getTurnaroundData(dateFilter: DateFilterKey, customRange?: CustomRange) {
  const snapshot = getSnapshot(dateFilter, customRange);
  return {
    stages: snapshot.turnaroundData,
    bottleneck: snapshot.turnaroundBottleneck,
    slowestChart: snapshot.slowestChart,
  };
}

export function getChartAgingData(dateFilter: DateFilterKey, customRange?: CustomRange) {
  return getSnapshot(dateFilter, customRange).chartAgingData;
}

export function getPriorityData(dateFilter: DateFilterKey, customRange?: CustomRange) {
  const snapshot = getSnapshot(dateFilter, customRange);
  return {
    data: snapshot.priorityData,
    total: snapshot.priorityTotal,
  };
}

export function getTeamWorkloadData(dateFilter: DateFilterKey, customRange?: CustomRange) {
  return getSnapshot(dateFilter, customRange).teamWorkloadData;
}

export function getReassignmentRate(dateFilter: DateFilterKey, customRange?: CustomRange) {
  return getSnapshot(dateFilter, customRange).reassignmentRate;
}

export function getOperationsInsights(dateFilter: DateFilterKey, customRange?: CustomRange) {
  return getSnapshot(dateFilter, customRange).insightData;
}
