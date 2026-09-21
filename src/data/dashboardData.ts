import type {
  ChartAgingBucket,
  CustomRange,
  DailyThroughputPoint,
  DateFilterKey,
  DateFilterOption,
  InsightCardData,
  KPICardData,
  PipelineStageData,
  PriorityDatum,
  TeamWorkloadRow,
  TurnaroundStage,
} from "../types/operations";

import type {
  AuditRecord,
  CoderRecord,
  CurrentQueueSnapshot,
  DailyMetric,
  WeekdayThroughput,
} from "../types/qualityPerformance";

import { formatNumber, resolveDateWindow, toISODate } from "../lib/dateWindow";
import { buildWindowedOperationsSnapshot } from "./operationsWindow";
import { averagePeriodFor } from "../lib/periodAverage";

// ---------------------------------------------------------------------------
// This file holds plain, static mock data. Nothing here is randomly
// generated or calculated at runtime -- every value below is a literal so
// it's easy to find and edit by hand.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Operations data
// ---------------------------------------------------------------------------

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

export interface OperationsSnapshot {
  kpiData: KPICardData[];
  pipelineData: PipelineStageData[];
  dailyThroughputData: DailyThroughputPoint[];
  /** How each throughput point should be read. Defaults to "day" when omitted. */
  throughputGranularity?: "hour" | "day" | "week";
  turnaroundData: TurnaroundStage[];
  turnaroundBottleneck: { label: string; days: string };
  slowestChart: { id: string; days: string };
  chartAgingData: ChartAgingBucket[];
  priorityData: PriorityDatum[];
  priorityTotal: number;
  teamWorkloadData: TeamWorkloadRow[];
  reassignmentRate: { percent: string; trend: { direction: "up" | "down"; label: string }; reassignedCharts: number; totalCharts: number };
  insightData: InsightCardData[];
}

/**
 * Static, hand-editable mock snapshots for the Operations tab -- one per
 * date filter. Nothing is calculated; these are the literal numbers shown
 * in the UI. "custom" reuses the "30d" snapshot since there's no single
 * static dataset that fits every possible custom range.
 */
