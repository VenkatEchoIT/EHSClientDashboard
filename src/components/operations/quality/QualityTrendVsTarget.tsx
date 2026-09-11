import { Label, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SectionCard } from "../SectionCard";
import { useQualityPerformance } from "../../../context/QualityPerformanceContext";
import { getQualityTrendAnchors } from "../../../data/qualityPerformanceData";

export function QualityTrendVsTarget() {
  const { dailyMetrics } = useQualityPerformance();
  const anchors = getQualityTrendAnchors();
  const anchorLabels = new Set(anchors.map((a) => a.label));

  const chartData = dailyMetrics
    .filter((m) => anchorLabels.has(m.label))
    .map((m) => ({ label: m.label, quality: m.passRate }));

  const lastValue = chartData[chartData.length - 1]?.quality;

  return (
    <SectionCard title="Quality Trend vs Target">
      <div className="h-72 w-full" role="img" aria-label="Line chart of quality trend versus 95% target">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 24, right: 36, left: -8, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--color-ink-muted)" }}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 80, 90, 100]}
              tickFormatter={(v) => (v === 0 ? "0" : `${v}%`)}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--color-ink-muted)" }}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, "Quality"]}
              contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border-soft)", fontSize: 12 }}
            />
            <ReferenceLine y={95} stroke="var(--color-accent)" strokeDasharray="4 4" strokeWidth={1.5}>
              <Label value="Target 95%" position="insideTopLeft" fill="var(--color-ink-muted)" fontSize={12} />
            </ReferenceLine>
            <Line
              type="monotone"
              dataKey="quality"
              stroke="var(--color-accent)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "var(--color-accent)", strokeWidth: 0 }}
              isAnimationActive={false}
              label={(props) => {
                const { x, y, index } = props as { x: number; y: number; index: number };
                if (index !== chartData.length - 1 || lastValue === undefined) return <g key="last-label" />;
                return (
                  <text
                    key="last-label"
                    x={x + 10}
                    y={y - 8}
                    fontSize={12}
                    fontWeight={600}
                    fill="var(--color-ink)"
                    textAnchor="start"
                  >
                    {lastValue}%
                  </text>
                );
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}
