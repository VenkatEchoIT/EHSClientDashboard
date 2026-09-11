import { Info } from "lucide-react";

export function DashboardFooter() {
  return (
    <div className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
      <Info className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
      Metrics refresh every 5 minutes.
    </div>
  );
}