export const operationsSnapshots: Record<"today" | "7d" | "30d" | "month", OperationsSnapshot> = {
  "today": {
    "kpiData": [
      {
        "id": "charts-received",
        "label": "Charts Received",
        "value": "174",
        "trend": {
          "direction": "up",
          "label": "7 this period"
        },
        "sparkline": [
          4,
          8,
          16,
          17,
          24,
          14,
          12,
          15,
          25,
          17,
          12,
          10
        ],
        "tone": "accent",
        "visual": "sparkline"
      },
      {
        "id": "charts-completed",
        "label": "Charts Completed",
        "value": "147",
        "trend": {
          "direction": "up",
          "label": "80% vs prev"
        },
        "sparkline": [
          3,
          6,
          13,
          13,
          22,
          12,
          9,
          13,
          23,
          16,
          9,
          8
        ],
        "tone": "amber",
        "visual": "sparkline"
      },
      {
        "id": "open-backlog",
        "label": "Open Backlog",
        "value": "126",
        "trend": {
          "direction": "down",
          "label": "9 vs prev"
        },
        "sparkline": [
          99,
          102,
          102,
          106,
          106,
          109,
          111,
          114,
          115,
          120,
          119,
          125
        ],
        "tone": "neutral",
        "visual": "sparkline",
        "footnote": [
          {
            "label": "Overdue",
            "value": "36"
          }
        ]
      },
      {
        "id": "in-progress",
        "label": "In Progress",
        "value": "79",
        "trend": {
          "direction": "down",
          "label": "2 vs prev"
        },
        "sparkline": [
          68,
          87,
          76,
          81,
          83,
          76,
          87,
          82,
          90,
          85,
          72,
          71
        ],
        "tone": "accent",
        "visual": "sparkline"
      },
      {
        "id": "completion-rate",
        "label": "Completion Rate",
        "value": "84.5%",
        "trend": {
          "direction": "up",
          "label": "2.1 pts vs prev"
        },
        "tone": "accent",
        "visual": "donut",
        "donutValue": 84.5
      },
      {
        "id": "sla-compliance",
        "label": "SLA Compliance",
        "value": "94.6%",
        "trend": {
          "direction": "up",
          "label": "2.1 pts vs prev"
        },
        "tone": "success",
        "visual": "none",
        "footnote": [
          {
            "label": "Within SLA",
            "value": "139"
          },
          {
            "label": "Breached",
            "value": "8"
          }
        ]
      },
      {
        "id": "capacity-utilization",
        "label": "Capacity Utilization",
        "value": "84%",
        "tone": "accent",
        "visual": "bar",
        "barValue": 84,
        "footnote": [
          {
            "label": "",
            "value": "174 / 208",
            "unit": "charts"
          }
        ]
      }
    ],
    "pipelineData": [
      {
        "id": "unallocated",
        "label": "Unallocated",
        "value": 9,
        "percentLabel": "3.2%",
        "trend": {
          "direction": "up"
        },
        "tone": "neutral"
      },
      {
        "id": "open",
        "label": "Open",
        "value": 18,
        "percentLabel": "6.5%",
        "trend": {
          "direction": "up"
        },
        "tone": "accent"
      },
      {
        "id": "in-progress",
        "label": "In Progress",
        "value": 25,
        "percentLabel": "9.3%",
        "trend": {
          "direction": "up"
        },
        "tone": "amber"
      },
      {
        "id": "pending-clarification",
        "label": "Pending Clarification",
        "value": 13,
        "percentLabel": "4.7%",
        "trend": {
          "direction": "down"
        },
        "tone": "darkyellow"
      },
      {
        "id": "qa-review",
        "label": "QA Review",
        "value": 17,
        "percentLabel": "6.1%",
        "trend": {
          "direction": "up"
        },
        "tone": "danger"
      },
      {
        "id": "re-assigned",
        "label": "Re-Assigned",
        "value": 5,
        "percentLabel": "1.7%",
        "trend": {
          "direction": "down"
        },
        "tone": "reassigned"
      },
      {
        "id": "completed",
        "label": "Completed",
        "value": 187,
        "percentLabel": "68.5%",
        "trend": {
          "direction": "up"
        },
        "tone": "success"
      }
    ],
    "dailyThroughputData": [
      {
        "day": "8 AM",
        "date": "2026-09-17",
        "received": 4,
        "completed": 3
      },
      {
        "day": "9 AM",
        "date": "2026-09-17",
        "received": 8,
        "completed": 6
      },
      {
        "day": "10 AM",
        "date": "2026-09-17",
        "received": 16,
        "completed": 13
      },
      {
        "day": "11 AM",
        "date": "2026-09-17",
        "received": 17,
        "completed": 13
      },
      {
        "day": "12 AM",
        "date": "2026-09-17",
        "received": 24,
        "completed": 22
      },
      {
        "day": "1 PM",
        "date": "2026-09-17",
        "received": 14,
        "completed": 12
      },
      {
        "day": "2 PM",
        "date": "2026-09-17",
        "received": 12,
        "completed": 9
      },
      {
        "day": "3 PM",
        "date": "2026-09-17",
        "received": 15,
        "completed": 13
      },
      {
        "day": "4 PM",
        "date": "2026-09-17",
        "received": 25,
        "completed": 23
      },
      {
        "day": "5 PM",
        "date": "2026-09-17",
        "received": 17,
        "completed": 16
      },
      {
        "day": "6 PM",
        "date": "2026-09-17",
        "received": 12,
        "completed": 9
      },
      {
        "day": "7 PM",
        "date": "2026-09-17",
        "received": 10,
        "completed": 8
      }
    ],
    "turnaroundData": [
      {
        "id": "waiting",
        "label": "Waiting to start",
        "days": 1.8,
        "maxDays": 3
      },
      {
        "id": "coding",
        "label": "Coding",
        "days": 2.4,
        "maxDays": 3
      },
      {
        "id": "awaiting-audit",
        "label": "Awaiting audit",
        "days": 1,
        "maxDays": 3
      },
      {
        "id": "in-audit",
        "label": "In audit",
        "days": 1.1,
        "maxDays": 3
      }
    ],
    "turnaroundBottleneck": {
      "label": "Coding",
      "days": "2.4d"
    },
    "slowestChart": {
      "id": "CLT-167823",
      "days": "27d"
    },
    "chartAgingData": [
      {
        "bucket": "0\u20132 days",
        "count": 53,
        "warning": false
      },
      {
        "bucket": "3\u20135 days",
        "count": 37,
        "warning": false
      },
      {
        "bucket": "6\u201310 days",
        "count": 23,
        "warning": false
      },
      {
        "bucket": "11\u201320 days",
        "count": 10,
        "warning": false
      },
      {
        "bucket": "20+ days",
        "count": 7,
        "warning": true
      }
    ],
    "priorityData": [
      {
        "id": "critical",
        "label": "Critical",
        "count": 9,
        "percent": 7.1,
        "color": "var(--color-danger)"
      },
      {
        "id": "high",
        "label": "High",
        "count": 22,
        "percent": 17.5,
        "color": "var(--color-accent)"
      },
      {
        "id": "normal",
        "label": "Normal",
        "count": 79,
        "percent": 62.7,
        "color": "var(--color-amber)"
      },
      {
        "id": "low",
        "label": "Low",
        "count": 16,
        "percent": 12.7,
        "color": "var(--color-ink-muted)"
      }
    ],
    "priorityTotal": 126,
    "teamWorkloadData": [
      {
        "id": "team-a",
        "team": "Team A",
        "assigned": 92,
        "inProgress": 14,
        "completed": 78,
        "backlog": 0,
        "avatarTone": "accent"
      },
      {
        "id": "team-b",
        "team": "Team B",
        "assigned": 69,
        "inProgress": 9,
        "completed": 60,
        "backlog": 0,
        "avatarTone": "amber"
      },
      {
        "id": "team-c",
        "team": "Team C",
        "assigned": 60,
        "inProgress": 8,
        "completed": 50,
        "backlog": 2,
        "avatarTone": "accent"
      },
      {
        "id": "team-d",
        "team": "Team D",
        "assigned": 59,
        "inProgress": 8,
        "completed": 52,
        "backlog": 0,
        "avatarTone": "info"
      }
    ],
    "reassignmentRate": {
      "percent": "2.3%",
      "trend": {
        "direction": "down",
        "label": "0.3 pts vs prev"
      },
      "reassignedCharts": 4,
      "totalCharts": 174
    },
    "insightData": [
      {
        "id": "bottleneck",
        "icon": "clock",
        "label": "Current Bottleneck",
        "value": "Coding",
        "supporting": "2.4d",
        "trend": {
          "direction": "up",
          "label": "18% vs prev"
        },
        "tone": "amber"
      },
      {
        "id": "sla",
        "icon": "shieldCheck",
        "label": "SLA Compliance",
        "value": "94.6%",
        "supporting": "",
        "trend": {
          "direction": "up",
          "label": "2.1 pts vs prev"
        },
        "tone": "accent"
      },
      {
        "id": "avg-daily",
        "icon": "trendingUp",
        "label": "Avg. Hourly Completed",
        "value": "147",
        "supporting": "Charts per hour",
        "trend": {
          "direction": "up",
          "label": "15 vs prev"
        },
        "tone": "success"
      },
      {
        "id": "peak-day",
        "icon": "calendar",
        "label": "Peak Hour",
        "value": "4 PM",
        "supporting": "25 Charts",
        "tone": "info"
      },
      {
        "id": "overdue",
        "icon": "inbox",
        "label": "Overdue Charts",
        "value": "36",
        "supporting": "",
        "trend": {
          "direction": "up",
          "label": "3 vs prev"
        },
        "tone": "alert"
      }
    ]
  },
  "7d": {
    "kpiData": [
      {
        "id": "charts-received",
        "label": "Charts Received",
        "value": "828",
        "trend": {
          "direction": "up",
          "label": "33 this period"
        },
        "sparkline": [
          196,
          58,
          52,
          131,
          137,
          117,
          137
        ],
        "tone": "accent",
        "visual": "sparkline"
      },
      {
        "id": "charts-completed",
        "label": "Charts Completed",
        "value": "732",
        "trend": {
          "direction": "up",
          "label": "84% vs prev"
        },
        "sparkline": [
          166,
          54,
          47,
          126,
          117,
          109,
          113
        ],
        "tone": "amber",
        "visual": "sparkline"
      },
      {
        "id": "open-backlog",
        "label": "Open Backlog",
        "value": "170",
        "trend": {
          "direction": "down",
          "label": "12 vs prev"
        },
        "sparkline": [
          139,
          137,
          144,
          152,
          157,
          163,
          167
        ],
        "tone": "neutral",
        "visual": "sparkline",
        "footnote": [
          {
            "label": "Overdue",
            "value": "49"
          }
        ]
      },
      {
        "id": "in-progress",
        "label": "In Progress",
        "value": "98",
        "trend": {
          "direction": "down",
          "label": "3 vs prev"
        },
        "sparkline": [
          99,
          109,
          111,
          87,
          110,
          96,
          96
        ],
        "tone": "accent",
        "visual": "sparkline"
      },
      {
        "id": "completion-rate",
        "label": "Completion Rate",
        "value": "88.4%",
        "trend": {
          "direction": "up",
          "label": "2.1 pts vs prev"
        },
        "tone": "accent",
        "visual": "donut",
        "donutValue": 88.4
      },
      {
        "id": "sla-compliance",
        "label": "SLA Compliance",
        "value": "93.2%",
        "trend": {
          "direction": "up",
          "label": "2.1 pts vs prev"
        },
        "tone": "success",
        "visual": "none",
        "footnote": [
          {
            "label": "Within SLA",
            "value": "682"
          },
          {
            "label": "Breached",
            "value": "50"
          }
        ]
      },
      {
        "id": "capacity-utilization",
        "label": "Capacity Utilization",
        "value": "85%",
        "tone": "accent",
        "visual": "bar",
        "barValue": 85,
        "footnote": [
          {
            "label": "",
            "value": "828 / 971",
            "unit": "charts"
          }
        ]
      }
    ],
    "pipelineData": [
      {
        "id": "unallocated",
        "label": "Unallocated",
        "value": 32,
        "percentLabel": "3.5%",
        "trend": {
          "direction": "up"
        },
        "tone": "neutral"
      },
      {
        "id": "open",
        "label": "Open",
        "value": 66,
        "percentLabel": "7.3%",
        "trend": {
          "direction": "up"
        },
        "tone": "accent"
      },
      {
        "id": "in-progress",
        "label": "In Progress",
        "value": 84,
        "percentLabel": "9.3%",
        "trend": {
          "direction": "up"
        },
        "tone": "amber"
      },
      {
        "id": "pending-clarification",
        "label": "Pending Clarification",
        "value": 43,
        "percentLabel": "4.7%",
        "trend": {
          "direction": "down"
        },
        "tone": "darkyellow"
      },
      {
        "id": "qa-review",
        "label": "QA Review",
        "value": 51,
        "percentLabel": "5.6%",
        "trend": {
          "direction": "up"
        },
        "tone": "danger"
      },
      {
        "id": "re-assigned",
        "label": "Re-Assigned",
        "value": 20,
        "percentLabel": "2.2%",
        "trend": {
          "direction": "down"
        },
        "tone": "reassigned"
      },
      {
        "id": "completed",
        "label": "Completed",
        "value": 607,
        "percentLabel": "67.3%",
        "trend": {
          "direction": "up"
        },
        "tone": "success"
      }
    ],
    "dailyThroughputData": [
      {
        "day": "Fri",
        "date": "Sep 11",
        "received": 196,
        "completed": 166
      },
      {
        "day": "Sat",
        "date": "Sep 12",
        "received": 58,
        "completed": 54
      },
      {
        "day": "Sun",
        "date": "Sep 13",
        "received": 52,
        "completed": 47
      },
      {
        "day": "Mon",
        "date": "Sep 14",
        "received": 131,
        "completed": 126
      },
      {
        "day": "Tue",
        "date": "Sep 15",
        "received": 137,
        "completed": 117
      },
      {
        "day": "Wed",
        "date": "Sep 16",
        "received": 117,
        "completed": 109
      },
      {
        "day": "Thu",
        "date": "Sep 17",
        "received": 137,
        "completed": 113
      }
    ],
    "turnaroundData": [
      {
        "id": "waiting",
        "label": "Waiting to start",
        "days": 1.6,
        "maxDays": 3
      },
      {
        "id": "coding",
        "label": "Coding",
        "days": 2.4,
        "maxDays": 3
      },
      {
        "id": "awaiting-audit",
        "label": "Awaiting audit",
        "days": 0.9,
        "maxDays": 3
      },
      {
        "id": "in-audit",
        "label": "In audit",
        "days": 1.3,
        "maxDays": 3
      }
    ],
    "turnaroundBottleneck": {
      "label": "Coding",
      "days": "2.4d"
    },
    "slowestChart": {
      "id": "CLT-315913",
      "days": "21d"
    },
    "chartAgingData": [
      {
        "bucket": "0\u20132 days",
        "count": 80,
        "warning": false
      },
      {
        "bucket": "3\u20135 days",
        "count": 41,
        "warning": false
      },
      {
        "bucket": "6\u201310 days",
        "count": 24,
        "warning": false
      },
      {
        "bucket": "11\u201320 days",
        "count": 15,
        "warning": false
      },
      {
        "bucket": "20+ days",
        "count": 8,
        "warning": true
      }
    ],
    "priorityData": [
      {
        "id": "critical",
        "label": "Critical",
        "count": 11,
        "percent": 6.5,
        "color": "var(--color-danger)"
      },
      {
        "id": "high",
        "label": "High",
        "count": 30,
        "percent": 17.6,
        "color": "var(--color-accent)"
      },
      {
        "id": "normal",
        "label": "Normal",
        "count": 107,
        "percent": 62.9,
        "color": "var(--color-amber)"
      },
      {
        "id": "low",
        "label": "Low",
        "count": 22,
        "percent": 12.9,
        "color": "var(--color-ink-muted)"
      }
    ],
    "priorityTotal": 170,
    "teamWorkloadData": [
      {
        "id": "team-a",
        "team": "Team A",
        "assigned": 280,
        "inProgress": 36,
        "completed": 238,
        "backlog": 6,
        "avatarTone": "accent"
      },
      {
        "id": "team-b",
        "team": "Team B",
        "assigned": 226,
        "inProgress": 33,
        "completed": 198,
        "backlog": 0,
        "avatarTone": "amber"
      },
      {
        "id": "team-c",
        "team": "Team C",
        "assigned": 199,
        "inProgress": 24,
        "completed": 174,
        "backlog": 1,
        "avatarTone": "accent"
      },
      {
        "id": "team-d",
        "team": "Team D",
        "assigned": 171,
        "inProgress": 19,
        "completed": 140,
        "backlog": 12,
        "avatarTone": "info"
      }
    ],
    "reassignmentRate": {
      "percent": "2.4%",
      "trend": {
        "direction": "down",
        "label": "0.2 pts vs prev"
      },
      "reassignedCharts": 20,
      "totalCharts": 828
    },
    "insightData": [
      {
        "id": "bottleneck",
        "icon": "clock",
        "label": "Current Bottleneck",
        "value": "Coding",
        "supporting": "2.4d",
        "trend": {
          "direction": "up",
          "label": "18% vs prev"
        },
        "tone": "amber"
      },
      {
        "id": "sla",
        "icon": "shieldCheck",
        "label": "SLA Compliance",
        "value": "93.2%",
        "supporting": "",
        "trend": {
          "direction": "up",
          "label": "2.1 pts vs prev"
        },
        "tone": "accent"
      },
      {
        "id": "avg-daily",
        "icon": "trendingUp",
        "label": "Avg. Daily Completed",
        "value": "105",
        "supporting": "Charts per day",
        "trend": {
          "direction": "up",
          "label": "11 vs prev"
        },
        "tone": "success"
      },
      {
        "id": "peak-day",
        "icon": "calendar",
        "label": "Peak Day",
        "value": "Fri Sep 11",
        "supporting": "196 Charts",
        "tone": "info"
      },
      {
        "id": "overdue",
        "icon": "inbox",
        "label": "Overdue Charts",
        "value": "49",
        "supporting": "",
        "trend": {
          "direction": "up",
          "label": "4 vs prev"
        },
        "tone": "alert"
      }
    ]
  },
  "30d": {
    "kpiData": [
      {
        "id": "charts-received",
        "label": "Charts Received",
        "value": "3,713",
        "trend": {
          "direction": "up",
          "label": "149 this period"
        },
        "sparkline": [
          118,
          167,
          190,
          67,
          53,
          149,
          147,
          146,
          144,
          153,
          79,
          48,
          153,
          139,
          159,
          136,
          169,
          70,
          51,
          158,
          124,
          138,
          145,
          145,
          67,
          45,
          147,
          150,
          122,
          134
        ],
        "tone": "accent",
        "visual": "sparkline"
      },
      {
        "id": "charts-completed",
        "label": "Charts Completed",
        "value": "3,295",
        "trend": {
          "direction": "up",
          "label": "85% vs prev"
        },
        "sparkline": [
          103,
          147,
          178,
          60,
          46,
          116,
          135,
          129,
          131,
          148,
          72,
          38,
          131,
          126,
          151,
          131,
          150,
          64,
          44,
          140,
          120,
          113,
          129,
          125,
          64,
          44,
          115,
          127,
          112,
          106
        ],
        "tone": "amber",
        "visual": "sparkline"
      },
      {
        "id": "open-backlog",
        "label": "Open Backlog",
        "value": "505",
        "trend": {
          "direction": "down",
          "label": "35 vs prev"
        },
        "sparkline": [
          397,
          407,
          420,
          414,
          422,
          423,
          426,
          433,
          422,
          442,
          444,
          436,
          435,
          453,
          455,
          461,
          445,
          451,
          462,
          468,
          464,
          475,
          466,
          485,
          466,
          486,
          480,
          497,
          484,
          500
        ],
        "tone": "neutral",
        "visual": "sparkline",
        "footnote": [
          {
            "label": "Overdue",
            "value": "128"
          }
        ]
      },
      {
        "id": "in-progress",
        "label": "In Progress",
        "value": "340",
        "trend": {
          "direction": "down",
          "label": "10 vs prev"
        },
        "sparkline": [
          310,
          289,
          310,
          352,
          353,
          301,
          338,
          295,
          348,
          357,
          303,
          381,
          382,
          345,
          365,
          382,
          295,
          345,
          325,
          297,
          338,
          331,
          322,
          327,
          353,
          390,
          365,
          316,
          297,
          325
        ],
        "tone": "accent",
        "visual": "sparkline"
      },
      {
        "id": "completion-rate",
        "label": "Completion Rate",
        "value": "88.7%",
        "trend": {
          "direction": "up",
          "label": "2.1 pts vs prev"
        },
        "tone": "accent",
        "visual": "donut",
        "donutValue": 88.7
      },
      {
        "id": "sla-compliance",
        "label": "SLA Compliance",
        "value": "94.1%",
        "trend": {
          "direction": "up",
          "label": "2.1 pts vs prev"
        },
        "tone": "success",
        "visual": "none",
        "footnote": [
          {
            "label": "Within SLA",
            "value": "3,101"
          },
          {
            "label": "Breached",
            "value": "194"
          }
        ]
      },
      {
        "id": "capacity-utilization",
        "label": "Capacity Utilization",
        "value": "83%",
        "tone": "accent",
        "visual": "bar",
        "barValue": 83,
        "footnote": [
          {
            "label": "",
            "value": "3,713 / 4,497",
            "unit": "charts"
          }
        ]
      }
    ],
    "pipelineData": [
      {
        "id": "unallocated",
        "label": "Unallocated",
        "value": 121,
        "percentLabel": "3.2%",
        "trend": {
          "direction": "up"
        },
        "tone": "neutral"
      },
      {
        "id": "open",
        "label": "Open",
        "value": 284,
        "percentLabel": "7.5%",
        "trend": {
          "direction": "up"
        },
        "tone": "accent"
      },
      {
        "id": "in-progress",
        "label": "In Progress",
        "value": 379,
        "percentLabel": "10.0%",
        "trend": {
          "direction": "up"
        },
        "tone": "amber"
      },
      {
        "id": "pending-clarification",
        "label": "Pending Clarification",
        "value": 176,
        "percentLabel": "4.6%",
        "trend": {
          "direction": "down"
        },
        "tone": "darkyellow"
      },
      {
        "id": "qa-review",
        "label": "QA Review",
        "value": 223,
        "percentLabel": "5.9%",
        "trend": {
          "direction": "up"
        },
        "tone": "danger"
      },
      {
        "id": "re-assigned",
        "label": "Re-Assigned",
        "value": 74,
        "percentLabel": "2.0%",
        "trend": {
          "direction": "down"
        },
        "tone": "reassigned"
      },
      {
        "id": "completed",
        "label": "Completed",
        "value": 2543,
        "percentLabel": "66.9%",
        "trend": {
          "direction": "up"
        },
        "tone": "success"
      }
    ],
    "dailyThroughputData": [
      {
        "day": "Wed",
        "date": "Aug 19",
        "received": 118,
        "completed": 103
      },
      {
        "day": "Thu",
        "date": "Aug 20",
        "received": 167,
        "completed": 147
      },
      {
        "day": "Fri",
        "date": "Aug 21",
        "received": 190,
        "completed": 178
      },
      {
        "day": "Sat",
        "date": "Aug 22",
        "received": 67,
        "completed": 60
      },
      {
        "day": "Sun",
        "date": "Aug 23",
        "received": 53,
        "completed": 46
      },
      {
        "day": "Mon",
        "date": "Aug 24",
        "received": 149,
        "completed": 116
      },
      {
        "day": "Tue",
        "date": "Aug 25",
        "received": 147,
        "completed": 135
      },
      {
        "day": "Wed",
        "date": "Aug 26",
        "received": 146,
        "completed": 129
      },
      {
        "day": "Thu",
        "date": "Aug 27",
        "received": 144,
        "completed": 131
      },
      {
        "day": "Fri",
        "date": "Aug 28",
        "received": 153,
        "completed": 148
      },
      {
        "day": "Sat",
        "date": "Aug 29",
        "received": 79,
        "completed": 72
      },
      {
        "day": "Sun",
        "date": "Aug 30",
        "received": 48,
        "completed": 38
      },
      {
        "day": "Mon",
        "date": "Aug 31",
        "received": 153,
        "completed": 131
      },
      {
        "day": "Tue",
        "date": "Sep 01",
        "received": 139,
        "completed": 126
      },
      {
        "day": "Wed",
        "date": "Sep 02",
        "received": 159,
        "completed": 151
      },
      {
        "day": "Thu",
        "date": "Sep 03",
        "received": 136,
        "completed": 131
      },
      {
        "day": "Fri",
        "date": "Sep 04",
        "received": 169,
        "completed": 150
      },
      {
        "day": "Sat",
        "date": "Sep 05",
        "received": 70,
        "completed": 64
      },
      {
        "day": "Sun",
        "date": "Sep 06",
        "received": 51,
        "completed": 44
      },
      {
        "day": "Mon",
        "date": "Sep 07",
        "received": 158,
        "completed": 140
      },
      {
        "day": "Tue",
        "date": "Sep 08",
        "received": 124,
        "completed": 120
      },
      {
        "day": "Wed",
        "date": "Sep 09",
        "received": 138,
        "completed": 113
      },
      {
        "day": "Thu",
        "date": "Sep 10",
        "received": 145,
        "completed": 129
      },
      {
        "day": "Fri",
        "date": "Sep 11",
        "received": 145,
        "completed": 125
      },
      {
        "day": "Sat",
        "date": "Sep 12",
        "received": 67,
        "completed": 64
      },
      {
        "day": "Sun",
        "date": "Sep 13",
        "received": 45,
        "completed": 44
      },
      {
        "day": "Mon",
        "date": "Sep 14",
        "received": 147,
        "completed": 115
      },
      {
        "day": "Tue",
        "date": "Sep 15",
        "received": 150,
        "completed": 127
      },
      {
        "day": "Wed",
        "date": "Sep 16",
        "received": 122,
        "completed": 112
      },
      {
        "day": "Thu",
        "date": "Sep 17",
        "received": 134,
        "completed": 106
      }
    ],
    "turnaroundData": [
      {
        "id": "waiting",
        "label": "Waiting to start",
        "days": 1.8,
        "maxDays": 3
      },
      {
        "id": "coding",
        "label": "Coding",
        "days": 2.2,
        "maxDays": 3
      },
      {
        "id": "awaiting-audit",
        "label": "Awaiting audit",
        "days": 0.9,
        "maxDays": 3
      },
      {
        "id": "in-audit",
        "label": "In audit",
        "days": 1.3,
        "maxDays": 3
      }
    ],
    "turnaroundBottleneck": {
      "label": "Coding",
      "days": "2.2d"
    },
    "slowestChart": {
      "id": "CLT-524881",
      "days": "17d"
    },
    "chartAgingData": [
      {
        "bucket": "0\u20132 days",
        "count": 229,
        "warning": false
      },
      {
        "bucket": "3\u20135 days",
        "count": 134,
        "warning": false
      },
      {
        "bucket": "6\u201310 days",
        "count": 71,
        "warning": false
      },
      {
        "bucket": "11\u201320 days",
        "count": 41,
        "warning": false
      },
      {
        "bucket": "20+ days",
        "count": 24,
        "warning": true
      }
    ],
    "priorityData": [
      {
        "id": "critical",
        "label": "Critical",
        "count": 35,
        "percent": 6.9,
        "color": "var(--color-danger)"
      },
      {
        "id": "high",
        "label": "High",
        "count": 98,
        "percent": 19.4,
        "color": "var(--color-accent)"
      },
      {
        "id": "normal",
        "label": "Normal",
        "count": 309,
        "percent": 61.2,
        "color": "var(--color-amber)"
      },
      {
        "id": "low",
        "label": "Low",
        "count": 63,
        "percent": 12.5,
        "color": "var(--color-ink-muted)"
      }
    ],
    "priorityTotal": 505,
    "teamWorkloadData": [
      {
        "id": "team-a",
        "team": "Team A",
        "assigned": 1085,
        "inProgress": 154,
        "completed": 896,
        "backlog": 35,
        "avatarTone": "accent"
      },
      {
        "id": "team-b",
        "team": "Team B",
        "assigned": 1065,
        "inProgress": 136,
        "completed": 934,
        "backlog": 0,
        "avatarTone": "amber"
      },
      {
        "id": "team-c",
        "team": "Team C",
        "assigned": 828,
        "inProgress": 130,
        "completed": 680,
        "backlog": 18,
        "avatarTone": "accent"
      },
      {
        "id": "team-d",
        "team": "Team D",
        "assigned": 806,
        "inProgress": 123,
        "completed": 674,
        "backlog": 9,
        "avatarTone": "info"
      }
    ],
    "reassignmentRate": {
      "percent": "2.3%",
      "trend": {
        "direction": "down",
        "label": "0.5 pts vs prev"
      },
      "reassignedCharts": 86,
      "totalCharts": 3713
    },
    "insightData": [
      {
        "id": "bottleneck",
        "icon": "clock",
        "label": "Current Bottleneck",
        "value": "Coding",
        "supporting": "2.2d",
        "trend": {
          "direction": "up",
          "label": "18% vs prev"
        },
        "tone": "amber"
      },
      {
        "id": "sla",
        "icon": "shieldCheck",
        "label": "SLA Compliance",
        "value": "94.1%",
        "supporting": "",
        "trend": {
          "direction": "up",
          "label": "2.1 pts vs prev"
        },
        "tone": "accent"
      },
      {
        "id": "avg-daily",
        "icon": "trendingUp",
        "label": "Avg. Daily Completed",
        "value": "110",
        "supporting": "Charts per day",
        "trend": {
          "direction": "up",
          "label": "11 vs prev"
        },
        "tone": "success"
      },
      {
        "id": "peak-day",
        "icon": "calendar",
        "label": "Peak Day",
        "value": "Fri Aug 21",
        "supporting": "190 Charts",
        "tone": "info"
      },
      {
        "id": "overdue",
        "icon": "inbox",
        "label": "Overdue Charts",
        "value": "128",
        "supporting": "",
        "trend": {
          "direction": "up",
          "label": "10 vs prev"
        },
        "tone": "alert"
      }
    ]
  },
  "month": {
    "kpiData": [
      {
        "id": "charts-received",
        "label": "Charts Received",
        "value": "2,192",
        "trend": {
          "direction": "up",
          "label": "88 this period"
        },
        "sparkline": [
          168,
          130,
          137,
          157,
          72,
          47,
          141,
          167,
          134,
          158,
          191,
          71,
          53,
          140,
          167,
          120,
          139
        ],
        "tone": "accent",
        "visual": "sparkline"
      },
      {
        "id": "charts-completed",
        "label": "Charts Completed",
        "value": "1,963",
        "trend": {
          "direction": "up",
          "label": "86% vs prev"
        },
        "sparkline": [
          160,
          120,
          118,
          132,
          66,
          40,
          136,
          159,
          109,
          148,
          166,
          61,
          47,
          128,
          131,
          106,
          136
        ],
        "tone": "amber",
        "visual": "sparkline"
      },
      {
        "id": "open-backlog",
        "label": "Open Backlog",
        "value": "318",
        "trend": {
          "direction": "down",
          "label": "22 vs prev"
        },
        "sparkline": [
          259,
          254,
          252,
          266,
          274,
          275,
          276,
          281,
          284,
          279,
          287,
          288,
          301,
          307,
          310,
          299,
          313
        ],
        "tone": "neutral",
        "visual": "sparkline",
        "footnote": [
          {
            "label": "Overdue",
            "value": "79"
          }
        ]
      },
      {
        "id": "in-progress",
        "label": "In Progress",
        "value": "211",
        "trend": {
          "direction": "down",
          "label": "6 vs prev"
        },
        "sparkline": [
          185,
          231,
          194,
          213,
          199,
          198,
          197,
          236,
          238,
          203,
          241,
          196,
          186,
          218,
          201,
          234,
          205
        ],
        "tone": "accent",
        "visual": "sparkline"
      },
      {
        "id": "completion-rate",
        "label": "Completion Rate",
        "value": "89.6%",
        "trend": {
          "direction": "up",
          "label": "2.1 pts vs prev"
        },
        "tone": "accent",
        "visual": "donut",
        "donutValue": 89.6
      },
      {
        "id": "sla-compliance",
        "label": "SLA Compliance",
        "value": "95.4%",
        "trend": {
          "direction": "up",
          "label": "2.1 pts vs prev"
        },
        "tone": "success",
        "visual": "none",
        "footnote": [
          {
            "label": "Within SLA",
            "value": "1,872"
          },
          {
            "label": "Breached",
            "value": "91"
          }
        ]
      },
      {
        "id": "capacity-utilization",
        "label": "Capacity Utilization",
        "value": "85%",
        "tone": "accent",
        "visual": "bar",
        "barValue": 85,
        "footnote": [
          {
            "label": "",
            "value": "2,192 / 2,586",
            "unit": "charts"
          }
        ]
      }
    ],
    "pipelineData": [
      {
        "id": "unallocated",
        "label": "Unallocated",
        "value": 68,
        "percentLabel": "3.0%",
        "trend": {
          "direction": "up"
        },
        "tone": "neutral"
      },
      {
        "id": "open",
        "label": "Open",
        "value": 166,
        "percentLabel": "7.3%",
        "trend": {
          "direction": "up"
        },
        "tone": "accent"
      },
      {
        "id": "in-progress",
        "label": "In Progress",
        "value": 241,
        "percentLabel": "10.6%",
        "trend": {
          "direction": "up"
        },
        "tone": "amber"
      },
      {
        "id": "pending-clarification",
        "label": "Pending Clarification",
        "value": 102,
        "percentLabel": "4.5%",
        "trend": {
          "direction": "down"
        },
        "tone": "darkyellow"
      },
      {
        "id": "qa-review",
        "label": "QA Review",
        "value": 148,
        "percentLabel": "6.5%",
        "trend": {
          "direction": "up"
        },
        "tone": "danger"
      },
      {
        "id": "re-assigned",
        "label": "Re-Assigned",
        "value": 48,
        "percentLabel": "2.1%",
        "trend": {
          "direction": "down"
        },
        "tone": "reassigned"
      },
      {
        "id": "completed",
        "label": "Completed",
        "value": 1507,
        "percentLabel": "66.1%",
        "trend": {
          "direction": "up"
        },
        "tone": "success"
      }
    ],
    "dailyThroughputData": [
      {
        "day": "Tue",
        "date": "Sep 01",
        "received": 168,
        "completed": 160
      },
      {
        "day": "Wed",
        "date": "Sep 02",
        "received": 130,
        "completed": 120
      },
      {
        "day": "Thu",
        "date": "Sep 03",
        "received": 137,
        "completed": 118
      },
      {
        "day": "Fri",
        "date": "Sep 04",
        "received": 157,
        "completed": 132
      },
      {
        "day": "Sat",
        "date": "Sep 05",
        "received": 72,
        "completed": 66
      },
      {
        "day": "Sun",
        "date": "Sep 06",
        "received": 47,
        "completed": 40
      },
      {
        "day": "Mon",
        "date": "Sep 07",
        "received": 141,
        "completed": 136
      },
      {
        "day": "Tue",
        "date": "Sep 08",
        "received": 167,
        "completed": 159
      },
      {
        "day": "Wed",
        "date": "Sep 09",
        "received": 134,
        "completed": 109
      },
      {
        "day": "Thu",
        "date": "Sep 10",
        "received": 158,
        "completed": 148
      },
      {
        "day": "Fri",
        "date": "Sep 11",
        "received": 191,
        "completed": 166
      },
      {
        "day": "Sat",
        "date": "Sep 12",
        "received": 71,
        "completed": 61
      },
      {
        "day": "Sun",
        "date": "Sep 13",
        "received": 53,
        "completed": 47
      },
      {
        "day": "Mon",
        "date": "Sep 14",
        "received": 140,
        "completed": 128
      },
      {
        "day": "Tue",
        "date": "Sep 15",
        "received": 167,
        "completed": 131
      },
      {
        "day": "Wed",
        "date": "Sep 16",
        "received": 120,
        "completed": 106
      },
      {
        "day": "Thu",
        "date": "Sep 17",
        "received": 139,
        "completed": 136
      }
    ],
    "turnaroundData": [
      {
        "id": "waiting",
        "label": "Waiting to start",
        "days": 2,
        "maxDays": 3
      },
      {
        "id": "coding",
        "label": "Coding",
        "days": 2.6,
        "maxDays": 3
      },
      {
        "id": "awaiting-audit",
        "label": "Awaiting audit",
        "days": 0.8,
        "maxDays": 3
      },
      {
        "id": "in-audit",
        "label": "In audit",
        "days": 1.3,
        "maxDays": 3
      }
    ],
    "turnaroundBottleneck": {
      "label": "Coding",
      "days": "2.6d"
    },
    "slowestChart": {
      "id": "CLT-991337",
      "days": "26d"
    },
    "chartAgingData": [
      {
        "bucket": "0\u20132 days",
        "count": 137,
        "warning": false
      },
      {
        "bucket": "3\u20135 days",
        "count": 88,
        "warning": false
      },
      {
        "bucket": "6\u201310 days",
        "count": 46,
        "warning": false
      },
      {
        "bucket": "11\u201320 days",
        "count": 31,
        "warning": false
      },
      {
        "bucket": "20+ days",
        "count": 16,
        "warning": true
      }
    ],
    "priorityData": [
      {
        "id": "critical",
        "label": "Critical",
        "count": 20,
        "percent": 6.3,
        "color": "var(--color-danger)"
      },
      {
        "id": "high",
        "label": "High",
        "count": 60,
        "percent": 18.9,
        "color": "var(--color-accent)"
      },
      {
        "id": "normal",
        "label": "Normal",
        "count": 196,
        "percent": 61.6,
        "color": "var(--color-amber)"
      },
      {
        "id": "low",
        "label": "Low",
        "count": 42,
        "percent": 13.2,
        "color": "var(--color-ink-muted)"
      }
    ],
    "priorityTotal": 318,
    "teamWorkloadData": [
      {
        "id": "team-a",
        "team": "Team A",
        "assigned": 707,
        "inProgress": 101,
        "completed": 603,
        "backlog": 3,
        "avatarTone": "accent"
      },
      {
        "id": "team-b",
        "team": "Team B",
        "assigned": 597,
        "inProgress": 93,
        "completed": 525,
        "backlog": 0,
        "avatarTone": "amber"
      },
      {
        "id": "team-c",
        "team": "Team C",
        "assigned": 526,
        "inProgress": 59,
        "completed": 444,
        "backlog": 23,
        "avatarTone": "accent"
      },
      {
        "id": "team-d",
        "team": "Team D",
        "assigned": 484,
        "inProgress": 59,
        "completed": 409,
        "backlog": 16,
        "avatarTone": "info"
      }
    ],
    "reassignmentRate": {
      "percent": "1.6%",
      "trend": {
        "direction": "down",
        "label": "0.5 pts vs prev"
      },
      "reassignedCharts": 36,
      "totalCharts": 2192
    },
    "insightData": [
      {
        "id": "bottleneck",
        "icon": "clock",
        "label": "Current Bottleneck",
        "value": "Coding",
        "supporting": "2.6d",
        "trend": {
          "direction": "up",
          "label": "18% vs prev"
        },
        "tone": "amber"
      },
      {
        "id": "sla",
        "icon": "shieldCheck",
        "label": "SLA Compliance",
        "value": "95.4%",
        "supporting": "",
        "trend": {
          "direction": "up",
          "label": "2.1 pts vs prev"
        },
        "tone": "accent"
      },
      {
        "id": "avg-daily",
        "icon": "trendingUp",
        "label": "Avg. Daily Completed",
        "value": "115",
        "supporting": "Charts per day",
        "trend": {
          "direction": "up",
          "label": "12 vs prev"
        },
        "tone": "success"
      },
      {
        "id": "peak-day",
        "icon": "calendar",
        "label": "Peak Day",
        "value": "Fri Sep 11",
        "supporting": "191 Charts",
        "tone": "info"
      },
      {
        "id": "overdue",
        "icon": "inbox",
        "label": "Overdue Charts",
        "value": "79",
        "supporting": "",
        "trend": {
          "direction": "up",
          "label": "6 vs prev"
        },
        "tone": "alert"
      }
    ]
  }
};

