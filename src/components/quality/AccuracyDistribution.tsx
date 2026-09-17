import { Bar, BarChart, CartesianGrid, Cell, Label, LabelList, ReferenceDot, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { QualitySectionCard } from "./QualitySectionCard";
import { useQualityPerformance } from "../../context/QualityPerformanceContext";

const barColors = ["#d9481f", "#f0975a", "#eba91f", "#f2916e", "#e8631f"];

function DiamondDot({ cx, cy }: { cx?: number; cy?: number }) {
  if (cx === undefined || cy === undefined) return null;
  const size = 5;
  return (
    <path
      d={`M ${cx} ${cy - size} L ${cx + size} ${cy} L ${cx} ${cy + size} L ${cx - size} ${cy} Z`}
      fill="var(--color-amber)"
    />
  );
}

export function AccuracyDistribution() {
  const { accuracyDistribution } = useQualityPerformance();

  return (
    <QualitySectionCard title="First-Pass Accuracy Distribution" subtitle="Distribution of coders by first-pass accuracy">
      <div className="h-72 w-full" role="img" aria-label="Bar chart of coders by first-pass accuracy bucket">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={accuracyDistribution} margin={{ top: 28, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-border-soft)" />
            <XAxis
              dataKey="bucket"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 13, fill: "var(--color-ink-muted)" }}
            />
             <YAxis
              width={48}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 13, fill: "var(--color-ink-muted)" }}
              label={{
                value: "Coders",
                angle: -90,
                position: "insideLeft",
                offset: 15,
                fontSize: 14,
                fill: "var(--color-ink-muted)",
              }}
            />
            <ReferenceLine x="90-95%" stroke="var(--color-amber)" strokeDasharray="3 3">
              <Label value="Target 95% Accuracy" position="top" fill="var(--color-ink)" fontSize={13} />
            </ReferenceLine>
            <ReferenceDot x="90-95%" y={100} shape={<DiamondDot />} />
            <ReferenceDot x="90-95%" y={0} shape={<DiamondDot />} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={64}>
              {accuracyDistribution.map((entry, index) => (
                <Cell key={entry.bucket} fill={barColors[index]} />
              ))}
              <LabelList dataKey="count" position="top" style={{ fontSize: 12, fontWeight: 600, fill: "var(--color-ink)" }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </QualitySectionCard>
  );
}