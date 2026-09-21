import type {
  ChartAgingBucket,
  DailyThroughputPoint,
  InsightCardData,
  KPICardData,
  PipelineStageData,
  PriorityDatum,
  TeamWorkloadRow,
  TurnaroundStage,
} from "../types/operations";
import {
  eachDayInWindow,
  formatMonthDayPadded,
  formatNumber,
  isWeekend,
  previousWindow,
  randomForWindow,
  weekdayShort,
  type ResolvedWindow,
} from "../lib/dateWindow";
import type { OperationsSnapshot } from "./dashboardData";

interface DailyProfile {
  weekdayReceived: number;
  weekendReceived: number;
  completionRatio: number;
  baseReceived: number;
}

function buildProfile(base: DailyThroughputPoint[]): DailyProfile {
  const weekdayPoints = base.filter((p) => p.day !== "Sat" && p.day !== "Sun");
  const weekendPoints = base.filter((p) => p.day === "Sat" || p.day === "Sun");
  const avg = (points: DailyThroughputPoint[], fallback: number) =>
    points.length ? points.reduce((sum, p) => sum + p.received, 0) / points.length : fallback;

  const totalReceived = base.reduce((sum, p) => sum + p.received, 0) || 1;
  const totalCompleted = base.reduce((sum, p) => sum + p.completed, 0);

  return {
    weekdayReceived: avg(weekdayPoints, 150),
    weekendReceived: avg(weekendPoints, 55),
    completionRatio: totalCompleted / totalReceived,
    baseReceived: totalReceived,
  };
}

function generateSeries(window: ResolvedWindow, profile: DailyProfile): DailyThroughputPoint[] {
  const random = randomForWindow(window, "throughput");
  return eachDayInWindow(window).map((date) => {
    const baseline = isWeekend(date) ? profile.weekendReceived : profile.weekdayReceived;
    const received = Math.max(1, Math.round(baseline * (0.78 + random() * 0.46)));
    const completed = Math.max(
      0,
      Math.min(received, Math.round(received * profile.completionRatio * (0.9 + random() * 0.2)))
    );
    return {
      day: weekdayShort(date),
      date: formatMonthDayPadded(date),
      received,
      completed,
    };
  });
}

/** Rolls a long daily series up into weekly buckets so the axis stays readable. */
function toWeeklyBuckets(points: DailyThroughputPoint[]): DailyThroughputPoint[] {
  const buckets: DailyThroughputPoint[] = [];
  for (let i = 0; i < points.length; i += 7) {
    const slice = points.slice(i, i + 7);
    buckets.push({
      day: "Wk",
      date: slice[0].date,
      received: slice.reduce((sum, p) => sum + p.received, 0),
      completed: slice.reduce((sum, p) => sum + p.completed, 0),
    });
  }
  return buckets;
}

function sparklineFrom(points: DailyThroughputPoint[], key: "received" | "completed"): number[] {
  const values = points.map((p) => p[key]);
  if (values.length <= 30) return values;
  // Evenly sample down to 30 points so the sparkline keeps its shape.
  const step = values.length / 30;
  return Array.from({ length: 30 }, (_, i) => values[Math.min(values.length - 1, Math.round(i * step))]);
}

function totals(points: DailyThroughputPoint[]) {
  return {
    received: points.reduce((sum, p) => sum + p.received, 0),
    completed: points.reduce((sum, p) => sum + p.completed, 0),
  };
}

function trend(current: number, previous: number, unit: "count" | "pts" | "percent") {
  const diff = current - previous;
  const direction: "up" | "down" = diff >= 0 ? "up" : "down";
  const magnitude = Math.abs(diff);
  const label =
    unit === "count"
      ? `${formatNumber(magnitude)} vs prev`
      : unit === "pts"
        ? `${magnitude.toFixed(1)} pts vs prev`
        : `${Math.round(magnitude)}% vs prev`;
  return { direction, label };
}

function round1(value: number): number {
  return Number(value.toFixed(1));
}

