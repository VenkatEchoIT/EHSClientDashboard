import type { DashboardTab } from "../../types/operations";

interface DashboardTabsProps {
  selected: DashboardTab;
  onSelect: (tab: DashboardTab) => void;
}

const tabs: { key: DashboardTab; label: string }[] = [
  { key: "operations", label: "Operations" },
  { key: "quality", label: "Quality & Performance" },
];

export function DashboardTabs({ selected, onSelect }: DashboardTabsProps) {
  return (
    <div role="tablist" aria-label="Dashboard view" className="inline-flex rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-1">
      {tabs.map((tab) => {
        const isActive = tab.key === selected;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(tab.key)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] ${
              isActive
                ? "bg-[var(--color-accent)] text-white"
                : "text-[var(--color-ink-soft)] hover:bg-[var(--color-neutral-soft)]"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
