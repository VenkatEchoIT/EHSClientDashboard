import type { CustomRange, DateFilterKey } from "../types/operations";

export interface ResolvedWindow {
  start: Date;
  end: Date;
  days: number;
}

/** Longest custom range we will render, to keep charts readable. */
export const MAX_WINDOW_DAYS = 180;

export const MS_PER_DAY = 86_400_000;

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, amount: number): Date {
  const next = startOfDay(date);
  next.setDate(next.getDate() + amount);
  return next;
}

/** Parses "yyyy-mm-dd" as a *local* date (new Date(iso) would be UTC and can shift a day). */
export function parseISODate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) {
    const fallback = new Date(iso);
    return Number.isNaN(fallback.getTime()) ? null : startOfDay(fallback);
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function toISODate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function formatMonthDayPadded(date: Date): string {
  const month = date.toLocaleDateString("en-US", { month: "short" });
  return `${month} ${`${date.getDate()}`.padStart(2, "0")}`;
}

export function formatMonthDay(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function weekdayShort(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function clampRangeDays(days: number): number {
  return Math.max(1, Math.min(MAX_WINDOW_DAYS, days));
}

export function resolveDateWindow(
  dateFilter: DateFilterKey,
  customRange?: CustomRange,
  today: Date = new Date()
): ResolvedWindow {
  const end = startOfDay(today);

  if (dateFilter === "custom" && customRange?.start && customRange?.end) {
    const a = parseISODate(customRange.start);
    const b = parseISODate(customRange.end);
    if (a && b) {
      const [lo, hi] = a <= b ? [a, b] : [b, a];
      const rawDays = Math.round((hi.getTime() - lo.getTime()) / MS_PER_DAY) + 1;
      const days = clampRangeDays(rawDays);
      // If the picked range is longer than the cap, keep the most recent slice.
      const start = days === rawDays ? lo : addDays(hi, -(days - 1));
      return { start, end: hi, days };
    }
  }

  switch (dateFilter) {
    case "today":
      return { start: end, end, days: 1 };
    case "7d":
      return { start: addDays(end, -6), end, days: 7 };
    case "month": {
      const start = new Date(end.getFullYear(), end.getMonth(), 1);
      const days = Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
      return { start, end, days };
    }
    case "30d":
    case "custom":
    default:
      return { start: addDays(end, -29), end, days: 30 };
  }
}

/** The window immediately before `window`, same length — used for "vs prev" trends. */
export function previousWindow(window: ResolvedWindow): ResolvedWindow {
  const end = addDays(window.start, -1);
  return { start: addDays(end, -(window.days - 1)), end, days: window.days };
}

export function eachDayInWindow(window: ResolvedWindow): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < window.days; i++) days.push(addDays(window.start, i));
  return days;
}

export function isWithinWindow(date: Date, window: ResolvedWindow): boolean {
  return date.getTime() >= window.start.getTime() && date.getTime() <= window.end.getTime();
}

/** Stable string key for a resolved window — used for caching and PRNG seeding. */
export function windowKey(window: ResolvedWindow): string {
  return `${toISODate(window.start)}_${toISODate(window.end)}`;
}

export function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (Math.imul(31, hash) + value.charCodeAt(i)) | 0;
  }
  return hash;
}

export function mulberry32(seed: number): () => number {
  let state = seed;
  return function random() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomForWindow(window: ResolvedWindow, salt = ""): () => number {
  return mulberry32(hashString(`${salt}:${windowKey(window)}`));
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}
