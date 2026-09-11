import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SectionCard } from "../operations/SectionCard";
import { useQualityPerformance } from "../../context/QualityPerformanceContext";
import type { WeekdayThroughput } from "../../types/qualityPerformance";

const FULL_DAY_NAME: Record<string, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-ink-soft)]">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} aria-hidden="true" />
      {label}
    </span>
  );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: WeekdayThroughput }[] }) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-3 text-xs shadow-lg">
      <p className="mb-1.5 font-semibold text-[var(--color-ink)]">{point.day}</p>
      <div className="flex flex-col gap-1 text-[var(--color-ink-soft)]">
        <span>
          Charts Audited: <span className="font-semibold text-[var(--color-ink)]">{point.chartsAudited} charts</span>
        </span>
        <span>
          Pending Queue: <span className="font-semibold text-[var(--color-ink)]">{point.pendingQueue} charts</span>
        </span>
        <span>
          Pass Rate: <span className="font-semibold text-[var(--color-ink)]">{point.passRate}%</span>
        </span>
      </div>
    </div>
  );
}

export function AuditThroughput() {
  const { weeklyThroughput, currentQueue } = useQualityPerformance();

  const avgDailyAudited = Math.round(
    weeklyThroughput.reduce((sum, d) => sum + d.chartsAudited, 0) / weeklyThroughput.length
  );
  const bestDay = [...weeklyThroughput].sort((a, b) => b.passRate - a.passRate)[0];

  return (
    <SectionCard
      title="Audit Throughput & Backlog"
      action={
        <div className="flex items-center gap-4">
          <LegendDot color="#1f9254" label="Charts Audited" />
          <LegendDot color="#eba91f" label="Pending Queue" />
        </div>
      }
    >
      <div className="h-64 w-full" role="img" aria-label="Grouped bar chart of audit throughput and backlog by weekday">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyThroughput} margin={{ top: 12, right: 8, left: -12, bottom: 0 }} barGap={6}>
            <CartesianGrid vertical={false} stroke="var(--color-border-soft)" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-ink-muted)" }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-ink-muted)" }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--color-neutral-soft)" }} />
            <Bar dataKey="chartsAudited" name="Charts Audited" fill="#1f9254" radius={[4, 4, 0, 0]} maxBarSize={22} />
            <Bar dataKey="pendingQueue" name="Pending Queue" fill="#eba91f" radius={[4, 4, 0, 0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 border-t border-[var(--color-border-soft)] pt-4 text-sm sm:grid-cols-3">
        <div>
          <p className="text-[var(--color-ink-muted)]">Avg Daily Audited</p>
          <p className="mt-0.5 text-lg font-semibold text-[var(--color-ink)]">{avgDailyAudited} charts</p>
        </div>
        <div>
          <p className="text-[var(--color-ink-muted)]">Best Quality Day</p>
          <p className="mt-0.5 text-lg font-semibold text-[var(--color-success)]">
            {bestDay ? `${FULL_DAY_NAME[bestDay.day] ?? bestDay.day} (${bestDay.passRate}%)` : "—"}
          </p>
        </div>
        <div>
          <p className="text-[var(--color-ink-muted)]">Current Audit Queue</p>
          <p className="mt-0.5 text-lg font-semibold text-[var(--color-ink)]">
            {currentQueue.charts} charts <span className="text-sm font-normal text-[var(--color-ink-muted)]">({currentQueue.turnaroundDays}d turnaround)</span>
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