export function buildWindowedOperationsSnapshot(
  window: ResolvedWindow,
  baseSnapshot: OperationsSnapshot
): OperationsSnapshot {
  const profile = buildProfile(baseSnapshot.dailyThroughputData);
  const dailySeries = generateSeries(window, profile);
  const prevSeries = generateSeries(previousWindow(window), profile);

  const current = totals(dailySeries);
  const previous = totals(prevSeries);
  const random = randomForWindow(window, "operations");

  // Volume scale relative to the reference 30-day snapshot, used for the
  // period-total cards (pipeline, teams).
  const scale = current.received / (profile.baseReceived || 1);

  // Backlog is a point-in-time figure, derived from what didn't get finished
  // in the window plus a residual carry-over, so it stays consistent with the
  // received/completed totals instead of being frozen at the seeded value.
  const carryOver = Math.round(92 * (0.8 + random() * 0.4));
  const backlog = Math.max(20, current.received - current.completed + carryOver);
  const prevBacklog = Math.max(
    20,
    previous.received - previous.completed + Math.round(92 * (0.8 + random() * 0.4))
  );
  const backlogScale = backlog / 505;

  const overdue = Math.round(backlog * 0.253);
  const prevOverdue = Math.round(prevBacklog * 0.253);
  const inProgress = Math.round(backlog * 0.673);
  const prevInProgress = Math.round(prevBacklog * 0.673);

  const completionRate = current.received ? round1((current.completed / current.received) * 100) : 0;
  const prevCompletionRate = previous.received ? round1((previous.completed / previous.received) * 100) : 0;

  const slaRate = round1(Math.max(88, Math.min(98.5, 94.1 + (random() - 0.5) * 4)));
  const prevSlaRate = round1(Math.max(86, Math.min(98, slaRate - 0.6 - random() * 2)));
  const withinSla = Math.round(current.completed * (slaRate / 100));
  const breachedSla = Math.max(0, current.completed - withinSla);

  // Daily capacity taken from the reference snapshot (4,497 charts / 30 days).
  const dailyCapacity = 4497 / 30;
  const capacity = Math.max(1, Math.round(dailyCapacity * window.days));
  const utilization = Math.round((current.received / capacity) * 100);

  const kpiByBase = new Map(baseSnapshot.kpiData.map((kpi) => [kpi.id, kpi]));
  const withBase = (id: string, patch: Partial<KPICardData>): KPICardData => {
    const base = kpiByBase.get(id);
    return { ...(base as KPICardData), ...patch };
  };

  const kpiData: KPICardData[] = [
    withBase("charts-received", {
      value: formatNumber(current.received),
      trend: trend(current.received, previous.received, "count"),
      sparkline: sparklineFrom(dailySeries, "received"),
    }),
    withBase("charts-completed", {
      value: formatNumber(current.completed),
      trend: trend(current.completed, previous.completed, "count"),
      sparkline: sparklineFrom(dailySeries, "completed"),
    }),
    withBase("open-backlog", {
      value: formatNumber(backlog),
      trend: trend(backlog, prevBacklog, "count"),
      sparkline: sparklineFrom(dailySeries, "received").map((_, i, arr) =>
        Math.max(20, Math.round(backlog * (0.78 + (i / Math.max(1, arr.length - 1)) * 0.22)))
      ),
      footnote: [{ label: "Overdue", value: formatNumber(overdue) }],
    }),
    withBase("in-progress", {
      value: formatNumber(inProgress),
      trend: trend(inProgress, prevInProgress, "count"),
      sparkline: sparklineFrom(dailySeries, "completed").map((v) =>
        Math.max(10, Math.round(inProgress * (0.85 + (v % 17) / 100)))
      ),
    }),
    withBase("completion-rate", {
      value: `${completionRate}%`,
      trend: trend(completionRate, prevCompletionRate, "pts"),
      donutValue: completionRate,
    }),
    withBase("sla-compliance", {
      value: `${slaRate}%`,
      trend: trend(slaRate, prevSlaRate, "pts"),
      footnote: [
        { label: "Within SLA", value: formatNumber(withinSla) },
        { label: "Breached", value: formatNumber(breachedSla) },
      ],
    }),
    withBase("capacity-utilization", {
      value: `${utilization}%`,
      barValue: Math.max(0, Math.min(100, utilization)),
      footnote: [
        { label: "", value: `${formatNumber(current.received)} / ${formatNumber(capacity)}`, unit: "charts" },
      ],
    }),
  ];

  const pipelineData: PipelineStageData[] = baseSnapshot.pipelineData.map((stage) => {
    const value = Math.max(1, Math.round(stage.value * scale));
    const percent = current.received ? (value / current.received) * 100 : 0;
    return { ...stage, value, percentLabel: `${percent.toFixed(1)}%` };
  });

  const turnaroundData: TurnaroundStage[] = baseSnapshot.turnaroundData.map((stage) => ({
    ...stage,
    days: round1(Math.max(0.2, stage.days + (random() - 0.5) * 0.7)),
  }));
  const slowestStage = [...turnaroundData].sort((a, b) => b.days - a.days)[0];

  const chartAgingData: ChartAgingBucket[] = baseSnapshot.chartAgingData.map((bucket) => ({
    ...bucket,
    count: Math.max(0, Math.round(bucket.count * backlogScale)),
  }));

  const priorityRaw = baseSnapshot.priorityData.map((datum) => ({
    ...datum,
    count: Math.max(0, Math.round(datum.count * backlogScale)),
  }));
  const priorityTotal = priorityRaw.reduce((sum, d) => sum + d.count, 0) || 1;
  const priorityData: PriorityDatum[] = priorityRaw.map((datum) => ({
    ...datum,
    percent: round1((datum.count / priorityTotal) * 100),
  }));

  const teamWorkloadData: TeamWorkloadRow[] = baseSnapshot.teamWorkloadData.map((team) => ({
    ...team,
    assigned: Math.max(0, Math.round(team.assigned * scale)),
    inProgress: Math.max(0, Math.round(team.inProgress * backlogScale)),
    completed: Math.max(0, Math.round(team.completed * scale)),
    backlog: Math.max(0, Math.round(team.backlog * backlogScale)),
  }));

  const reassignPercent = round1(Math.max(0.6, Math.min(6, 2.3 + (random() - 0.5) * 1.6)));
  // Nudge away from an exact tie so the card never renders a "0.0 pts vs prev" trend.
  const reassignDelta = (random() - 0.5) * 1.2;
  const prevReassignPercent = round1(
    Math.max(0.5, reassignPercent + (Math.abs(reassignDelta) < 0.1 ? 0.25 : reassignDelta))
  );
  const reassignmentRate = {
    percent: `${reassignPercent}%`,
    trend: trend(reassignPercent, prevReassignPercent, "pts") as {
      direction: "up" | "down";
      label: string;
    },
    reassignedCharts: Math.round((current.received * reassignPercent) / 100),
    totalCharts: current.received,
  };

  const peak = [...dailySeries].sort((a, b) => b.received - a.received)[0];
  const avgDailyCompleted = Math.round(current.completed / Math.max(1, window.days));
  const prevAvgDailyCompleted = Math.round(previous.completed / Math.max(1, window.days));

  const insightBase = new Map(baseSnapshot.insightData.map((card) => [card.id, card]));
  const insight = (id: string, patch: Partial<InsightCardData>): InsightCardData => ({
    ...(insightBase.get(id) as InsightCardData),
    ...patch,
  });

  const insightData: InsightCardData[] = [
    insight("bottleneck", {
      value: slowestStage.label,
      supporting: `${slowestStage.days}d`,
      trend: trend(slowestStage.days, slowestStage.days - 0.3, "pts"),
    }),
    insight("sla", { value: `${slaRate}%`, trend: trend(slaRate, prevSlaRate, "pts") }),
    insight("avg-daily", {
      value: formatNumber(avgDailyCompleted),
      supporting: "Charts per day",
      trend: trend(avgDailyCompleted, prevAvgDailyCompleted, "count"),
    }),
    insight("peak-day", {
      value: peak ? `${peak.day} ${peak.date}` : "—",
      supporting: peak ? `${formatNumber(peak.received)} Charts` : "",
    }),
    insight("overdue", {
      value: formatNumber(overdue),
      trend: trend(overdue, prevOverdue, "count"),
    }),
  ];

  const useWeekly = window.days > 45;

  return {
    kpiData,
    pipelineData,
    dailyThroughputData: useWeekly ? toWeeklyBuckets(dailySeries) : dailySeries,
    throughputGranularity: useWeekly ? "week" : "day",
    turnaroundData,
    turnaroundBottleneck: { label: slowestStage.label, days: `${slowestStage.days}d` },
    slowestChart: {
      id: `CLT-${500000 + Math.round(random() * 99999)}`,
      days: `${Math.max(3, Math.round(slowestStage.days * 6 + random() * 5))}d`,
    },
    chartAgingData,
    priorityData,
    priorityTotal,
    teamWorkloadData,
    reassignmentRate,
    insightData,
  };
}
