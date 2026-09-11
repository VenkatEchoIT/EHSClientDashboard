import type {
  AccuracyCategory,
  AuditRecord,
  CoderRecord,
  CurrentQueueSnapshot,
  DailyMetric,
  RejectionReason,
  Specialty,
  WeekdayThroughput,
} from "../types/qualityPerformance";

// Small deterministic PRNG so the "mock" data looks organic but is stable across reloads
// before it gets persisted to localStorage.
function mulberry32(seed: number) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const REASON_WEIGHTS: { reason: RejectionReason; weight: number }[] = [
  { reason: "Incorrect code", weight: 0.452 },
  { reason: "Missing documentation", weight: 0.238 },
  { reason: "Modifier error", weight: 0.167 },
  { reason: "Documentation mismatch", weight: 0.095 },
  { reason: "Other", weight: 0.048 },
];

function splitByWeights(total: number, weights: number[]): number[] {
  const raw = weights.map((w) => total * w);
  const floored = raw.map((v) => Math.floor(v));
  let remainder = total - floored.reduce((a, b) => a + b, 0);
  const order = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; k < order.length && remainder > 0; k++, remainder--) {
    floored[order[k].i] += 1;
  }
  return floored;
}

function reasonBreakdownFor(failed: number): Record<RejectionReason, number> {
  const counts = splitByWeights(
    failed,
    REASON_WEIGHTS.map((r) => r.weight)
  );
  const breakdown = {} as Record<RejectionReason, number>;
  REASON_WEIGHTS.forEach((r, i) => {
    breakdown[r.reason] = counts[i];
  });
  return breakdown;
}

interface SpecialtySeed {
  specialty: Specialty;
  charts: number;
  passRate: number;
  failed: number;
  firstPassAccuracy: number;
  reworkRate: number;
  rejected: number;
  pending: number;
}

// Seeded so the visible "Quality by Specialty" table matches the reference design,
// with a hidden "Other" bucket absorbing the remaining organization-wide volume.
const SPECIALTY_SEEDS: SpecialtySeed[] = [
  { specialty: "Cardiology", charts: 240, passRate: 96.2, failed: 9, firstPassAccuracy: 92.5, reworkRate: 5.3, rejected: 2, pending: 17 },
  { specialty: "Orthopedics", charts: 180, passRate: 94.8, failed: 11, firstPassAccuracy: 90.0, reworkRate: 7.8, rejected: 2, pending: 13 },
  { specialty: "Oncology", charts: 150, passRate: 97.1, failed: 5, firstPassAccuracy: 94.7, reworkRate: 4.1, rejected: 1, pending: 11 },
  { specialty: "Neurology", charts: 130, passRate: 91.6, failed: 14, firstPassAccuracy: 87.5, reworkRate: 9.2, rejected: 3, pending: 9 },
  { specialty: "General Medicine", charts: 220, passRate: 95.8, failed: 8, firstPassAccuracy: 92.7, reworkRate: 6.0, rejected: 2, pending: 16 },
  { specialty: "Other", charts: 284, passRate: 90.1, failed: 37, firstPassAccuracy: 92.1, reworkRate: 8.4, rejected: 9, pending: 20 },
];

export function buildInitialAuditRecords(): AuditRecord[] {
  return SPECIALTY_SEEDS.map((seed, index) => {
    const passed = Math.round((seed.charts * seed.passRate) / 100);
    const reworked = Math.round((seed.charts * seed.reworkRate) / 100);
    return {
      id: `AUD-${String(index + 1).padStart(3, "0")}`,
      specialty: seed.specialty,
      chartsAudited: seed.charts,
      passed,
      failed: seed.failed,
      rejected: seed.rejected,
      reworked,
      pending: seed.pending,
      firstPassAccuracy: seed.firstPassAccuracy,
      passRate: seed.passRate,
      reworkRate: seed.reworkRate,
      auditTimeDays: 1.3,
      reasonBreakdown: reasonBreakdownFor(seed.failed),
    };
  });
}

