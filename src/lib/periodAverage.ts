import type { CustomRange, DateFilterKey } from "../types/operations";
import { resolveDateWindow, type ResolvedWindow } from "./dateWindow";

/**
 * Period averages for the throughput cards.
 *
 * The averaging unit follows the active date filter instead of always being
 * "per day":
 *
 *   today   -> average per day    (the one selected day)
 *   7 days  -> average per week   (window total / 1 week)
 *   30 days -> average per month  (window total / 1 month)
 *   month   -> average per month  (month-to-date, so the divisor is a partial
 *              month and the figure reads as a run-rate)
 *   custom  -> average per day across exactly the dates the user picked
 *
 * Everything resolves through resolveDateWindow(), so the divisor always
 * matches the window the rest of the dashboard is rendering.
 */

export type AveragePeriod = "day" | "week" | "month";

/** Nominal length of each averaging period, in days. */
const DAYS_PER_PERIOD: Record<AveragePeriod, number> = {
  day: 1,
  week: 7,
  month: 30,
};

const PERIOD_ADJECTIVE: Record<AveragePeriod, string> = {
  day: "Daily",
  week: "Weekly",
  month: "Monthly",
};

const PERIOD_NOUN: Record<AveragePeriod, string> = {
  day: "day",
  week: "week",
  month: "month",
};

/** Which unit a given filter averages over. */
export function averagePeriodFor(dateFilter: DateFilterKey): AveragePeriod {
  switch (dateFilter) {
    case "today":
      return "day";
    case "7d":
      return "week";
    case "30d":
    case "month":
      return "month";
    case "custom":
    default:
      // A hand-picked range is averaged across the days actually selected.
      return "day";
  }
}

export interface AverageBasis {
  period: AveragePeriod;
  /** The resolved window the average is taken over. */
  window: ResolvedWindow;
  /** Inclusive day count of the window. */
  days: number;
  /** How many periods the window covers — the divisor. Can be fractional. */
  periods: number;
  /** True when the window is shorter than one whole period (e.g. month-to-date). */
  isPartialPeriod: boolean;
  /** "Daily" | "Weekly" | "Monthly" — for labels like "Avg Daily Audited". */
  adjective: string;
  /** "day" | "week" | "month" — for captions like "avg per week". */
  noun: string;
  /** "Sep 11 – Sep 17", or a single date for a one-day window. */
  rangeLabel: string;
  /** "Sep 11 – Sep 17 · 7 days · avg per week" */
  basisLabel: string;
}

function formatDay(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function resolveAverageBasis(
  dateFilter: DateFilterKey,
  customRange?: CustomRange,
  today: Date = new Date()
): AverageBasis {
  const window = resolveDateWindow(dateFilter, customRange, today);
  const period = averagePeriodFor(dateFilter);
  const periods = window.days / DAYS_PER_PERIOD[period];
  const rangeLabel =
    window.days === 1 ? formatDay(window.start) : `${formatDay(window.start)} – ${formatDay(window.end)}`;
  const noun = PERIOD_NOUN[period];

  return {
    period,
    window,
    days: window.days,
    periods,
    isPartialPeriod: periods < 1,
    adjective: PERIOD_ADJECTIVE[period],
    noun,
    rangeLabel,
    basisLabel: `${rangeLabel} · ${window.days} day${window.days === 1 ? "" : "s"} · avg per ${noun}`,
  };
}

/** Window total -> average for one period. Rounded to whole units by default. */
export function averagePerPeriod(total: number, basis: AverageBasis, decimals = 0): number {
  if (!Number.isFinite(total) || basis.periods <= 0) return 0;
  const raw = total / basis.periods;
  const factor = 10 ** decimals;
  return Math.round(raw * factor) / factor;
}

/** Sums a series and returns the per-period average in one step. */
export function averageOf<T>(rows: T[], pick: (row: T) => number, basis: AverageBasis, decimals = 0): number {
  const total = rows.reduce((sum, row) => sum + (pick(row) || 0), 0);
  return averagePerPeriod(total, basis, decimals);
}

/** Convenience for building the stat tile label, e.g. "Avg Weekly Audited". */
export function averageLabel(basis: AverageBasis, subject: string): string {
  return `Avg ${basis.adjective} ${subject}`;
}