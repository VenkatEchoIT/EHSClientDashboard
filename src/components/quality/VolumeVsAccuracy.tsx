import { CartesianGrid, Label, ReferenceArea, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import { QualitySectionCard } from "./QualitySectionCard";
import { useQualityPerformance } from "../../context/QualityPerformanceContext";
import type { AccuracyCategory, DailyMetric } from "../../types/qualityPerformance";

const categoryMeta: Record<AccuracyCategory, { color: string; label: string }> = {
  "at-above": { color: "#1f9254", label: "At / above target" },
  "slightly-below": { color: "#eba91f", label: "Slightly below (90-95%)" },
  "well-below": { color: "#d9481f", label: "Well below (<90%)" },
};

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-soft)]">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
      {label}
    </span>
  );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: DailyMetric }[] }) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload;
  const meta = categoryMeta[point.category];
  return (
    <div className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-3 text-xs shadow-lg">
      <p className="mb-1.5 font-semibold text-[var(--color-ink)]">{point.label}</p>
      <div className="flex flex-col gap-1 text-[var(--color-ink-soft)]">
        <span>
          Charts Audited: <span className="font-semibold text-[var(--color-ink)]">{point.chartsAudited}</span>
        </span>
        <span>
          First Pass accuracy: <span className="font-semibold text-[var(--color-ink)]">{point.firstPassAccuracy}%</span>
        </span>
        <span>
          Accuracy: <span className="font-semibold text-[var(--color-ink)]">{point.passRate}%</span>
        </span>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} aria-hidden="true" />
        <span className="text-[var(--color-ink-soft)]">{meta.label}</span>
      </div>
    </div>
  );
}

export function VolumeVsAccuracy() {
  const { dailyMetrics } = useQualityPerformance();
  const points = dailyMetrics.slice(-24);
  const byCategory: Record<AccuracyCategory, DailyMetric[]> = {
    "at-above": points.filter((p) => p.category === "at-above"),
    "slightly-below": points.filter((p) => p.category === "slightly-below"),
    "well-below": points.filter((p) => p.category === "well-below"),
  };

  return (
    <QualitySectionCard
      title="Volume vs Accuracy"
      subtitle="Volume of charts Audited vs accuracy score"
      legend={
      <div className="flex w-full flex-wrap justify-end gap-4">
        {(Object.keys(categoryMeta) as AccuracyCategory[]).map((key) => (
          <LegendDot key={key} color={categoryMeta[key].color} label={categoryMeta[key].label} />
        ))}
      </div>
      }
    >
      <div className="h-72 w-full" role="img" aria-label="Scatter chart of charts audited versus accuracy">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 16, right: 16, left: -8, bottom: 8 }}>
            <CartesianGrid horizontal vertical={false} stroke="var(--color-border-soft)" />
            <XAxis
              type="number"
              dataKey="chartsAudited"
              name="Charts Audited"
              domain={[0, 125]}
              ticks={[0, 25, 50, 75, 100, 125]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 13, fill: "var(--color-ink-muted)" }}
              label={{ value: "Charts Audited", position: "insideBottom", offset: -4, fontSize: 12, fill: "var(--color-ink-muted)" }}
            />
            <YAxis
              type="number"
              dataKey="passRate"
              name="Accuracy"
              domain={[70, 100]}
              ticks={[70, 75, 80, 85, 90, 95, 100]}
              tickFormatter={(v) => `${v}%`}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 13, fill: "var(--color-ink-muted)" }}
            />
            <ReferenceArea
                x1={0}
                x2={25}
                y1={70}
                y2={100}
                fill="var(--color-danger-soft)"
                fillOpacity={0.8}
                stroke="var(--color-danger)"
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              >
                <Label
                  position="insideLeft"
                  fill="var(--color-danger)"
                  fontSize={10}
                />
              <Label
                content={({ viewBox }) => {
                  const { x = 0, y = 0, width = 0 } = viewBox as {
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                  };
                  const centerX = x + width / 2;
                  return (
                    <text x={centerX} y={y + 20} textAnchor="middle" fontSize={11} fontWeight={600} fill="#AE380F">
                      <tspan x={centerX} dy="140">Low volume</tspan>
                      <tspan x={centerX} dy="14">(accuracy may vary)</tspan>
                    </text>
                  );
                }}
              />
            </ReferenceArea>
            <Tooltip cursor={{ strokeDasharray: "4 4" }} content={<CustomTooltip />} />
            {(Object.keys(byCategory) as AccuracyCategory[]).map((key) => (
              <Scatter key={key} data={byCategory[key]} fill={categoryMeta[key].color} isAnimationActive={false} />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </QualitySectionCard>
  );
}