/**
 * Returns the snapshot for a date filter.
 *
 * Preset filters ("today" / "7d" / "30d" / "month") use the hand-written static
 * snapshots above, which are already aligned to the current date.
 *
 * A custom range is no longer silently swapped for the 30-day snapshot -- that
 * was the bug behind "I filtered Jun 1 - Jun 25 and Daily Throughput still
 * shows Aug/Sep". It is now generated for the days that were actually picked,
 * with every card on the tab derived from the same generated series.
 */
const PERIOD_LABEL: Record<"day" | "week" | "month", string> = {
  day: "Daily",
  week: "Weekly",
  month: "Monthly",
};
const PERIOD_NOUN: Record<"day" | "week" | "month", string> = {
  day: "day",
  week: "week",
  month: "month",
};

/**
 * The "Avg ... Completed" insight card used to always read "Avg. Daily
 * Completed" and divide by the number of days in the window, even for the 7d
 * and 30d presets — so 7d showed a daily rate and 30d showed the same daily
 * rate again, instead of a weekly total and a monthly total respectively.
 * This recomputes the card from the snapshot's own throughput series (so it
 * always matches what the chart is plotting) and relabels it for the period
 * that filter actually represents: today -> per day, 7d -> per week,
 * 30d/month -> per month.
 */
