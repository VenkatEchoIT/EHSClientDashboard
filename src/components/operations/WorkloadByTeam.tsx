import { Users } from "lucide-react";
import { teamWorkloadData } from "../../data/operationsData";
import { SectionCard } from "./SectionCard";
import type { TeamWorkloadRow } from "../../types/operations";

const avatarToneClasses: Record<TeamWorkloadRow["avatarTone"], string> = {
  accent: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
  amber: "bg-[var(--color-amber-soft)] text-[var(--color-amber)]",
  info: "bg-[var(--color-info-soft)] text-[var(--color-info)]",
};

const columns: { key: keyof TeamWorkloadRow; label: string }[] = [
  { key: "assigned", label: "Assigned" },
  { key: "inProgress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "backlog", label: "Backlog" },
];

export function WorkloadByTeam() {
  return (
    <SectionCard
      title="Workload by Team"
      subtitle="Current workload distribution"
      action={
        <button
          type="button"
          className="text-sm font-medium text-[var(--color-accent)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
        >
          View All
        </button>
      }
    >
      <div className="-mx-2 overflow-x-auto px-2">
        <table className="w-full min-w-[420px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border-soft)] text-left text-[var(--color-ink-muted)]">
              <th className="py-2 pr-3 font-medium">Team</th>
              {columns.map((column) => (
                <th key={column.key} className="py-2 pr-3 text-right font-  ">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teamWorkloadData.map((row) => (
              <tr key={row.id} className="border-b border-[var(--color-border-soft)] last:border-0">
                <td className="py-3 pr-3">
                  <span className="flex items-center gap-2.5">
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${avatarToneClasses[row.avatarTone]}`}
                      aria-hidden="true"
                    >
                      <Users className="h-3.5 w-3.5" strokeWidth={2} />
                    </span>
                    <span className="font-medium text-[var(--color-ink)]">{row.team}</span>
                  </span>
                </td>
                <td className="py-3 pr-3 text-right text-[var(--color-ink)]">{row.assigned}</td>
                <td className="py-3 pr-3 text-right text-[var(--color-ink)]">{row.inProgress}</td>
                <td className="py-3 pr-3 text-right text-[var(--color-ink)]">{row.completed}</td>
                <td className="py-3 pr-3 text-right text-[var(--color-ink)]">{row.backlog}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
