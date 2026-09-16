import { QualitySectionCard } from "./QualitySectionCard";
import { Sparkline } from "./Sparkline";
import { useQualityPerformance } from "../../context/QualityPerformanceContext";

export function QualityBySpecialty() {
  const { specialtyStats } = useQualityPerformance();

  return (
    <QualitySectionCard
      title="Quality by Specialty"
      subtitle="Quality performance by medical specialty"
      action={
        <button
          type="button"
          className="text-sm font-medium text-[var(--color-accent)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
        >
          View All
        </button>
      }
    >
      <div className="-mx-2 overflow-x-auto px-2">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border-soft)] text-left text-[var(--color-ink-muted)]">
              <th className="py-2 pr-3 font-medium">Specialty</th>
              <th className="py-2 pr-3 text-right font-medium">Charts Audited</th>
              <th className="py-2 pr-3 text-right font-medium">Pass rate</th>
              <th className="py-2 pr-3 text-right font-medium">Failed</th>
              <th className="py-2 pr-3 text-right font-medium">First-pass accuracy</th>
              <th className="py-2 pr-3 text-right font-medium">Rework rate</th>
              <th className="py-2 pr-3 text-right font-medium">Trend (vs prev)</th>
            </tr>
          </thead>
          <tbody>
            {specialtyStats.map((row) => (
              <tr key={row.specialty} className="border-b border-[var(--color-border-soft)] last:border-0">
                <td className="py-3 pr-3 font-medium text-[var(--color-ink)]">{row.specialty}</td>
                <td className="py-3 pr-3 text-right text-[var(--color-ink)]">{row.chartsAudited}</td>
                <td className="py-3 pr-3 text-right text-[var(--color-ink)]">{row.passRate}%</td>
                <td className="py-3 pr-3 text-right text-[var(--color-ink)]">{row.failed}</td>
                <td className="py-3 pr-3 text-right text-[var(--color-ink)]">{row.firstPassAccuracy}%</td>
                <td className="py-3 pr-3 text-right text-[var(--color-ink)]">{row.reworkRate}%</td>
                <td className="py-3 pr-3">
                  <div className="ml-auto h-6 w-16">
                    <Sparkline data={row.trend} color="#e8631f" />
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
