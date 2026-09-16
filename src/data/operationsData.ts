import type {
  ChartAgingBucket,
  DailyThroughputPoint,
  DateFilterOption,
  InsightCardData,
  KPICardData,
  PipelineStageData,
  PriorityDatum,
  TeamWorkloadRow,
  TurnaroundStage,
} from "../types/operations";

export const dateFilters: DateFilterOption[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7d" },
  { key: "30d", label: "30d" },
  { key: "month", label: "This month" },
  { key: "custom", label: "Custom" },
];

export const subProjectOptions: string[] = [
  "All sub-projects",
  "Inpatient Coding",
  "Outpatient Coding",
  "Emergency Department",
  "Ambulatory Surgery",
];

export const kpiData: KPICardData[] = [
  {
    id: "charts-received",
    label: "Charts Received",
    value: "3,482",
    trend: { direction: "up", label: "142 this week" },
    sparkline: [12, 14, 13, 18, 22, 20, 28, 26, 32, 30, 36, 40],
    tone: "accent",
    visual: "sparkline",
  },
  {
    id: "charts-completed",
    label: "Charts Completed",
    value: "3,046",
    trend: { direction: "up", label: "18% vs prev" },
    sparkline: [10, 11, 15, 14, 17, 19, 18, 22, 24, 23, 27, 29],
    tone: "amber",
    visual: "sparkline",
  },
  {
    id: "open-backlog",
    label: "Open Backlog",
    value: "482",
    trend: { direction: "down", label: "36 vs prev" },
    sparkline: [420, 435, 428, 450, 440, 465, 452, 470, 458, 482],
    tone: "neutral",
    visual: "sparkline",
    footnote: [{ label: "Overdue", value: "138" }],
  },
  {
    id: "in-progress",
    label: "In Progress",
    value: "318",
    trend: { direction: "down", label: "4 vs prev" },
    sparkline: [20, 22, 21, 24, 23, 22, 25, 24, 26, 24, 23, 22],
    tone: "accent",
    visual: "sparkline",
  },
  {
    id: "completion-rate",
    label: "Completion Rate",
    value: "87.5%",
    trend: { direction: "up", label: "2.1 pts vs prev" },
    tone: "accent",
    visual: "donut",
    donutValue: 87.5,
  },
  {
    id: "sla-compliance",
    label: "SLA Compliance",
    value: "94.6%",
    trend: { direction: "up", label: "2.1 pts vs prev" },
    tone: "success",
    visual: "none",
    footnote: [
      { label: "Within SLA", value: "4,820" },
      { label: "Breached", value: "276" },
    ],
  },
  {
    id: "capacity-utilization",
    label: "Capacity Utilization",
    value: "82%",
    tone: "accent",
    visual: "bar",
    barValue: 82,
    footnote: [{ label: "", value: "1,240 / 1,500", unit: "charts" }],
  },
];

export const pipelineData: PipelineStageData[] = [
  {
    id: "unallocated",
    label: "Unallocated",
    value: 96,
    percentLabel: "2.8%",
    trend: {
      direction: "up",
    },
    tone: "neutral",
  },
  {
    id: "open",
    label: "Open",
    value: 224,
    percentLabel: "6.4%",
    trend: {
      direction: "up",
    },
    tone: "accent",
  },
  {
    id: "in-progress",
    label: "In Progress",
    value: 318,
    percentLabel: "9.1%",
    trend: {
      direction: "up",
    },
    tone: "amber",
  },
  {
    id: "pending-clarification",
    label: "Pending Clarification",
    value: 142,
    percentLabel: "4.1%",
    trend: {
      direction: "down",
    },
    tone: "amber",
  },
  {
    id: "qa-review",
    label: "QA Review",
    value: 186,
    percentLabel: "5.3%",
    trend: {
      direction: "up",
    },
    tone: "danger",
  },
  {
    id: "re-assigned",
    label: "Re-Assigned",
    value: 58,
    percentLabel: "1.7%",
    trend: {
      direction: "down",
    },
    tone: "amber",
  },
  {
    id: "completed",
    label: "Completed",
    value: 2458,
    percentLabel: "70.6%",
    trend: {
      direction: "up",
    },
    tone: "success",
  },
];

