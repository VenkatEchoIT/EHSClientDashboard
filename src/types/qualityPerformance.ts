import type { Trend } from "./operations";

export type Specialty = "Cardiology" | "Orthopedics" | "Oncology" | "Neurology" | "General Medicine" | "Other";

export type RejectionReason =
  | "Incorrect code"
  | "Missing documentation"
  | "Modifier error"
  | "Documentation mismatch"
  | "Other";

export type AccuracyCategory = "at-above" | "slightly-below" | "well-below";

/** A batch of audit activity for one specialty over the active reporting window. */
export interface AuditRecord {
  id: string;
  specialty: Specialty;
  chartsAudited: number;
  passed: number;
  failed: number;
  rejected: number;
  reworked: number;
  pending: number;
  firstPassAccuracy: number; // 0-100
  passRate: number; // 0-100
  reworkRate: number; // 0-100
  auditTimeDays: number;
  reasonBreakdown: Record<RejectionReason, number>;
}

/** One coder on the roster, used for the accuracy distribution and top performers. */
export interface CoderRecord {
  id: string;
  name: string;
  specialty: Specialty;
  passRate: number;
  firstPassAccuracy: number;
  reworkRate: number;
  trend: number[];
}

/** One calendar day's audit throughput/accuracy, used for trend + scatter charts. */
export interface DailyMetric {
  date: string; // ISO yyyy-mm-dd
  label: string; // e.g. "Sep 9"
  chartsAudited: number;
  firstPassAccuracy: number;
  passRate: number;
  category: AccuracyCategory;
}

export interface WeekdayThroughput {
  day: string;
  chartsAudited: number;
  pendingQueue: number;
  passRate: number;
}

export interface CurrentQueueSnapshot {
  charts: number;
  turnaroundDays: number;
}

export type QualityKPITone = "accent" | "amber" | "success" | "info" | "neutral";

export interface QualityDataSnapshot {
  auditRecords: AuditRecord[];
  coders: CoderRecord[];
  dailyMetrics: DailyMetric[];
  weeklyThroughput: WeekdayThroughput[];
  currentQueue: CurrentQueueSnapshot;
}

export interface SpecialtyStat {
  specialty: Specialty;
  chartsAudited: number;
  passRate: number;
  failed: number;
  firstPassAccuracy: number;
  reworkRate: number;
  trend: number[];
}

export interface RejectionReasonStat {
  reason: RejectionReason;
  count: number;
  percent: number;
}

export interface QualityKPIs {
  passRate: number;
  firstPassAccuracy: number;
  reworkRate: number;
  failedAuditChecks: number;
  rejectedRecords: number;
  chartsAudited: number;
  auditsPending: number;
  avgAuditTimeDays: number;
  prev: {
    passRate: number;
    firstPassAccuracy: number;
    reworkRate: number;
    failedAuditChecks: number;
    rejectedRecords: number;
    chartsAudited: number;
    auditsPending: number;
    avgAuditTimeDays: number;
  };
}

export interface AccuracyBucket {
  bucket: string;
  count: number;
}

export interface QualityInsightsData {
  qualityVsTargetPts: number;
  improvementPts: number;
  topSpecialty: { specialty: string; passRate: number };
  mostCommonError: { reason: string; percent: number };
  reworkSavingsHours: number;
}

export type { Trend };
