import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { QualitySectionCard } from "./QualitySectionCard";
import { useQualityPerformance } from "../../context/QualityPerformanceContext";

const FULL_DAY_NAME: Record<string, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

export function AuditThroughput() {
  const { throughputWindow, currentQueue } = useQualityPerformance();
  const { totalAudited, totalPending, bestDay } = throughputWindow;

  // Same treatment as the Operations Daily Throughput card: just the two
  // window totals rather than a bar per day, so the chart stays readable
  // regardless of how many days are in the selected range.
  const barData = [
    { name: "Avg Charts Audited", value: totalAudited, fill: "#1f9254" },
    { name: "Pending Queue", value: totalPending, fill: "#eba91f" },
  ];

  return (
    <QualitySectionCard title="Audit Throughput & Backlog">
      <div className="h-64 w-full" role="img" aria-label="Bar chart of total charts audited vs pending queue">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} margin={{ top: 20, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-border-soft)" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 13, fill: "var(--color-ink-muted)" }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-ink-muted)" }} />
            <Tooltip
              cursor={{ fill: "var(--color-neutral-soft)" }}
              contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border-soft)", fontSize: 12 }}
              formatter={(value) => [`${Number(value ?? 0).toLocaleString()} charts`, ""]}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={110}>
              {barData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
              <LabelList dataKey="value" position="top" style={{ fontSize: 13, fontWeight: 600, fill: "var(--color-ink)" }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 border-t border-[var(--color-border-soft)] pt-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-[var(--color-ink-muted)]">Best Quality Day</p>
          <p className="mt-0.5 text-lg font-semibold text-[var(--color-success)]">
            {bestDay
              ? `${FULL_DAY_NAME[bestDay.day] ?? bestDay.day}${bestDay.label ? `, ${bestDay.label}` : ""} (${bestDay.passRate}%)`
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-[var(--color-ink-muted)]">Current Audit Queue</p>
          <p className="mt-0.5 text-lg font-semibold text-[var(--color-ink)]">
            {currentQueue.charts} charts <span className="text-sm font-normal text-[var(--color-ink-muted)]">({currentQueue.turnaroundDays}d turnaround)</span>
          </p>
        </div>
      </div>
    </QualitySectionCard>
  );
}