function withPeriodAveragedInsight(snapshot: OperationsSnapshot, filter: DateFilterKey): OperationsSnapshot {
  const period = averagePeriodFor(filter);
  const total = snapshot.dailyThroughputData.reduce((sum, point) => sum + point.completed, 0);

  const insightData = snapshot.insightData.map((card) => {
    if (card.id !== "avg-daily") return card;

    // Preserve the seeded trend's proportion rather than inventing a new
    // "previous" total: scale its delta by how much the headline value moved.
    const priorValue = Number(card.value.replace(/[^0-9.-]/g, "")) || total || 1;
    const priorDelta = Number(card.trend?.label.replace(/[^0-9.-]/g, "")) || 0;
    const scaledDelta = Math.round(priorDelta * (total / priorValue));

    return {
      ...card,
      label: `Avg. ${PERIOD_LABEL[period]} Completed`,
      value: formatNumber(total),
      supporting: `Charts per ${PERIOD_NOUN[period]}`,
      trend: card.trend
        ? { direction: card.trend.direction, label: `${formatNumber(Math.abs(scaledDelta))} vs prev` }
        : card.trend,
    };
  });

  return { ...snapshot, insightData };
}

export function buildOperationsSnapshot(filter: DateFilterKey, customRange?: CustomRange): OperationsSnapshot {
  if (filter === "today" || filter === "7d" || filter === "30d" || filter === "month") {
    return withPeriodAveragedInsight(operationsSnapshots[filter], filter);
  }

  const window = resolveDateWindow(filter, customRange);

  // A single-day custom range behaves like "Today": show the hourly profile,
  // relabelled to the picked day.
  if (window.days === 1) {
    const iso = toISODate(window.start);
    const today = operationsSnapshots["today"];
    return {
      ...today,
      throughputGranularity: "hour",
      dailyThroughputData: today.dailyThroughputData.map((point) => ({ ...point, date: iso })),
    };
  }

  return buildWindowedOperationsSnapshot(window, operationsSnapshots["30d"]);
}


// ---------------------------------------------------------------------------
// Quality performance data
// ---------------------------------------------------------------------------