const FIRST_NAMES = [
  "Aarav", "Priya", "Rohan", "Ananya", "Vikram", "Sneha", "Arjun", "Kavya", "Karan", "Neha",
  "Aditya", "Pooja", "Rahul", "Meena", "Sanjay", "Divya", "Amit", "Riya", "Nikhil", "Zainab",
  "Farhan", "Isha", "Kabir", "Tanvi", "Yash", "Simran", "Varun", "Aisha", "Manish", "Preeti",
];
const LAST_NAMES = [
  "Patel", "Mehta", "Ansari", "Nair", "Menon", "Sharma", "Reddy", "Iyer", "Kapoor", "Gupta",
  "Rao", "Verma", "Khan", "Bose", "Chatterjee", "Pillai", "Joshi", "Malhotra", "Bhat", "Desai",
];

function makeTrend(random: () => number, base: number): number[] {
  const points: number[] = [];
  let value = base - 3;
  for (let i = 0; i < 8; i++) {
    value += (random() - 0.4) * 2;
    points.push(Math.max(0, Math.min(100, Number(value.toFixed(1)))));
  }
  return points;
}

export function buildInitialCoders(): CoderRecord[] {
  const random = mulberry32(42);
  const specialties: Specialty[] = ["Cardiology", "Orthopedics", "Oncology", "Neurology", "General Medicine"];

  const named: CoderRecord[] = [
    { id: "COD-001", name: "Disha Patel", specialty: "Cardiology", passRate: 98.6, firstPassAccuracy: 95.2, reworkRate: 2.1, trend: makeTrend(random, 98.6) },
    { id: "COD-002", name: "Nikhil Mehta", specialty: "Oncology", passRate: 97.8, firstPassAccuracy: 94.1, reworkRate: 2.6, trend: makeTrend(random, 97.8) },
    { id: "COD-003", name: "Zainab Ansari", specialty: "General Medicine", passRate: 97.1, firstPassAccuracy: 93.3, reworkRate: 3.0, trend: makeTrend(random, 97.1) },
    { id: "COD-004", name: "Rahul Nair", specialty: "Orthopedics", passRate: 96.4, firstPassAccuracy: 92.0, reworkRate: 3.4, trend: makeTrend(random, 96.4) },
    { id: "COD-005", name: "Meena Menon", specialty: "Neurology", passRate: 95.9, firstPassAccuracy: 91.6, reworkRate: 3.7, trend: makeTrend(random, 95.9) },
  ];

  // Bucket targets from the reference distribution chart, minus the 5 named coders above.
  const bucketPlan: { range: [number, number]; count: number }[] = [
    { range: [55, 69.9], count: 2 },
    { range: [70, 79.9], count: 3 },
    { range: [80, 89.9], count: 4 },
    { range: [90, 94.9], count: 30 },
    { range: [95, 99.5], count: 43 },
  ];

  const generated: CoderRecord[] = [];
  let counter = 6;
  const usedNames = new Set(named.map((n) => n.name));

  bucketPlan.forEach(({ range, count }) => {
    for (let i = 0; i < count; i++) {
      const firstPassAccuracy = Number((range[0] + random() * (range[1] - range[0])).toFixed(1));
      const passRate = Number(Math.min(99.8, firstPassAccuracy + 2.5 + random() * 2).toFixed(1));
      const reworkRate = Number(Math.max(1.2, 14 - firstPassAccuracy * 0.11 + random() * 1.5).toFixed(1));
      let name = "";
      do {
        const first = FIRST_NAMES[Math.floor(random() * FIRST_NAMES.length)];
        const last = LAST_NAMES[Math.floor(random() * LAST_NAMES.length)];
        name = `${first} ${last}`;
      } while (usedNames.has(name));
      usedNames.add(name);

      generated.push({
        id: `COD-${String(counter).padStart(3, "0")}`,
        name,
        specialty: specialties[counter % specialties.length],
        passRate,
        firstPassAccuracy,
        reworkRate,
        trend: makeTrend(random, passRate),
      });
      counter++;
    }
  });

  return [...named, ...generated];
}

const TREND_ANCHORS: { offset: number; passRate: number; label: string }[] = [
  { offset: 0, passRate: 76, label: "Jul 29" },
  { offset: 7, passRate: 84, label: "Aug 5" },
  { offset: 14, passRate: 82, label: "Aug 12" },
  { offset: 21, passRate: 80, label: "Aug 19" },
  { offset: 28, passRate: 90, label: "Aug 26" },
  { offset: 35, passRate: 86, label: "Sep 2" },
  { offset: 42, passRate: 94.2, label: "Sep 9" },
];

