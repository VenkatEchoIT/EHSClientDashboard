import { CalendarDays, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getDateFilters, getSubProjectOptions } from "../../services/operationsService";
import type { CustomRange, DateFilterKey } from "../../types/operations";
import { Calendar, type CalendarRangeValue } from "./Calendar";

const dateFilters = getDateFilters();
const subProjectOptions = getSubProjectOptions();

interface DateFiltersProps {
  selected: DateFilterKey;
  onSelect: (key: DateFilterKey) => void;
  customRange?: CustomRange;
  onCustomRangeChange: (range: CustomRange) => void;
}

function formatRangeLabel(range?: CustomRange): string | null {
  if (!range?.start || !range?.end) return null;
  const format = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${format(range.start)} – ${format(range.end)}`;
}

export function DateFilters({ selected, onSelect, customRange, onCustomRangeChange }: DateFiltersProps) {
  const [subProject, setSubProject] = useState(subProjectOptions[0]);
  const [isSubProjectOpen, setIsSubProjectOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [draftRange, setDraftRange] = useState<CalendarRangeValue>({
    start: customRange?.start ?? null,
    end: customRange?.end ?? null,
  });
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }
    if (isCalendarOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCalendarOpen]);

  function handleCustomClick() {
    setDraftRange({ start: customRange?.start ?? null, end: customRange?.end ?? null });
    setIsCalendarOpen((open) => !open);
  }

  function handleApply() {
    if (draftRange.start && draftRange.end) {
      onCustomRangeChange({ start: draftRange.start, end: draftRange.end });
      onSelect("custom");
      setIsCalendarOpen(false);
    }
  }

  function handleCancel() {
    setDraftRange({ start: customRange?.start ?? null, end: customRange?.end ?? null });
    setIsCalendarOpen(false);
  }

  const customLabel = formatRangeLabel(selected === "custom" ? customRange : undefined);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        role="group"
        aria-label="Date range"
        className="flex flex-wrap items-center gap-1 rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-1"
      >
        {dateFilters.map((filter) => {
          const isActive = filter.key === selected;
          const isCustom = filter.key === "custom";

          if (isCustom) {
            return (
              <div key={filter.key} className="relative" ref={calendarRef}>
                <button
                  type="button"
                  onClick={handleCustomClick}
                  aria-pressed={isActive}
                  aria-haspopup="dialog"
                  aria-expanded={isCalendarOpen}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] ${
                    isActive
                      ? "bg-[var(--color-accent)] text-white"
                      : "text-[var(--color-ink-soft)] hover:bg-[var(--color-neutral-soft)]"
                  }`}
                >
                  {isActive && customLabel ? customLabel : filter.label}
                  <CalendarDays className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                </button>

                {isCalendarOpen && (
                  <div
                    role="dialog"
                    aria-label="Select custom date range"
                    className="absolute right-0 z-30 mt-2 w-72 rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-3 shadow-lg"
                  >
                    <Calendar value={draftRange} onChange={setDraftRange} />

                    <div className="mt-2 flex items-center justify-between border-t border-[var(--color-border-soft)] pt-3 text-xs text-[var(--color-ink-muted)]">
                      <span>
                        {draftRange.start
                          ? `${draftRange.start}${draftRange.end ? ` → ${draftRange.end}` : " → …"}`
                          : "Pick a start date"}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--color-ink-soft)] hover:bg-[var(--color-neutral-soft)]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleApply}
                        disabled={!draftRange.start || !draftRange.end}
                        className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => onSelect(filter.key)}
              aria-pressed={isActive}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] ${
                isActive
                  ? "bg-[var(--color-accent)] text-white"
                  : "text-[var(--color-ink-soft)] hover:bg-[var(--color-neutral-soft)]"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsSubProjectOpen((open) => !open)}
          aria-haspopup="listbox"
          aria-expanded={isSubProjectOpen}
          className="inline-flex h-[42px] items-center gap-2 rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] px-3.5 py-2 text-sm font-medium text-[var(--color-ink-soft)] hover:bg-[var(--color-neutral-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
        >
          {subProject}
          <ChevronDown className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        </button>

        {isSubProjectOpen && (
          <ul
            role="listbox"
            aria-label="Sub-project"
            className="absolute left-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] py-1 shadow-lg"
          >
            {subProjectOptions.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option === subProject}
                  onClick={() => {
                    setSubProject(option);
                    setIsSubProjectOpen(false);
                  }}
                  className={`block w-full px-3.5 py-2 text-left text-sm hover:bg-[var(--color-neutral-soft)] ${
                    option === subProject ? "font-medium text-[var(--color-accent)]" : "text-[var(--color-ink-soft)]"
                  }`}
                >
                  {option}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
