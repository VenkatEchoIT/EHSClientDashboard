import { CartesianGrid, Label, ReferenceArea, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import { SectionCard } from "../operations/SectionCard";
import { useQualityPerformance } from "../../context/QualityPerformanceContext";
import type { AccuracyCategory, DailyMetric } from "../../types/qualityPerformance";

const categoryMeta: Record<AccuracyCategory, { color: string; label: string }> = {
  "at-above": { color: "#1f9254", label: "At / above target" },
  "slightly-below": { color: "#eba91f", label: "Slightly below (90-95%)" },
  "well-below": { color: "#d9481f", label: "Well below (<90%)" },
};

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-ink-soft)]">
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
    <SectionCard
      title="Volume vs Accuracy"
      subtitle="Volume of charts Audited vs accuracy score"
      action={
        <div className="flex flex-wrap items-center gap-3">
          {(Object.keys(categoryMeta) as AccuracyCategory[]).map((key) => (
            <LegendDot key={key} color={categoryMeta[key].color} label={categoryMeta[key].label} />
          ))}
        </div>
      }
    >
      <div className="h-72 w-full" role="img" aria-label="Scatter chart of charts audited versus accuracy">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 16, right: 16, left: -8, bottom: 8 }}>
            <CartesianGrid stroke="var(--color-border-soft)" />
            <XAxis
              type="number"
              dataKey="chartsAudited"
              name="Charts Audited"
              domain={[0, 130]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--color-ink-muted)" }}
              label={{ value: "Charts Audited", position: "insideBottom", offset: -4, fontSize: 12, fill: "var(--color-ink-muted)" }}
            />
            <YAxis
              type="number"
              dataKey="passRate"
              name="Accuracy"
              domain={[70, 100]}
              tickFormatter={(v) => `${v}%`}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--color-ink-muted)" }}
            />
            <ReferenceArea x1={0} x2={30} y1={70} y2={92} fill="var(--color-danger-soft)" fillOpacity={0.5}>
              <Label
                value={"Low volume\n(accuracy may vary)"}
                position="insideTopLeft"
                fill="var(--color-danger)"
                fontSize={10}
              />
            </ReferenceArea>
            <Tooltip cursor={{ strokeDasharray: "4 4" }} content={<CustomTooltip />} />
            {(Object.keys(byCategory) as AccuracyCategory[]).map((key) => (
              <Scatter key={key} data={byCategory[key]} fill={categoryMeta[key].color} isAnimationActive={false} />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}
