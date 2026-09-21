export type TrendDirection = "up" | "down" | "flat";

export interface Trend {
  direction: TrendDirection;
  label: string;
}

export type KPITone = "accent" | "amber" | "success" | "info" | "neutral";

export interface KPICardData {
  id: string;
  label: string;
  value: string;
  trend?: Trend;
  sparkline?: number[];
  tone: KPITone;
  trendTone?: KPITone;
  target?: number;
  footnote?: { label: string; value: string, unit?: string; }[];
  visual?: "sparkline" | "donut" | "bar" | "none";
  donutValue?: number; // 0-100, used when visual === "donut"
  barValue?: number; // 0-100, used when visual === "bar"
}

export type PipelineTone = "neutral" | "accent" | "amber" | "info" | "success" | "danger" |"darkyellow" | "reassigned";

export interface PipelineStageData {
  id: string;
  label: string;
  value: number;
  percentLabel: string;
  trend?: {
    direction: "up" | "down";   
  };
  tone: PipelineTone;
}

export interface DailyThroughputPoint {
  day: string;
  date: string;
  received: number;
  completed: number;
  
}

export interface TurnaroundStage {
  id: string;
  label: string;
  days: number;
  maxDays: number;
}

export interface ChartAgingBucket {
  bucket: string;
  count: number;
  warning?: boolean;
}

export interface PriorityDatum {
  id: string;
  label: string;
  count: number;
  percent: number;
  color: string;
}

export interface TeamWorkloadRow {
  id: string;
  team: string;
  assigned: number;
  inProgress: number;
  completed: number;
  backlog: number;
  avatarTone: "accent" | "amber" | "info";
}

export interface InsightCardData {
  id: string;
  icon: "clock" | "alertTriangle" | "shieldCheck" | "trendingUp" | "calendar" | "inbox";
  label: string;
  value: string;
  supporting: string;
  trend?: Trend;
  tone: "accent" | "amber" | "success" | "info" | "danger" | "alert";
}

export type DateFilterKey = "today" | "7d" | "30d" | "month" | "custom";

export interface DateFilterOption {
  key: DateFilterKey;
  label: string;
}

/** Inclusive custom date range, ISO yyyy-mm-dd, used when DateFilterKey is "custom". */
export interface CustomRange {
  start: string;
  end: string;
}

export type DashboardTab = "operations" | "quality";