/** Static mock audit records shown in the "Quality by Specialty" table. */
export const auditRecords: AuditRecord[] = [
  {
    "id": "AUD-001",
    "specialty": "Cardiology",
    "chartsAudited": 240,
    "passed": 231,
    "failed": 9,
    "rejected": 2,
    "reworked": 13,
    "pending": 17,
    "firstPassAccuracy": 92.5,
    "passRate": 96.2,
    "reworkRate": 5.3,
    "auditTimeDays": 1.3,
    "reasonBreakdown": {
      "Incorrect code": 4,
      "Missing documentation": 2,
      "Modifier error": 2,
      "Documentation mismatch": 1,
      "Other": 0
    }
  },
  {
    "id": "AUD-002",
    "specialty": "Orthopedics",
    "chartsAudited": 180,
    "passed": 171,
    "failed": 11,
    "rejected": 2,
    "reworked": 14,
    "pending": 13,
    "firstPassAccuracy": 90,
    "passRate": 94.8,
    "reworkRate": 7.8,
    "auditTimeDays": 1.3,
    "reasonBreakdown": {
      "Incorrect code": 5,
      "Missing documentation": 3,
      "Modifier error": 2,
      "Documentation mismatch": 1,
      "Other": 0
    }
  },
  {
    "id": "AUD-003",
    "specialty": "Oncology",
    "chartsAudited": 150,
    "passed": 146,
    "failed": 5,
    "rejected": 1,
    "reworked": 6,
    "pending": 11,
    "firstPassAccuracy": 94.7,
    "passRate": 97.1,
    "reworkRate": 4.1,
    "auditTimeDays": 1.3,
    "reasonBreakdown": {
      "Incorrect code": 2,
      "Missing documentation": 1,
      "Modifier error": 1,
      "Documentation mismatch": 1,
      "Other": 0
    }
  },
  {
    "id": "AUD-004",
    "specialty": "Neurology",
    "chartsAudited": 130,
    "passed": 119,
    "failed": 14,
    "rejected": 3,
    "reworked": 12,
    "pending": 9,
    "firstPassAccuracy": 87.5,
    "passRate": 91.6,
    "reworkRate": 9.2,
    "auditTimeDays": 1.3,
    "reasonBreakdown": {
      "Incorrect code": 6,
      "Missing documentation": 3,
      "Modifier error": 3,
      "Documentation mismatch": 1,
      "Other": 1
    }
  },
  {
    "id": "AUD-005",
    "specialty": "General Medicine",
    "chartsAudited": 220,
    "passed": 211,
    "failed": 8,
    "rejected": 2,
    "reworked": 13,
    "pending": 16,
    "firstPassAccuracy": 92.7,
    "passRate": 95.8,
    "reworkRate": 6,
    "auditTimeDays": 1.3,
    "reasonBreakdown": {
      "Incorrect code": 4,
      "Missing documentation": 2,
      "Modifier error": 1,
      "Documentation mismatch": 1,
      "Other": 0
    }
  },
  {
    "id": "AUD-006",
    "specialty": "Other",
    "chartsAudited": 284,
    "passed": 256,
    "failed": 37,
    "rejected": 9,
    "reworked": 24,
    "pending": 20,
    "firstPassAccuracy": 92.1,
    "passRate": 90.1,
    "reworkRate": 8.4,
    "auditTimeDays": 1.3,
    "reasonBreakdown": {
      "Incorrect code": 17,
      "Missing documentation": 9,
      "Modifier error": 6,
      "Documentation mismatch": 3,
      "Other": 2
    }
  }
];

export function buildInitialAuditRecords(): AuditRecord[] {
  return auditRecords;
}

