import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { priorityData, priorityTotal } from "../../data/operationsData";
import { SectionCard } from "./SectionCard";

export function WorkloadByPriority() {
  return (
    <SectionCard title="Workload by Priority" subtitle="Distribution of open charts by priority">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-10">
        <div className="relative h-52 w-52 shrink-0" role="img" aria-label={`Donut chart of ${priorityTotal} open charts by priority`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={priorityData}
                dataKey="count"
                nameKey="label"
                innerRadius="68%"
                outerRadius="100%"
                paddingAngle={2}
                stroke="none"
                isAnimationActive={false}
              >
                {priorityData.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-semibold text-[var(--color-ink)]">{priorityTotal}</span>
            <span className="text-xs text-[var(--color-ink-muted)]">Total open</span>
          </div>
        </div>

        <ul className="flex w-full max-w-xs flex-col gap-3">
          {priorityData.map((item) => (
            <li key={item.id} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-[var(--color-ink-soft)]">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} aria-hidden="true" />
                {item.label}
              </span>
              <span className="font-semibold text-[var(--color-ink)]">
                {item.count} <span className="font-normal text-[var(--color-ink-muted)]">({item.percent}%)</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </SectionCard>
  );
}
