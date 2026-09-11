import { CalendarDays, ChevronDown } from "lucide-react";
import { useState } from "react";
import { dateFilters, subProjectOptions } from "../../data/operationsData";
import type { DateFilterKey } from "../../types/operations";

interface DateFiltersProps {
  selected: DateFilterKey;
  onSelect: (key: DateFilterKey) => void;
}

export function DateFilters({ selected, onSelect }: DateFiltersProps) {
  const [subProject, setSubProject] = useState(subProjectOptions[0]);
  const [isSubProjectOpen, setIsSubProjectOpen] = useState(false);

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
              {isCustom && <CalendarDays className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />}
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
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] px-3.5 py-2 text-sm font-medium text-[var(--color-ink-soft)] hover:bg-[var(--color-neutral-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
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