/** Static mock coder roster used for accuracy distribution and top performers. */
export const coders: CoderRecord[] = [
  {
    "id": "COD-001",
    "name": "Disha Patel",
    "specialty": "Cardiology",
    "passRate": 98.6,
    "firstPassAccuracy": 95.2,
    "reworkRate": 2.1,
    "trend": [
      96,
      96.1,
      97,
      97.5,
      97.1,
      97.3,
      97.1,
      97.5
    ]
  },
  {
    "id": "COD-002",
    "name": "Nikhil Mehta",
    "specialty": "Oncology",
    "passRate": 97.8,
    "firstPassAccuracy": 94.1,
    "reworkRate": 2.6,
    "trend": [
      95.7,
      95.9,
      95.6,
      96.5,
      97.2,
      97,
      96.6,
      96.8
    ]
  },
  {
    "id": "COD-003",
    "name": "Zainab Ansari",
    "specialty": "General Medicine",
    "passRate": 97.1,
    "firstPassAccuracy": 93.3,
    "reworkRate": 3,
    "trend": [
      94.7,
      95.1,
      94.3,
      94.4,
      95.3,
      94.6,
      95,
      94.3
    ]
  },
  {
    "id": "COD-004",
    "name": "Rahul Nair",
    "specialty": "Orthopedics",
    "passRate": 96.4,
    "firstPassAccuracy": 92,
    "reworkRate": 3.4,
    "trend": [
      93.1,
      92.5,
      92,
      92.8,
      93.1,
      92.3,
      91.9,
      92.7
    ]
  },
  {
    "id": "COD-005",
    "name": "Meena Menon",
    "specialty": "Neurology",
    "passRate": 95.9,
    "firstPassAccuracy": 91.6,
    "reworkRate": 3.7,
    "trend": [
      93.1,
      93.9,
      93.7,
      93.8,
      93.1,
      92.4,
      92.7,
      93.1
    ]
  },
  {
    "id": "COD-006",
    "name": "Neha Chatterjee",
    "specialty": "Orthopedics",
    "passRate": 62.5,
    "firstPassAccuracy": 58.7,
    "reworkRate": 7.9,
    "trend": [
      60.4,
      60.6,
      60.2,
      60,
      59.8,
      59.1,
      59.7,
      60.2
    ]
  },
  {
    "id": "COD-007",
    "name": "Manish Kapoor",
    "specialty": "Oncology",
    "passRate": 69.7,
    "firstPassAccuracy": 65.3,
    "reworkRate": 6.9,
    "trend": [
      67.8,
      67.3,
      66.7,
      65.9,
      65.8,
      66,
      66.4,
      67.4
    ]
  },
  {
    "id": "COD-008",
    "name": "Karan Chatterjee",
    "specialty": "Neurology",
    "passRate": 74.7,
    "firstPassAccuracy": 70.8,
    "reworkRate": 7.6,
    "trend": [
      71.3,
      71.5,
      72.3,
      71.8,
      73,
      73.3,
      74.3,
      74.4
    ]
  },
  {
    "id": "COD-009",
    "name": "Karan Kapoor",
    "specialty": "General Medicine",
    "passRate": 78.9,
    "firstPassAccuracy": 75.7,
    "reworkRate": 6.6,
    "trend": [
      76.8,
      77.4,
      78.6,
      79.5,
      79.6,
      79.9,
      79.7,
      79.1
    ]
  },
  {
    "id": "COD-010",
    "name": "Aisha Mehta",
    "specialty": "Cardiology",
    "passRate": 80,
    "firstPassAccuracy": 76.9,
    "reworkRate": 6.7,
    "trend": [
      77.2,
      78,
      77.5,
      78.6,
      78.2,
      78.8,
      79.4,
      79
    ]
  },
  {
    "id": "COD-011",
    "name": "Aditya Menon",
    "specialty": "Orthopedics",
    "passRate": 86.9,
    "firstPassAccuracy": 84.1,
    "reworkRate": 5.7,
    "trend": [
      84.4,
      85.3,
      85.2,
      86,
      86,
      85.4,
      86.3,
      86.3
    ]
  },
  {
    "id": "COD-012",
    "name": "Varun Bhat",
    "specialty": "Oncology",
    "passRate": 84.1,
    "firstPassAccuracy": 80.1,
    "reworkRate": 6.1,
    "trend": [
      80.7,
      81.1,
      81.3,
      80.9,
      80.2,
      80.8,
      81.4,
      81.2
    ]
  },
  {
    "id": "COD-013",
    "name": "Arjun Desai",
    "specialty": "Neurology",
    "passRate": 85.9,
    "firstPassAccuracy": 82.7,
    "reworkRate": 4.9,
    "trend": [
      83.2,
      84.4,
      83.9,
      83.5,
      83.8,
      83.6,
      83.6,
      83.7
    ]
  },
  {
    "id": "COD-014",
    "name": "Aditya Malhotra",
    "specialty": "General Medicine",
    "passRate": 88,
    "firstPassAccuracy": 84.1,
    "reworkRate": 5.3,
    "trend": [
      84.9,
      85,
      85.5,
      85.8,
      86.1,
      85.8,
      85.7,
      85.5
    ]
  },
  {
    "id": "COD-015",
    "name": "Sneha Bose",
    "specialty": "Cardiology",
    "passRate": 95.4,
    "firstPassAccuracy": 91.6,
    "reworkRate": 4.3,
    "trend": [
      92.2,
      91.7,
      91.5,
      90.8,
      91.1,
      90.8,
      90.9,
      90.9
    ]
  },
  {
    "id": "COD-016",
    "name": "Meena Nair",
    "specialty": "Orthopedics",
    "passRate": 97.8,
    "firstPassAccuracy": 93.5,
    "reworkRate": 4.9,
    "trend": [
      95.7,
      96,
      96.9,
      97.9,
      98,
      97.4,
      97.9,
      98.7
    ]
  },
  {
    "id": "COD-017",
    "name": "Preeti Gupta",
    "specialty": "Oncology",
    "passRate": 94.3,
    "firstPassAccuracy": 91,
    "reworkRate": 4.8,
    "trend": [
      92.2,
      93.1,
      93.8,
      93.1,
      92.4,
      92,
      92.2,
      92.7
    ]
  },
  {
    "id": "COD-018",
    "name": "Nikhil Joshi",
    "specialty": "Neurology",
    "passRate": 98.2,
    "firstPassAccuracy": 93.7,
    "reworkRate": 4.9,
    "trend": [
      96.1,
      96.5,
      96.4,
      96.5,
      97.5,
      98,
      97.9,
      99
    ]
  },
  {
    "id": "COD-019",
    "name": "Vikram Iyer",
    "specialty": "General Medicine",
    "passRate": 96.3,
    "firstPassAccuracy": 93.1,
    "reworkRate": 5,
    "trend": [
      92.5,
      91.9,
      92.4,
      93.1,
      94.2,
      95.1,
      95.3,
      95.9
    ]
  },
  {
    "id": "COD-020",
    "name": "Priya Sharma",
    "specialty": "Cardiology",
    "passRate": 93.7,
    "firstPassAccuracy": 90.7,
    "reworkRate": 4.2,
    "trend": [
      90.8,
      91.1,
      91.8,
      92.5,
      93.3,
      92.9,
      93.4,
      93.7
    ]
  },
  {
    "id": "COD-021",
    "name": "Rahul Reddy",
    "specialty": "Orthopedics",
    "passRate": 95.6,
    "firstPassAccuracy": 92.2,
    "reworkRate": 4.5,
    "trend": [
      92.4,
      91.9,
      92.1,
      91.9,
      92.1,
      92.4,
      92.9,
      93
    ]
  },
  {
    "id": "COD-022",
    "name": "Manish Mehta",
    "specialty": "Oncology",
    "passRate": 93.2,
    "firstPassAccuracy": 90.7,
    "reworkRate": 4.2,
    "trend": [
      91.1,
      91.2,
      91.4,
      90.8,
      91.6,
      91,
      90.9,
      90.6
    ]
  },
  {
    "id": "COD-023",
    "name": "Manish Pillai",
    "specialty": "Neurology",
    "passRate": 97,
    "firstPassAccuracy": 93.4,
    "reworkRate": 3.9,
    "trend": [
      94.5,
      95.3,
      95.6,
      96.4,
      96.7,
      96.2,
      95.6,
      95
    ]
  },
  {
    "id": "COD-024",
    "name": "Farhan Verma",
    "specialty": "General Medicine",
    "passRate": 93.3,
    "firstPassAccuracy": 90.3,
    "reworkRate": 5.1,
    "trend": [
      91.5,
      90.7,
      90.7,
      90.6,
      90.3,
      91.2,
      91.5,
      91.1
    ]
  },
  {
    "id": "COD-025",
    "name": "Divya Malhotra",
    "specialty": "Cardiology",
    "passRate": 99,
    "firstPassAccuracy": 94.6,
    "reworkRate": 4,
    "trend": [
      97.1,
      97.6,
      98,
      98.8,
      98.6,
      98.8,
      99.5,
      99.8
    ]
  },
  {
    "id": "COD-026",
    "name": "Preeti Desai",
    "specialty": "Orthopedics",
    "passRate": 97,
    "firstPassAccuracy": 93.4,
    "reworkRate": 4.5,
    "trend": [
      94.7,
      94.6,
      95,
      95.5,
      96.5,
      96.5,
      97.4,
      97.2
    ]
  },
  {
    "id": "COD-027",
    "name": "Divya Joshi",
    "specialty": "Oncology",
    "passRate": 97.6,
    "firstPassAccuracy": 94.3,
    "reworkRate": 4.1,
    "trend": [
      95,
      96,
      96.6,
      96.1,
      95.8,
      97,
      97.1,
      96.9
    ]
  },
  {
    "id": "COD-028",
    "name": "Isha Nair",
    "specialty": "Neurology",
    "passRate": 97.1,
    "firstPassAccuracy": 93.1,
    "reworkRate": 4.9,
    "trend": [
      95,
      96,
      96.3,
      96.4,
      95.8,
      96,
      97,
      97.5
    ]
  },
  {
    "id": "COD-029",
    "name": "Isha Rao",
    "specialty": "General Medicine",
    "passRate": 95.5,
    "firstPassAccuracy": 92.1,
    "reworkRate": 4.8,
    "trend": [
      91.8,
      91.3,
      90.7,
      90.2,
      90.1,
      91,
      91.8,
      92.4
    ]
  },
  {
    "id": "COD-030",
    "name": "Isha Sharma",
    "specialty": "Cardiology",
    "passRate": 93,
    "firstPassAccuracy": 90.4,
    "reworkRate": 4.5,
    "trend": [
      90.9,
      91.4,
      92.4,
      93.4,
      93.2,
      92.6,
      93.1,
      92.8
    ]
  },
  {
    "id": "COD-031",
    "name": "Sanjay Verma",
    "specialty": "Orthopedics",
    "passRate": 95.5,
    "firstPassAccuracy": 92.4,
    "reworkRate": 4.2,
    "trend": [
      91.9,
      92.7,
      93.3,
      94.3,
      93.7,
      93,
      92.3,
      92.2
    ]
  },
  {
    "id": "COD-032",
    "name": "Riya Joshi",
    "specialty": "Oncology",
    "passRate": 94.2,
    "firstPassAccuracy": 91.2,
    "reworkRate": 5.5,
    "trend": [
      91.1,
      91.6,
      90.8,
      91.5,
      92.3,
      92.3,
      91.9,
      92.6
    ]
  },
  {
    "id": "COD-033",
    "name": "Tanvi Kapoor",
    "specialty": "Neurology",
    "passRate": 95.3,
    "firstPassAccuracy": 92.5,
    "reworkRate": 3.9,
    "trend": [
      93.2,
      94,
      94.2,
      95.3,
      94.9,
      94.4,
      94.7,
      95.2
    ]
  },
  {
    "id": "COD-034",
    "name": "Vikram Bose",
    "specialty": "General Medicine",
    "passRate": 95,
    "firstPassAccuracy": 91,
    "reworkRate": 4.4,
    "trend": [
      92.4,
      92.7,
      92.3,
      93.4,
      93.6,
      94.3,
      93.6,
      94.7
    ]
  },
  {
    "id": "COD-035",
    "name": "Kabir Sharma",
    "specialty": "Cardiology",
    "passRate": 95.9,
    "firstPassAccuracy": 92.8,
    "reworkRate": 3.9,
    "trend": [
      93.8,
      93.9,
      93.5,
      94,
      94.2,
      93.8,
      94.7,
      94.1
    ]
  },
  {
    "id": "COD-036",
    "name": "Sanjay Rao",
    "specialty": "Orthopedics",
    "passRate": 95.2,
    "firstPassAccuracy": 90.7,
    "reworkRate": 4.3,
    "trend": [
      92.6,
      92.8,
      93.4,
      92.9,
      94,
      94.9,
      94.8,
      94.4
    ]
  },
  {
    "id": "COD-037",
    "name": "Sanjay Sharma",
    "specialty": "Oncology",
    "passRate": 96.5,
    "firstPassAccuracy": 92.5,
    "reworkRate": 4.5,
    "trend": [
      93.7,
      93,
      93.9,
      93.8,
      93.9,
      93.6,
      93.8,
      93.1
    ]
  },
  {
    "id": "COD-038",
    "name": "Kabir Bose",
    "specialty": "Neurology",
    "passRate": 95.9,
    "firstPassAccuracy": 93.3,
    "reworkRate": 5.1,
    "trend": [
      93.7,
      93,
      93.4,
      93.7,
      93.9,
      94.1,
      94.2,
      94.3
    ]
  },
  {
    "id": "COD-039",
    "name": "Aarav Bose",
    "specialty": "General Medicine",
    "passRate": 95.3,
    "firstPassAccuracy": 92.8,
    "reworkRate": 4.9,
    "trend": [
      91.9,
      91.8,
      92.5,
      93.5,
      93.3,
      93.7,
      94.7,
      94.8
    ]
  },
  {
    "id": "COD-040",
    "name": "Meena Gupta",
    "specialty": "Cardiology",
    "passRate": 93.8,
    "firstPassAccuracy": 90.2,
    "reworkRate": 4.8,
    "trend": [
      91.5,
      91,
      91.6,
      92,
      93.1,
      93.9,
      94.1,
      93.3
    ]
  },
  {
    "id": "COD-041",
    "name": "Sanjay Bose",
    "specialty": "Orthopedics",
    "passRate": 97.1,
    "firstPassAccuracy": 94.5,
    "reworkRate": 4.4,
    "trend": [
      94.4,
      94.8,
      95.7,
      96.3,
      97.4,
      98.6,
      99.7,
      100
    ]
  },
  {
    "id": "COD-042",
    "name": "Rohan Desai",
    "specialty": "Oncology",
    "passRate": 98.8,
    "firstPassAccuracy": 94.7,
    "reworkRate": 3.8,
    "trend": [
      95.1,
      95.3,
      96.2,
      96.8,
      97.5,
      97.4,
      98.2,
      98.4
    ]
  },
  {
    "id": "COD-043",
    "name": "Isha Mehta",
    "specialty": "Neurology",
    "passRate": 98.3,
    "firstPassAccuracy": 94.5,
    "reworkRate": 4,
    "trend": [
      94.8,
      94.5,
      94.9,
      94.8,
      95.3,
      96.5,
      96.5,
      97.3
    ]
  },
  {
    "id": "COD-044",
    "name": "Varun Sharma",
    "specialty": "General Medicine",
    "passRate": 96.1,
    "firstPassAccuracy": 93.6,
    "reworkRate": 4.7,
    "trend": [
      93.5,
      94.5,
      94.6,
      94.6,
      95.5,
      95.9,
      95.8,
      95.9
    ]
  },
  {
    "id": "COD-045",
    "name": "Riya Mehta",
    "specialty": "Cardiology",
    "passRate": 99.8,
    "firstPassAccuracy": 97.4,
    "reworkRate": 3.5,
    "trend": [
      97.3,
      98.1,
      98.1,
      98.5,
      99.4,
      99.4,
      99.8,
      99.3
    ]
  },
  {
    "id": "COD-046",
    "name": "Isha Verma",
    "specialty": "Orthopedics",
    "passRate": 99.8,
    "firstPassAccuracy": 99.4,
    "reworkRate": 4.1,
    "trend": [
      97.1,
      97.6,
      98.5,
      99.3,
      98.5,
      97.8,
      97.2,
      98.2
    ]
  },
  {
    "id": "COD-047",
    "name": "Priya Chatterjee",
    "specialty": "Oncology",
    "passRate": 97.6,
    "firstPassAccuracy": 95,
    "reworkRate": 4.3,
    "trend": [
      95.1,
      94.3,
      94.3,
      95.1,
      95,
      94.6,
      95.3,
      95.8
    ]
  },
  {
    "id": "COD-048",
    "name": "Simran Verma",
    "specialty": "Neurology",
    "passRate": 99,
    "firstPassAccuracy": 95.2,
    "reworkRate": 4.4,
    "trend": [
      96,
      96.4,
      96.4,
      96.8,
      96.4,
      95.9,
      96.5,
      97.1
    ]
  },
  {
    "id": "COD-049",
    "name": "Rahul Verma",
    "specialty": "General Medicine",
    "passRate": 99.8,
    "firstPassAccuracy": 96.3,
    "reworkRate": 4.8,
    "trend": [
      96.7,
      97.2,
      98.4,
      99.3,
      99.9,
      99.8,
      100,
      100
    ]
  },
  {
    "id": "COD-050",
    "name": "Neha Desai",
    "specialty": "Cardiology",
    "passRate": 99.8,
    "firstPassAccuracy": 99.1,
    "reworkRate": 3.3,
    "trend": [
      97,
      98.2,
      97.4,
      97.9,
      98.3,
      99.5,
      99.2,
      100
    ]
  },
  {
    "id": "COD-051",
    "name": "Divya Iyer",
    "specialty": "Orthopedics",
    "passRate": 99.8,
    "firstPassAccuracy": 96,
    "reworkRate": 3.9,
    "trend": [
      96.4,
      96.2,
      97.3,
      97.8,
      97.6,
      97.8,
      97.7,
      97.8
    ]
  },
  {
    "id": "COD-052",
    "name": "Zainab Rao",
    "specialty": "Oncology",
    "passRate": 99.4,
    "firstPassAccuracy": 95.8,
    "reworkRate": 4.8,
    "trend": [
      97.4,
      97.8,
      98.7,
      98.7,
      99.2,
      99.3,
      99.7,
      100
    ]
  },
  {
    "id": "COD-053",
    "name": "Aarav Chatterjee",
    "specialty": "Neurology",
    "passRate": 99.8,
    "firstPassAccuracy": 97.8,
    "reworkRate": 3.5,
    "trend": [
      96.8,
      96.6,
      95.9,
      95.3,
      95.8,
      95.6,
      94.9,
      95
    ]
  },
  {
    "id": "COD-054",
    "name": "Arjun Sharma",
    "specialty": "General Medicine",
    "passRate": 99.8,
    "firstPassAccuracy": 98.1,
    "reworkRate": 4.3,
    "trend": [
      97.2,
      97.1,
      97,
      97.5,
      97.6,
      98.4,
      97.8,
      97.4
    ]
  },
  {
    "id": "COD-055",
    "name": "Manish Gupta",
    "specialty": "Cardiology",
    "passRate": 99.8,
    "firstPassAccuracy": 96.6,
    "reworkRate": 4.7,
    "trend": [
      96.3,
      96.9,
      97.3,
      98,
      99.1,
      99.1,
      99,
      98.6
    ]
  },
  {
    "id": "COD-056",
    "name": "Priya Malhotra",
    "specialty": "Orthopedics",
    "passRate": 99.8,
    "firstPassAccuracy": 99.1,
    "reworkRate": 3.4,
    "trend": [
      96.2,
      96.5,
      96.7,
      97.1,
      98.3,
      98.5,
      99.1,
      99.3
    ]
  },
  {
    "id": "COD-057",
    "name": "Arjun Bhat",
    "specialty": "Oncology",
    "passRate": 99.8,
    "firstPassAccuracy": 99.1,
    "reworkRate": 3.2,
    "trend": [
      96.8,
      97.4,
      97.7,
      97.7,
      97.6,
      97.5,
      97.4,
      97.9
    ]
  },
  {
    "id": "COD-058",
    "name": "Riya Gupta",
    "specialty": "Neurology",
    "passRate": 99.8,
    "firstPassAccuracy": 98.9,
    "reworkRate": 3.5,
    "trend": [
      97,
      97.7,
      98,
      98.1,
      99.2,
      98.9,
      98.9,
      98.2
    ]
  },
  {
    "id": "COD-059",
    "name": "Aditya Pillai",
    "specialty": "General Medicine",
    "passRate": 98.3,
    "firstPassAccuracy": 95.7,
    "reworkRate": 3.7,
    "trend": [
      95.6,
      95.7,
      95.6,
      96.8,
      97.5,
      97.5,
      97.4,
      98.1
    ]
  },
  {
    "id": "COD-060",
    "name": "Ananya Joshi",
    "specialty": "Cardiology",
    "passRate": 99.8,
    "firstPassAccuracy": 96.3,
    "reworkRate": 3.8,
    "trend": [
      96.8,
      96.2,
      97.3,
      96.6,
      97.3,
      97.6,
      97,
      97.4
    ]
  },
  {
    "id": "COD-061",
    "name": "Meena Kapoor",
    "specialty": "Orthopedics",
    "passRate": 99.8,
    "firstPassAccuracy": 98.9,
    "reworkRate": 4.4,
    "trend": [
      96,
      96,
      95.3,
      95.3,
      95.5,
      95.5,
      94.7,
      95.8
    ]
  },
  {
    "id": "COD-062",
    "name": "Tanvi Desai",
    "specialty": "Oncology",
    "passRate": 99.8,
    "firstPassAccuracy": 98.4,
    "reworkRate": 3.4,
    "trend": [
      97.7,
      98.7,
      98.4,
      99,
      99.2,
      100,
      99.7,
      98.9
    ]
  },
  {
    "id": "COD-063",
    "name": "Arjun Ansari",
    "specialty": "Neurology",
    "passRate": 99.8,
    "firstPassAccuracy": 98.8,
    "reworkRate": 4.5,
    "trend": [
      96,
      97.1,
      97.7,
      98.1,
      97.5,
      98,
      98.6,
      99.4
    ]
  },
  {
    "id": "COD-064",
    "name": "Rohan Sharma",
    "specialty": "General Medicine",
    "passRate": 99.3,
    "firstPassAccuracy": 95.1,
    "reworkRate": 3.9,
    "trend": [
      97.3,
      98.5,
      98.8,
      98.4,
      97.7,
      98.5,
      97.8,
      98.8
    ]
  },
  {
    "id": "COD-065",
    "name": "Tanvi Ansari",
    "specialty": "Cardiology",
    "passRate": 99.8,
    "firstPassAccuracy": 96.5,
    "reworkRate": 4.8,
    "trend": [
      96.7,
      96.5,
      95.8,
      96.3,
      96.6,
      97,
      97.5,
      97.9
    ]
  },
  {
    "id": "COD-066",
    "name": "Nikhil Kapoor",
    "specialty": "Orthopedics",
    "passRate": 99.6,
    "firstPassAccuracy": 95.3,
    "reworkRate": 4.5,
    "trend": [
      97.4,
      97.1,
      97.1,
      96.5,
      97.6,
      97.2,
      96.9,
      97.3
    ]
  },
  {
    "id": "COD-067",
    "name": "Rahul Iyer",
    "specialty": "Oncology",
    "passRate": 99.8,
    "firstPassAccuracy": 97.7,
    "reworkRate": 3.9,
    "trend": [
      96.9,
      97.5,
      96.9,
      97.3,
      97.8,
      98.3,
      99.3,
      100
    ]
  },
  {
    "id": "COD-068",
    "name": "Meena Bose",
    "specialty": "Neurology",
    "passRate": 99.8,
    "firstPassAccuracy": 97.2,
    "reworkRate": 3.5,
    "trend": [
      96.8,
      96.4,
      97.5,
      98.6,
      98.7,
      99.7,
      100,
      100
    ]
  },
  {
    "id": "COD-069",
    "name": "Sanjay Pillai",
    "specialty": "General Medicine",
    "passRate": 99.8,
    "firstPassAccuracy": 97.2,
    "reworkRate": 3.7,
    "trend": [
      96.7,
      97.3,
      97.2,
      98.4,
      97.7,
      98.8,
      99.5,
      99.6
    ]
  },
  {
    "id": "COD-070",
    "name": "Karan Menon",
    "specialty": "Cardiology",
    "passRate": 99.3,
    "firstPassAccuracy": 96.3,
    "reworkRate": 4,
    "trend": [
      95.6,
      96.2,
      95.7,
      95.4,
      94.7,
      95.5,
      94.9,
      95.5
    ]
  },
  {
    "id": "COD-071",
    "name": "Zainab Verma",
    "specialty": "Orthopedics",
    "passRate": 99.8,
    "firstPassAccuracy": 97.5,
    "reworkRate": 3.8,
    "trend": [
      96.6,
      97.4,
      98.3,
      99,
      99.5,
      99.7,
      99.6,
      100
    ]
  },
  {
    "id": "COD-072",
    "name": "Rahul Sharma",
    "specialty": "Oncology",
    "passRate": 99.8,
    "firstPassAccuracy": 99.4,
    "reworkRate": 3.7,
    "trend": [
      97.4,
      97.3,
      96.8,
      97.3,
      98.1,
      98.4,
      99.6,
      100
    ]
  },
  {
    "id": "COD-073",
    "name": "Pooja Malhotra",
    "specialty": "Neurology",
    "passRate": 99.8,
    "firstPassAccuracy": 99.1,
    "reworkRate": 3.9,
    "trend": [
      96.5,
      95.8,
      96.2,
      95.5,
      94.9,
      95.6,
      95.1,
      94.8
    ]
  },
  {
    "id": "COD-074",
    "name": "Sanjay Chatterjee",
    "specialty": "General Medicine",
    "passRate": 99.1,
    "firstPassAccuracy": 95.8,
    "reworkRate": 4.9,
    "trend": [
      97,
      97.8,
      97.6,
      98.4,
      98.3,
      98.1,
      97.4,
      98
    ]
  },
  {
    "id": "COD-075",
    "name": "Kavya Khan",
    "specialty": "Cardiology",
    "passRate": 99.8,
    "firstPassAccuracy": 98.4,
    "reworkRate": 3.9,
    "trend": [
      97.3,
      97,
      98,
      98.8,
      99.3,
      99.7,
      99.9,
      100
    ]
  },
  {
    "id": "COD-076",
    "name": "Rohan Malhotra",
    "specialty": "Orthopedics",
    "passRate": 99.8,
    "firstPassAccuracy": 96.8,
    "reworkRate": 4.6,
    "trend": [
      97.4,
      98.3,
      98,
      97.4,
      98.3,
      98.3,
      98.6,
      99.6
    ]
  },
  {
    "id": "COD-077",
    "name": "Manish Desai",
    "specialty": "Oncology",
    "passRate": 99.8,
    "firstPassAccuracy": 96.8,
    "reworkRate": 4.2,
    "trend": [
      97.1,
      97.4,
      97,
      96.4,
      97.3,
      97.1,
      96.9,
      98.1
    ]
  },
  {
    "id": "COD-078",
    "name": "Arjun Menon",
    "specialty": "Neurology",
    "passRate": 99.8,
    "firstPassAccuracy": 98,
    "reworkRate": 3.7,
    "trend": [
      97.8,
      99,
      99.5,
      99.4,
      100,
      99.7,
      100,
      100
    ]
  },
  {
    "id": "COD-079",
    "name": "Sanjay Gupta",
    "specialty": "General Medicine",
    "passRate": 99.8,
    "firstPassAccuracy": 97.7,
    "reworkRate": 4,
    "trend": [
      97.3,
      97,
      97.5,
      98.3,
      98.8,
      98.3,
      98.1,
      97.7
    ]
  },
  {
    "id": "COD-080",
    "name": "Aarav Gupta",
    "specialty": "Cardiology",
    "passRate": 99.8,
    "firstPassAccuracy": 98.9,
    "reworkRate": 3.9,
    "trend": [
      96.1,
      96.9,
      97.1,
      96.7,
      97.2,
      97.5,
      97.8,
      98.6
    ]
  },
  {
    "id": "COD-081",
    "name": "Yash Pillai",
    "specialty": "Orthopedics",
    "passRate": 99.8,
    "firstPassAccuracy": 99.4,
    "reworkRate": 3.1,
    "trend": [
      97,
      96.4,
      96.2,
      95.8,
      96.6,
      96.8,
      96.2,
      96
    ]
  },
  {
    "id": "COD-082",
    "name": "Simran Bhat",
    "specialty": "Oncology",
    "passRate": 99.8,
    "firstPassAccuracy": 97.8,
    "reworkRate": 4.3,
    "trend": [
      97.4,
      98.3,
      98.2,
      97.8,
      97.2,
      97.4,
      97.8,
      97.6
    ]
  },
  {
    "id": "COD-083",
    "name": "Preeti Menon",
    "specialty": "Neurology",
    "passRate": 99.8,
    "firstPassAccuracy": 99.4,
    "reworkRate": 4.2,
    "trend": [
      97.6,
      96.9,
      96.7,
      97,
      97.4,
      98.6,
      99.4,
      100
    ]
  },
  {
    "id": "COD-084",
    "name": "Simran Khan",
    "specialty": "General Medicine",
    "passRate": 99.8,
    "firstPassAccuracy": 98.7,
    "reworkRate": 4.3,
    "trend": [
      97.8,
      97.8,
      98.1,
      97.4,
      97.3,
      96.9,
      97.6,
      97.2
    ]
  },
  {
    "id": "COD-085",
    "name": "Karan Patel",
    "specialty": "Cardiology",
    "passRate": 99.8,
    "firstPassAccuracy": 98,
    "reworkRate": 4.4,
    "trend": [
      96.3,
      95.9,
      97,
      98.1,
      98,
      97.8,
      98.8,
      99.5
    ]
  },
  {
    "id": "COD-086",
    "name": "Riya Malhotra",
    "specialty": "Orthopedics",
    "passRate": 99.2,
    "firstPassAccuracy": 96,
    "reworkRate": 3.7,
    "trend": [
      96.8,
      97.6,
      98.5,
      99.1,
      99.7,
      99.4,
      99.1,
      99.1
    ]
  },
  {
    "id": "COD-087",
    "name": "Amit Joshi",
    "specialty": "Oncology",
    "passRate": 99.8,
    "firstPassAccuracy": 96,
    "reworkRate": 3.7,
    "trend": [
      96.7,
      97.7,
      98.8,
      99.4,
      99,
      98.6,
      98.8,
      99.8
    ]
  }
];