export const dailyThroughputData: DailyThroughputPoint[] = [
  { day: "Mon", date: "12 Aug", received: 128, completed: 96 },
  { day: "Tue", date: "13 Aug", received: 120, completed: 110 },
  { day: "Wed", date: "14 Aug", received: 95, completed: 135 },
  { day: "Thu", date: "15 Aug", received: 150, completed: 120 },
  { day: "Fri", date: "16 Aug", received: 168, completed: 148 },
  { day: "Sat", date: "17 Aug", received: 60, completed: 55 },
  { day: "Sun", date: "18 Aug", received: 45, completed: 40 },
];

export const turnaroundData: TurnaroundStage[] = [
  { id: "waiting", label: "Waiting to start", days: 1.8, maxDays: 3 },
  { id: "coding", label: "Coding", days: 2.4, maxDays: 3 },
  { id: "awaiting-audit", label: "Awaiting audit", days: 0.9, maxDays: 3 },
  { id: "in-audit", label: "In audit", days: 1.3, maxDays: 3 },
];

export const turnaroundBottleneck = { label: "Coding", days: "2.4d" };
export const slowestChart = { id: "CLT-000123", days: "23d" };

export const chartAgingData: ChartAgingBucket[] = [
  { bucket: "0–2 days", count: 412 },
  { bucket: "3–5 days", count: 268 },
  { bucket: "6–10 days", count: 154 },
  { bucket: "11–20 days", count: 72 },
  { bucket: "20+ days", count: 31, warning: true },
];

export const priorityData: PriorityDatum[] = [
  { id: "critical", label: "Critical", count: 24, percent: 5.0, color: "var(--color-danger)" },
  { id: "high", label: "High", count: 86, percent: 17.8, color: "var(--color-accent)" },
  { id: "normal", label: "Normal", count: 312, percent: 64.7, color: "var(--color-amber)" },
  { id: "low", label: "Low", count: 60, percent: 12.4, color: "var(--color-ink-muted)" },
];

export const priorityTotal = 482;

export const teamWorkloadData: TeamWorkloadRow[] = [
  { id: "team-a", team: "Team A", assigned: 420, inProgress: 52, completed: 368, backlog: 52, avatarTone: "accent" },
  { id: "team-b", team: "Team B", assigned: 380, inProgress: 71, completed: 309, backlog: 71, avatarTone: "amber" },
  { id: "team-c", team: "Team C", assigned: 290, inProgress: 34, completed: 256, backlog: 34, avatarTone: "accent" },
  { id: "team-d", team: "Team D", assigned: 210, inProgress: 28, completed: 182, backlog: 28, avatarTone: "info" },
];

export const reassignmentRate = {
  percent: "1.7%",
  trend: { direction: "down" as const, label: "0.4 pts vs prev" },
  reassignedCharts: 58,
  totalCharts: 3482,
};

export const insightData: InsightCardData[] = [
  {
    id: "bottleneck",
    icon: "clock",
    label: "Current Bottleneck",
    value: "Coding",
    supporting: "2.4 days",
    trend: { direction: "up", label: "18% vs prev"},
    tone: "danger",
  },
  {
    id: "overdue-138",
    icon: "alertTriangle",
    label: "Overdue Charts",
    value: "138",
    supporting: "",
    trend: { direction: "up", label: "22 vs prev" },
    tone: "amber",
  },
  {
    id: "sla",
    icon: "shieldCheck",
    label: "SLA Compliance",
    value: "94.6%",
    supporting: "",
    trend: { direction: "up", label: "2.1 pts vs prev" },
    tone: "accent",
  },
  {
    id: "avg-daily",
    icon: "trendingUp",
    label: "Avg. Daily Completed",
    value: "102",
    supporting: "Charts per day",
    trend: { direction: "up", label: "12 vs prev" },
    tone: "success",
  },
  {
    id: "peak-day",
    icon: "calendar",
    label: "Peak Day",
    value: "30 Aug 2023",
    supporting: "658 Charts",
    tone: "info",
  },
  {
    id: "overdue-482",
    icon: "inbox",
    label: "Overdue Charts",
    value: "482",
    supporting: "",
    trend: { direction: "up", label: "36 vs prev" },
    tone: "alert",
  },
];
