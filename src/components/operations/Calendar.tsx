import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export interface CalendarRangeValue {
  start: string | null; // ISO yyyy-mm-dd
  end: string | null; // ISO yyyy-mm-dd
}

interface CalendarProps {
  value: CalendarRangeValue;
  onChange: (value: CalendarRangeValue) => void;
  maxDate?: Date;
}

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function buildMonthGrid(monthDate: Date): (Date | null)[] {
  const first = startOfMonth(monthDate);
  const startWeekday = first.getDay(); // 0=Sun
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(first.getFullYear(), first.getMonth(), day));
  }
  return cells;
}

/** A lightweight single-month calendar for picking a start/end date range by clicking two days. */
export function Calendar({ value, onChange, maxDate }: CalendarProps) {
  const initialMonth = value.start ? new Date(value.start) : new Date();
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(initialMonth));

  const cells = buildMonthGrid(visibleMonth);
  const today = maxDate ?? new Date();
  const todayISO = toISO(today);

  function handleDayClick(date: Date) {
    const iso = toISO(date);
    if (!value.start || (value.start && value.end)) {
      // Start a fresh selection.
      onChange({ start: iso, end: null });
      return;
    }
    // We have a start but no end yet — complete the range.
    if (iso < value.start) {
      onChange({ start: iso, end: value.start });
    } else {
      onChange({ start: value.start, end: iso });
    }
  }

  function isInRange(iso: string): boolean {
    if (!value.start || !value.end) return false;
    return iso >= value.start && iso <= value.end;
  }

  return (
    <div className="w-64 select-none">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-ink-soft)] hover:bg-[var(--color-neutral-soft)]"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        </button>
        <span className="text-sm font-semibold text-[var(--color-ink)]">
          {visibleMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </span>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-ink-soft)] hover:bg-[var(--color-neutral-soft)]"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center text-xs text-[var(--color-ink-muted)]">
        {WEEKDAY_LABELS.map((label, i) => (
          <span key={`${label}-${i}`} className="py-1">
            {label}
          </span>
        ))}

        {cells.map((date, i) => {
          if (!date) return <span key={`empty-${i}`} />;
          const iso = toISO(date);
          const isFuture = iso > todayISO;
          const isStart = iso === value.start;
          const isEnd = iso === value.end;
          const isEdge = isStart || isEnd;
          const inRange = isInRange(iso);
          const isToday = iso === todayISO;

          return (
            <button
              key={iso}
              type="button"
              disabled={isFuture}
              onClick={() => handleDayClick(date)}
              aria-pressed={isEdge}
              aria-label={date.toDateString()}
              className={`relative mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors ${
                isFuture
                  ? "cursor-not-allowed text-[var(--color-ink-muted)] opacity-40"
                  : isEdge
                    ? "bg-[var(--color-accent)] font-semibold text-white"
                    : inRange
                      ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                      : "text-[var(--color-ink)] hover:bg-[var(--color-neutral-soft)]"
              } ${isToday && !isEdge ? "ring-1 ring-inset ring-[var(--color-accent)]" : ""}`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