export function buildInitialCoders(): CoderRecord[] {
  return coders;
}

/** Static mock daily audit metrics (Jul 29 - Sep 10, 2026). */
export const dailyMetrics: DailyMetric[] = [
  {
    "date": "2026-07-29",
    "label": "Jul 29",
    "chartsAudited": 26,
    "firstPassAccuracy": 67.8,
    "passRate": 76,
    "category": "well-below"
  },
  {
    "date": "2026-07-30",
    "label": "Jul 30",
    "chartsAudited": 32,
    "firstPassAccuracy": 66.2,
    "passRate": 75.2,
    "category": "well-below"
  },
  {
    "date": "2026-07-31",
    "label": "Jul 31",
    "chartsAudited": 32,
    "firstPassAccuracy": 66.6,
    "passRate": 76.5,
    "category": "well-below"
  },
  {
    "date": "2026-08-01",
    "label": "Aug 1",
    "chartsAudited": 14,
    "firstPassAccuracy": 73.1,
    "passRate": 81.3,
    "category": "well-below"
  },
  {
    "date": "2026-08-02",
    "label": "Aug 2",
    "chartsAudited": 9,
    "firstPassAccuracy": 72.1,
    "passRate": 81.4,
    "category": "well-below"
  },
  {
    "date": "2026-08-03",
    "label": "Aug 3",
    "chartsAudited": 28,
    "firstPassAccuracy": 74.1,
    "passRate": 81.8,
    "category": "well-below"
  },
  {
    "date": "2026-08-04",
    "label": "Aug 4",
    "chartsAudited": 37,
    "firstPassAccuracy": 73.9,
    "passRate": 82.5,
    "category": "well-below"
  },
  {
    "date": "2026-08-05",
    "label": "Aug 5",
    "chartsAudited": 31,
    "firstPassAccuracy": 75,
    "passRate": 84,
    "category": "well-below"
  },
  {
    "date": "2026-08-06",
    "label": "Aug 6",
    "chartsAudited": 35,
    "firstPassAccuracy": 75.4,
    "passRate": 83.6,
    "category": "well-below"
  },
  {
    "date": "2026-08-07",
    "label": "Aug 7",
    "chartsAudited": 33,
    "firstPassAccuracy": 75.2,
    "passRate": 82.4,
    "category": "well-below"
  },
  {
    "date": "2026-08-08",
    "label": "Aug 8",
    "chartsAudited": 16,
    "firstPassAccuracy": 76.5,
    "passRate": 83.4,
    "category": "well-below"
  },
  {
    "date": "2026-08-09",
    "label": "Aug 9",
    "chartsAudited": 11,
    "firstPassAccuracy": 77.8,
    "passRate": 83.8,
    "category": "well-below"
  },
  {
    "date": "2026-08-10",
    "label": "Aug 10",
    "chartsAudited": 34,
    "firstPassAccuracy": 75.5,
    "passRate": 81.6,
    "category": "well-below"
  },
  {
    "date": "2026-08-11",
    "label": "Aug 11",
    "chartsAudited": 32,
    "firstPassAccuracy": 71.1,
    "passRate": 80.9,
    "category": "well-below"
  },
  {
    "date": "2026-08-12",
    "label": "Aug 12",
    "chartsAudited": 31,
    "firstPassAccuracy": 72.7,
    "passRate": 82,
    "category": "well-below"
  },
  {
    "date": "2026-08-13",
    "label": "Aug 13",
    "chartsAudited": 32,
    "firstPassAccuracy": 74.3,
    "passRate": 82.8,
    "category": "well-below"
  },
  {
    "date": "2026-08-14",
    "label": "Aug 14",
    "chartsAudited": 30,
    "firstPassAccuracy": 75.4,
    "passRate": 81.5,
    "category": "well-below"
  },
  {
    "date": "2026-08-15",
    "label": "Aug 15",
    "chartsAudited": 16,
    "firstPassAccuracy": 71.4,
    "passRate": 79.9,
    "category": "well-below"
  },
  {
    "date": "2026-08-16",
    "label": "Aug 16",
    "chartsAudited": 10,
    "firstPassAccuracy": 71.9,
    "passRate": 80.3,
    "category": "well-below"
  },
  {
    "date": "2026-08-17",
    "label": "Aug 17",
    "chartsAudited": 29,
    "firstPassAccuracy": 70.8,
    "passRate": 79.7,
    "category": "well-below"
  },
  {
    "date": "2026-08-18",
    "label": "Aug 18",
    "chartsAudited": 35,
    "firstPassAccuracy": 70.4,
    "passRate": 80.4,
    "category": "well-below"
  },
  {
    "date": "2026-08-19",
    "label": "Aug 19",
    "chartsAudited": 31,
    "firstPassAccuracy": 72.9,
    "passRate": 80,
    "category": "well-below"
  },
  {
    "date": "2026-08-20",
    "label": "Aug 20",
    "chartsAudited": 31,
    "firstPassAccuracy": 70.7,
    "passRate": 80.6,
    "category": "well-below"
  },
  {
    "date": "2026-08-21",
    "label": "Aug 21",
    "chartsAudited": 35,
    "firstPassAccuracy": 76.2,
    "passRate": 84.8,
    "category": "well-below"
  },
  {
    "date": "2026-08-22",
    "label": "Aug 22",
    "chartsAudited": 16,
    "firstPassAccuracy": 74.1,
    "passRate": 83.3,
    "category": "well-below"
  },
  {
    "date": "2026-08-23",
    "label": "Aug 23",
    "chartsAudited": 11,
    "firstPassAccuracy": 78.7,
    "passRate": 87.2,
    "category": "well-below"
  },
  {
    "date": "2026-08-24",
    "label": "Aug 24",
    "chartsAudited": 35,
    "firstPassAccuracy": 76.6,
    "passRate": 85.9,
    "category": "well-below"
  },
  {
    "date": "2026-08-25",
    "label": "Aug 25",
    "chartsAudited": 36,
    "firstPassAccuracy": 80.5,
    "passRate": 87.1,
    "category": "well-below"
  },
  {
    "date": "2026-08-26",
    "label": "Aug 26",
    "chartsAudited": 37,
    "firstPassAccuracy": 80,
    "passRate": 90,
    "category": "slightly-below"
  },
  {
    "date": "2026-08-27",
    "label": "Aug 27",
    "chartsAudited": 31,
    "firstPassAccuracy": 80,
    "passRate": 88,
    "category": "well-below"
  },
  {
    "date": "2026-08-28",
    "label": "Aug 28",
    "chartsAudited": 34,
    "firstPassAccuracy": 79.7,
    "passRate": 88,
    "category": "well-below"
  },
  {
    "date": "2026-08-29",
    "label": "Aug 29",
    "chartsAudited": 15,
    "firstPassAccuracy": 81.9,
    "passRate": 88.5,
    "category": "well-below"
  },
  {
    "date": "2026-08-30",
    "label": "Aug 30",
    "chartsAudited": 12,
    "firstPassAccuracy": 81.2,
    "passRate": 88.8,
    "category": "well-below"
  },
  {
    "date": "2026-08-31",
    "label": "Aug 31",
    "chartsAudited": 36,
    "firstPassAccuracy": 78.6,
    "passRate": 85.4,
    "category": "well-below"
  },
  {
    "date": "2026-09-01",
    "label": "Sep 1",
    "chartsAudited": 37,
    "firstPassAccuracy": 78.9,
    "passRate": 88.2,
    "category": "well-below"
  },
  {
    "date": "2026-09-02",
    "label": "Sep 2",
    "chartsAudited": 33,
    "firstPassAccuracy": 76.6,
    "passRate": 86,
    "category": "well-below"
  },
  {
    "date": "2026-09-03",
    "label": "Sep 3",
    "chartsAudited": 40,
    "firstPassAccuracy": 78.5,
    "passRate": 87.4,
    "category": "well-below"
  },
  {
    "date": "2026-09-04",
    "label": "Sep 4",
    "chartsAudited": 38,
    "firstPassAccuracy": 80.2,
    "passRate": 88.8,
    "category": "well-below"
  },
  {
    "date": "2026-09-05",
    "label": "Sep 5",
    "chartsAudited": 14,
    "firstPassAccuracy": 80.2,
    "passRate": 90.2,
    "category": "slightly-below"
  },
  {
    "date": "2026-09-06",
    "label": "Sep 6",
    "chartsAudited": 12,
    "firstPassAccuracy": 84.1,
    "passRate": 92.5,
    "category": "slightly-below"
  },
  {
    "date": "2026-09-07",
    "label": "Sep 7",
    "chartsAudited": 70,
    "firstPassAccuracy": 83.5,
    "passRate": 92.4,
    "category": "slightly-below"
  },
  {
    "date": "2026-09-08",
    "label": "Sep 8",
    "chartsAudited": 88,
    "firstPassAccuracy": 84.9,
    "passRate": 94.7,
    "category": "slightly-below"
  },
  {
    "date": "2026-09-09",
    "label": "Sep 9",
    "chartsAudited": 104,
    "firstPassAccuracy": 86.2,
    "passRate": 94.2,
    "category": "slightly-below"
  },
  {
    "date": "2026-09-10",
    "label": "Sep 10",
    "chartsAudited": 150,
    "firstPassAccuracy": 80,
    "passRate": 88.9,
    "category": "well-below"
  }
];

