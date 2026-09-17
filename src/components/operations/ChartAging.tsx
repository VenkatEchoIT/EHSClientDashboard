import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { AlertTriangle } from "lucide-react";
import { getChartAgingData } from "../../services/operationsService";

const chartAgingData = getChartAgingData();
import { SectionCard } from "./SectionCard";

const barColors = ["#f6cf8d", "#eba91f", "#f0975a", "#e8631f", "#d9481f"];

function AgingLabel(props: { x?: number; y?: number; width?: number; value?: number; index?: number }) {
  const { x = 0, y = 0, width = 0, value, index = 0 } = props;
  const isWarning = chartAgingData[index]?.warning;
  return (
    <g transform={`translate(${x + width / 2}, ${y - 10})`}>
      {isWarning && (
        <AlertTriangle x={-28} y={-13} width={14} height={14} color="var(--color-danger)" strokeWidth={2} />
      )}
      <text x={isWarning ? 4 : 0} textAnchor="middle" fontSize={12} fontWeight={600} fill="var(--color-ink)">
        {value}
      </text>
    </g>
  );
}

export function ChartAging() {
  return (
    <SectionCard title="Chart Aging" subtitle="How long open charts have been with us">
      <div className="h-72 w-full" role="img" aria-label="Bar chart of open chart age buckets">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartAgingData} margin={{ top: 24, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-border-soft)" />
            <XAxis
              dataKey="bucket"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--color-ink-muted)" }}
            />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-ink-muted)" }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={64}>
              {chartAgingData.map((entry, index) => (
                <Cell key={entry.bucket} fill={barColors[index]} />
              ))}
              <LabelList dataKey="count" content={<AgingLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}
