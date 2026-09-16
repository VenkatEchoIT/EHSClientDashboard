import { InsightCard } from "../operations/InsightCard";
import { useQualityPerformance } from "../../context/QualityPerformanceContext";
import type { InsightCardData } from "../../types/operations";

export function QualityInsights() {
  const { insights } = useQualityPerformance();

  const cards: InsightCardData[] = [
    {
      id: "quality-vs-target",
      icon: "shieldCheck",
      label: "Quality vs target",
      value: `${Math.abs(insights.qualityVsTargetPts)} pts`,
      supporting: insights.qualityVsTargetPts >= 0 ? "below target" : "above target",
      tone: "danger",
    },
    {
      id: "improvement",
      icon: "trendingUp",
      label: "Improvement",
      value: `${insights.improvementPts >= 0 ? "+" : ""}${insights.improvementPts} pts`,
      supporting: "vs previous period",
      tone: "success",
    },
    {
      id: "top-specialty",
      icon: "shieldCheck",
      label: "Top specialty",
      value: insights.topSpecialty.specialty,
      supporting: `${insights.topSpecialty.passRate}% pass rate`,
      tone: "info",
    },
    {
      id: "most-common-error",
      icon: "alertTriangle",
      label: "Most common error",
      value: insights.mostCommonError.reason,
      supporting: `${insights.mostCommonError.percent}% of total errors`,
      tone: "amber",
    },
    {
      id: "rework-savings",
      icon: "clock",
      label: "Rework savings opportunity",
      value: `~${insights.reworkSavingsHours} hrs`,
      supporting: "if rework reduced by 50%",
      tone: "accent",
    },
  ];

  return (
    <section>
      <h2 className="text-[18px] font-semibold tracking-wide text-[var(--color-ink-muted)]">QUALITY INSIGHTS</h2>
      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">Key takeaways for this period</p>
      <div className="mt-4 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((insight) => (
          <InsightCard key={insight.id} data={insight} />
        ))}
      </div>
    </section>
  );
}