export function buildInitialDailyMetrics(): DailyMetric[] {
  return dailyMetrics;
}

/** Static mock weekly throughput (Mon Sep 7 - Sun Sep 13, 2026). */
export const weeklyThroughput: WeekdayThroughput[] = [
  {
    "day": "Mon",
    "chartsAudited": 55,
    "pendingQueue": 36,
    "passRate": 94,
    "date": "2026-09-07",
    "label": "Sep 7"
  },
  {
    "day": "Tue",
    "chartsAudited": 65,
    "pendingQueue": 42,
    "passRate": 93.5,
    "date": "2026-09-08",
    "label": "Sep 8"
  },
  {
    "day": "Wed",
    "chartsAudited": 75,
    "pendingQueue": 49,
    "passRate": 95,
    "date": "2026-09-09",
    "label": "Sep 9"
  },
  {
    "day": "Thu",
    "chartsAudited": 120,
    "pendingQueue": 80,
    "passRate": 97.1,
    "date": "2026-09-10",
    "label": "Sep 10"
  },
  {
    "day": "Fri",
    "chartsAudited": 60,
    "pendingQueue": 39,
    "passRate": 92,
    "date": "2026-09-11",
    "label": "Sep 11"
  },
  {
    "day": "Sat",
    "chartsAudited": 30,
    "pendingQueue": 20,
    "passRate": 90,
    "date": "2026-09-12",
    "label": "Sep 12"
  },
  {
    "day": "Sun",
    "chartsAudited": 22,
    "pendingQueue": 14,
    "passRate": 88,
    "date": "2026-09-13",
    "label": "Sep 13"
  }
];

export function buildWeeklyThroughput(): WeekdayThroughput[] {
  return weeklyThroughput;
}

/** Static mock snapshot of the current audit queue. */
export const currentQueue: CurrentQueueSnapshot = {
  "charts": 74,
  "turnaroundDays": 1.1
};

export function buildCurrentQueue(): CurrentQueueSnapshot {
  return currentQueue;
}

/** Static anchor points used by the quality trend-vs-target chart. */
export const trendAnchors: { offset: number; passRate: number; label: string }[] = [
  {
    "offset": 0,
    "passRate": 76,
    "label": "Jul 29"
  },
  {
    "offset": 7,
    "passRate": 84,
    "label": "Aug 5"
  },
  {
    "offset": 14,
    "passRate": 82,
    "label": "Aug 12"
  },
  {
    "offset": 21,
    "passRate": 80,
    "label": "Aug 19"
  },
  {
    "offset": 28,
    "passRate": 90,
    "label": "Aug 26"
  },
  {
    "offset": 35,
    "passRate": 86,
    "label": "Sep 2"
  },
  {
    "offset": 42,
    "passRate": 94.2,
    "label": "Sep 9"
  }
];

export function getQualityTrendAnchors() {
  return trendAnchors;
}