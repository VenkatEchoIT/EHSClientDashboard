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
    <div className="rounded-3xl border border-[var(--color-border-soft)] bg-[var(--color-surface-tint)] px-4 py-4 sm:px-6 sm:py-5 lg:px-7 lg:py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-ink-soft sm:text-base">Client Name</p>
          <p className="text-sm text-ink-muted sm:text-base">Multi-specialty – Inpatient &amp; Outpatient coding</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">{copy.title}</h1>
          <p className="text-sm text-ink-soft sm:text-base">{copy.subtitle}</p>
        </div>

        <div className="flex w-full items-center justify-end gap-2 sm:w-auto sm:justify-start sm:gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-ink-soft)] sm:text-sm">
            <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" aria-hidden="true" />
            Last updated: {lastUpdated}
          </span>
          <button
            type="button"
            onClick={handleRefresh}
            aria-label="Refresh dashboard data"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border-soft)] bg-[var(--color-surface)] text-[var(--color-ink-soft)] hover:bg-[var(--color-neutral-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] sm:h-9 sm:w-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-ink-soft hover:bg-[var(--color-neutral-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] sm:gap-2 sm:px-4 sm:text-base"
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

      <div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <DateFilters selected={dateFilter} onSelect={onDateFilterChange} />
        <DashboardTabs selected={tab} onSelect={onTabChange} />
      </div>
    </div>
  );
}
