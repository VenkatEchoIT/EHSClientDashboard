import { Bar, BarChart, CartesianGrid, Cell, Label, LabelList, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { QualitySectionCard } from "./QualitySectionCard";
import { useQualityPerformance } from "../../context/QualityPerformanceContext";

const barColors = ["#d9481f", "#f0975a", "#eba91f", "#f6cf8d", "#e8631f"];

export function AccuracyDistribution() {
  const { accuracyDistribution } = useQualityPerformance();

  return (
    <QualitySectionCard title="First-Pass Accuracy Distribution" subtitle="Distribution of coders by first-pass accuracy">
      <div className="h-72 w-full" role="img" aria-label="Bar chart of coders by first-pass accuracy bucket">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={accuracyDistribution} margin={{ top: 28, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-border-soft)" />
            <XAxis
              dataKey="bucket"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--color-ink-muted)" }}
            />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-ink-muted)" }} />
            <ReferenceLine x="90-95%" stroke="var(--color-accent)" strokeDasharray="4 4">
              <Label value="Target 95% Accuracy" position="top" fill="var(--color-ink-muted)" fontSize={11} />
            </ReferenceLine>
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
