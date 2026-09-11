import type { KPICardData, KPITone } from "../../types/operations";
import { Sparkline } from "./Sparkline";
import { TrendTag } from "./TrendTag";

interface KPICardProps {
  data: KPICardData;
}

const sparklineColorByTone: Record<KPITone, string> = {
  accent: "#e8631f",
  amber: "#eba91f",
  success: "#1f9254",
  info: "#3f6fd1",
  neutral: "#8a847c",
};

const ringColorByTone: Record<KPITone, string> = {
  accent: "var(--color-accent)",
  amber: "var(--color-amber)",
  success: "var(--color-success)",
  info: "var(--color-info)",
  neutral: "var(--color-ink-muted)",
};

const barColorByTone: Record<KPITone, string> = {
  accent: "bg-[var(--color-accent)]",
  amber: "bg-[var(--color-amber)]",
  success: "bg-[var(--color-success)]",
  info: "bg-[var(--color-info)]",
  neutral: "bg-[var(--color-ink-muted)]",
};

function DonutVisual({ value, tone }: { value: number; tone: KPITone }) {
  const radius = 15.5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);

  return (
    <svg viewBox="0 0 36 36" className="h-11 w-11 -rotate-90" role="img" aria-label={`${value}% complete`}>
      <circle cx="18" cy="18" r={radius} fill="none" stroke="var(--color-border-soft)" strokeWidth="4" />
      <circle
        cx="18"
        cy="18"
        r={radius}
        fill="none"
        stroke={ringColorByTone[tone]}
        strokeWidth="4"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function KPICard({ data }: KPICardProps) {
  return (
    <div className="flex min-w-[190px] flex-1 flex-col justify-between rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] px-5 py-4 shadow-[0_1px_2px_rgba(36,33,29,0.20)] transition-shadow hover:shadow-[0_2px_10px_rgba(36,33,29,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--color-ink-soft)]">{data.label}</p>
          <p className="mt-4.5 text-[26px] font-semibold leading-none tracking-tight text-[var(--color-ink)]">
            {data.value}
          </p>
          {data.trend && (
            <div className="mt-2">
              <TrendTag
                trend={data.trend}
                tone={data.trendTone ?? data.tone}
              />
            </div>
          )}
        </div>
        {data.visual === "donut" && data.donutValue !== undefined && (
          <DonutVisual value={data.donutValue} tone={data.tone} />
        )}
      </div>

      {data.footnote && data.footnote.length > 0 && (
        <div className="mt-3 flex items-center justify-between text-xs text-[var(--color-ink-muted)]">
          {data.footnote.map((item, i) => (
            <span key={i}>
              {item.label}
            </span>
          ))}

          <span className="font-semibold text-[var(--color-ink)]">
            {data.footnote[0].value}
          </span>
        </div>
      )}

      {data.sparkline && (
        <div className="mt-3">
          <Sparkline
            data={data.sparkline}
            color={sparklineColorByTone[data.tone]}
          />
        </div>
      )}

      {data.visual === "bar" && data.barValue !== undefined && (
        <div className="mt-3">
          {data.target !== undefined && (
            <p className="mb-2 text-sm text-[var(--color-ink-soft)]">
              Target {data.target}%
            </p>
          )}

          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-neutral-soft)]">
            <div
              className={`h-full rounded-full ${barColorByTone[data.tone]}`}
              style={{ width: `${data.barValue}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
