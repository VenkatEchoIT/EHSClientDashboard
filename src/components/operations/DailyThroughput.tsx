import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getDailyThroughputData } from "../../services/operationsService";

const dailyThroughputData = getDailyThroughputData();
import { SectionCard } from "./SectionCard";

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-soft)]">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} aria-hidden="true" />
      {label}
    </span>
  );
}

export function DailyThroughput() {
  const chartData = dailyThroughputData.map((point) => ({
    ...point,
    label: `${point.day} ${point.date}`,
  }));

  return (
    <SectionCard
  title="Daily Throughput"
  subtitle="Charts received and completed per day"
  className="[&>div:first-of-type]:flex-col sm:[&>div:first-of-type]:flex-row [&>div:first-of-type>div:first-child]:w-full [&>div:first-of-type>div:first-child]:flex-1"
  action={
    <div className="flex w-full items-center justify-end gap-4 sm:w-auto">
      <LegendDot color="#e8631f" label="Received" />
      <LegendDot color="#eba91f" label="Completed" />
    </div>
  }
>

      <div className="h-72 w-full" role="img" aria-label="Bar chart of charts received and completed per day">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 8, left: -12, bottom: 0 }} barGap={6}>
            <CartesianGrid vertical={false} stroke="var(--color-border-soft)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--color-ink-muted)" }}
            />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-ink-muted)" }} />
            <Tooltip
              cursor={{ fill: "var(--color-neutral-soft)" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--color-border-soft)",
                fontSize: 12,
              }}
            />
            <Bar dataKey="received" name="Received" fill="#e8631f" radius={[4, 4, 0, 0]} maxBarSize={22}>
              <LabelList dataKey="received" position="top" style={{ fontSize: 11, fill: "var(--color-ink-soft)" }} />
            </Bar>
            <Bar dataKey="completed" name="Completed" fill="#eba91f" radius={[4, 4, 0, 0]} maxBarSize={22}>
              <LabelList dataKey="completed" position="top" style={{ fontSize: 11, fill: "var(--color-ink-soft)" }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}
