import { QualitySectionCard } from "./QualitySectionCard";
import { Sparkline } from "./Sparkline";
import { useQualityPerformance } from "../../context/QualityPerformanceContext";

const rankTone = ["bg-[var(--color-accent)] text-white", "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"];

export function TopPerformers() {
  const { topPerformers } = useQualityPerformance();

  return (
    <QualitySectionCard
      title="Top performers"
      subtitle="Highest quality performers (by pass rate)"
      action={
        <button
          type="button"
          className="text-sm whitespace-nowrap font-medium text-[var(--color-accent)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
        >
          View All
        </button>
      }
    >
      <div className="-mx-2 overflow-x-auto px-2">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border-soft)] text-left text-[var(--color-ink-muted)]">
              <th className="py-2 pr-3 font-medium">Rank</th>
              <th className="py-2 pr-3 font-medium">Coder</th>
              <th className="py-2 pr-3 text-right font-medium">Pass rate</th>
              <th className="py-2 pr-3 text-right font-medium">First-pass accuracy</th>
              <th className="py-2 pr-3 text-right font-medium">Trend (vs prev)</th>
            </tr>
          </thead>
          <tbody>
            {topPerformers.map((coder, index) => (
              <tr key={coder.id} className="border-b border-[var(--color-border-soft)] last:border-0">
                <td className="py-3 pr-3">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${rankTone[index === 0 ? 0 : 1]}`}
                  >
                    {index + 1}
                  </span>
                </td>
                <td className="py-3 pr-3 font-medium text-[var(--color-ink)]">{coder.name}</td>
                <td className="py-3 pr-3 text-right text-[var(--color-ink)]">{coder.passRate}%</td>
                <td className="py-3 pr-3 text-right text-[var(--color-ink)]">{coder.firstPassAccuracy}%</td>
                <td className="py-3 pr-3">
                  <div className="ml-auto h-6 w-16">
                    <Sparkline data={coder.trend} color="#e8631f" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </QualitySectionCard>
  );
}
