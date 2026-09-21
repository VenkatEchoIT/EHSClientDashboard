import {
  Label,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useQualityPerformance } from "../../context/QualityPerformanceContext";
import { QualitySectionCard } from "../quality/QualitySectionCard";

/** Evenly samples up to `count` points from the filtered window, always keeping the first and last day. */
function sampleEvenly<T>(items: T[], count: number): T[] {
  if (items.length <= count) return items;
  const step = (items.length - 1) / (count - 1);
  const picked: T[] = [];
  for (let i = 0; i < count; i++) picked.push(items[Math.round(i * step)]);
  return picked;
}

export function QualityTrendVsTarget() {
  const { dailyMetrics } = useQualityPerformance();

  // This chart used to plot only days whose label matched a hard-coded anchor
  // list (Jul 29 ... Sep 9). Any filter that didn't include those exact dates --
  // every custom range, "Today", "7d" -- rendered an empty or near-empty line.
  // It now samples the filtered window itself, so it always tracks the filter.
  const chartData = sampleEvenly(dailyMetrics, 7).map((m) => ({
    label: m.label,
    quality: m.passRate,
  }));

  const lastValue = chartData[chartData.length - 1]?.quality;

  return (
    <QualitySectionCard
      title="Quality Trend vs Target"
      className="shadow-[0_2px_8px_rgba(36,33,29,0.05)]"
    >
      <div
        className="h-[260px] w-full"
        role="img"
        aria-label="Line chart of quality trend versus 95% target"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 30,
              right: 25,
              left: -5,
              bottom: 20,
            }}
          >
            <XAxis
              dataKey="label"
              tickLine={true}
              axisLine={{
                stroke: "#9aacc5",
                strokeWidth: 1,
              }}
              tick={{
                fontSize: 14,
                fill: "#8da1bd",
              }}
              tickMargin={14}
            />

            <YAxis
              domain={[75, 100]}
              ticks={[80, 90, 100]}
              tickFormatter={(value) => `${value}%`}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 14, fill: "#8da1bd", fontWeight: 500 }}
              width={52}
            />

            <Tooltip
              formatter={(value) => [`${value}%`, "Quality"]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--color-border-soft)",
                fontSize: 12,
              }}
            />

            {/* 95% Target */}
            <ReferenceLine
              y={95}
              stroke="var(--color-accent)"
              strokeDasharray="5 4"
              strokeWidth={1.5}
            >
              <Label
                value="Target 95%"
                position="top"
                fill="#70584f"
                fontSize={14}
              />
            </ReferenceLine>

            {/* Quality Trend */}
            <Line
              type="monotone"
              dataKey="quality"
              stroke="var(--color-accent)"
              strokeWidth={1.5}
              dot={{
                r: 4.5,
                fill: "var(--color-surface)",
                stroke: "var(--color-accent)",
                strokeWidth: 2.5,
              }}
              activeDot={{
                r: 4.5,
                fill: "var(--color-surface)",
                stroke: "var(--color-accent)",
                strokeWidth: 2.5,
              }}
              isAnimationActive={false}
              label={(props) => {
                const { x, y, index } = props as {
                  x: number;
                  y: number;
                  index: number;
                };

                if (
                  index !== chartData.length - 1 ||
                  lastValue === undefined
                ) {
                  return <g key="last-label" />;
                }

                return (
                  <text
                    key="last-label"
                    x={x - 2}
                    y={y + 30}
                    fontSize={16}
                    fontWeight={600}
                    fill="var(--color-ink)"
                    textAnchor="middle"
                  >
                    {lastValue}%
                  </text>
                );
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </QualitySectionCard>
  );
}