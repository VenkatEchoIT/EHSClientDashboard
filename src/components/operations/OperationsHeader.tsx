import { RefreshCw, Upload } from "lucide-react";
import { useState } from "react";
import type { DashboardTab, DateFilterKey } from "../../types/operations";
import { DashboardTabs } from "./DashboardTabs";
import { DateFilters } from "./DateFilters";

interface OperationsHeaderProps {
  dateFilter: DateFilterKey;
  onDateFilterChange: (key: DateFilterKey) => void;
  tab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

const HEADER_COPY: Record<DashboardTab, { title: string; subtitle: string }> = {
  operations: {
    title: "Operations",
    subtitle: "Real-time overview of coding workflow and productivity",
  },
  quality: {
    title: "Quality & Performance",
    subtitle: "Monitor coding quality, audit outcomes and team performance",
  },
};

export function OperationsHeader({ dateFilter, onDateFilterChange, tab, onTabChange }: OperationsHeaderProps) {
  const [lastUpdated, setLastUpdated] = useState("2 min ago");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const copy = HEADER_COPY[tab];

  function handleRefresh() {
    setIsRefreshing(true);
    window.setTimeout(() => {
      setLastUpdated("just now");
      setIsRefreshing(false);
    }, 500);
  }

  function handleExport() {
    setExportMessage("Export started");
    window.setTimeout(() => setExportMessage(null), 2200);
  }

  return (
    <div className="rounded-3xl border border-[var(--color-border-soft)] bg-[var(--color-surface-tint)] px-5 py-5 sm:px-7 sm:py-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-md font-medium text-[var(--color-ink-soft)]">Client Name</p>
          <p className="text-sm text-[var(--color-ink-muted)]">Multi-specialty – Inpatient &amp; Outpatient coding</p>
          <h1 className="mt-3 text-[28px] font-semibold tracking-tight text-[var(--color-ink)]">{copy.title}</h1>
          <p className="mt-0 text-md text-[rgb(23,10,3)]">{copy.subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-soft)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" aria-hidden="true" />
            Last updated: {lastUpdated}
          </span>
          <button
            type="button"
            onClick={handleRefresh}
            aria-label="Refresh dashboard data"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border-soft)] bg-[var(--color-surface)] text-[var(--color-ink-soft)] hover:bg-[var(--color-neutral-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} strokeWidth={2} />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-neutral-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            >
              Export
              <Upload className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </button>
            {exportMessage && (
              <span
                role="status"
                className="absolute right-0 top-full mt-2 whitespace-nowrap rounded-lg bg-[var(--color-ink)] px-3 py-1.5 text-xs text-white shadow-lg"
              >
                {exportMessage}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <DateFilters selected={dateFilter} onSelect={onDateFilterChange} />
        <DashboardTabs selected={tab} onSelect={onTabChange} />
      </div>
    </div>
  );
}