const WEEKDAY_BASE = [45, 48, 46, 50, 47, 20, 15]; // Mon..Sun relative volume

function categoryFor(passRate: number): AccuracyCategory {
  if (passRate >= 95) return "at-above";
  if (passRate >= 90) return "slightly-below";
  return "well-below";
}

function formatLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function buildInitialDailyMetrics(): DailyMetric[] {
  const random = mulberry32(7);
  const totalDays = 44; // Jul 29 -> Sep 10 inclusive
  const startDate = new Date(Date.UTC(2026, 6, 29)); // Jul 29 2026 (month is 0-indexed)

  const rawPassRates: number[] = [];
  for (let day = 0; day < totalDays; day++) {
    let value: number;
    const anchorExact = TREND_ANCHORS.find((a) => a.offset === day);
    if (anchorExact) {
      value = anchorExact.passRate;
    } else {
      const before = [...TREND_ANCHORS].reverse().find((a) => a.offset < day) ?? TREND_ANCHORS[0];
      const after = TREND_ANCHORS.find((a) => a.offset > day) ?? TREND_ANCHORS[TREND_ANCHORS.length - 1];
      const span = after.offset - before.offset || 1;
      const progress = (day - before.offset) / span;
      const interpolated = before.passRate + (after.passRate - before.passRate) * progress;
      value = interpolated + (random() - 0.5) * 4;
    }
    rawPassRates.push(Math.max(60, Math.min(99, Number(value.toFixed(1)))));
  }
  // Day index 43 (Sep 10) mirrors the reference tooltip example.
  rawPassRates[43] = 88.9;

  const weekdayVolumeRaw = Array.from({ length: totalDays }, (_, day) => {
    const date = new Date(startDate);
    date.setUTCDate(startDate.getUTCDate() + day);
    const weekdayIndex = (date.getUTCDay() + 6) % 7; // Mon=0..Sun=6
    return WEEKDAY_BASE[weekdayIndex] * (0.85 + random() * 0.3);
  });

  // Reserve day 43 (Sep 10) for the fixed low-volume example, then scale the rest to hit 1204 total.
  const fixedLastDayVolume = 25;
  const remainingTarget = 1204 - fixedLastDayVolume;
  const remainingRawSum = weekdayVolumeRaw.slice(0, totalDays - 1).reduce((a, b) => a + b, 0);
  const scale = remainingTarget / remainingRawSum;

  const volumes = weekdayVolumeRaw.map((v, i) => (i === totalDays - 1 ? fixedLastDayVolume : Math.max(2, Math.round(v * scale))));
  const currentSum = volumes.reduce((a, b) => a + b, 0);
  volumes[0] += 1204 - currentSum; // absorb rounding drift into the first day

  const metrics: DailyMetric[] = [];
  for (let day = 0; day < totalDays; day++) {
    const date = new Date(startDate);
    date.setUTCDate(startDate.getUTCDate() + day);
    const passRate = rawPassRates[day];
    const firstPassAccuracy = day === totalDays - 1 ? 80 : Math.max(55, Number((passRate - 6 - random() * 4).toFixed(1)));
    metrics.push({
      date: date.toISOString().slice(0, 10),
      label: formatLabel(date),
      chartsAudited: volumes[day],
      firstPassAccuracy,
      passRate,
      category: categoryFor(passRate),
    });
  }
  return metrics;
}

export function buildWeeklyThroughput(): WeekdayThroughput[] {
  return [
    { day: "Mon", chartsAudited: 55, pendingQueue: 36, passRate: 94.0 },
    { day: "Tue", chartsAudited: 65, pendingQueue: 42, passRate: 93.5 },
    { day: "Wed", chartsAudited: 75, pendingQueue: 49, passRate: 95.0 },
    { day: "Thu", chartsAudited: 120, pendingQueue: 80, passRate: 97.1 },
    { day: "Fri", chartsAudited: 60, pendingQueue: 39, passRate: 92.0 },
    { day: "Sat", chartsAudited: 30, pendingQueue: 20, passRate: 90.0 },
    { day: "Sun", chartsAudited: 22, pendingQueue: 14, passRate: 88.0 },
  ];
}

export function buildCurrentQueue(): CurrentQueueSnapshot {
  return { charts: 74, turnaroundDays: 1.1 };
}

export function getQualityTrendAnchors() {
  return TREND_ANCHORS;
}
