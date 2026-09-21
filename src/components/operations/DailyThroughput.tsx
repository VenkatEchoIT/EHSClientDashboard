import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getDailyThroughputData, getThroughputMeta } from "../../services/operationsService";
import type { CustomRange, DateFilterKey } from "../../types/operations";
import { SectionCard } from "./SectionCard";

interface DailyThroughputProps {
  dateFilter: DateFilterKey;
  customRange?: CustomRange;
}

export function DailyThroughput({ dateFilter, customRange }: DailyThroughputProps) {
  const dailyThroughputData = getDailyThroughputData(dateFilter, customRange);
  const meta = getThroughputMeta(dateFilter, customRange);

  const totalReceived = dailyThroughputData.reduce((sum, p) => sum + p.received, 0);
  const totalCompleted = dailyThroughputData.reduce((sum, p) => sum + p.completed, 0);
  const barData = [
    { name: "Avg Charts Received", value: totalReceived, fill: "#e8631f" },
    { name: "Avg Charts Completed", value: totalCompleted, fill: "#eba91f" },
  ];

  const title =
    meta.granularity === "hour" ? "Hourly Throughput" : meta.granularity === "week" ? "Weekly Throughput" : "Average Daily Throughput";
  const subtitle = `Total charts received and completed · ${meta.rangeLabel}`;

  return (
    <SectionCard title={title} subtitle={subtitle}>
      <div className="h-72 w-full" role="img" aria-label={`Bar chart of total charts received vs completed for ${meta.rangeLabel}`}>
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
    </SectionCard>
  );
}