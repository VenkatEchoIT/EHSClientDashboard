import { getPipelineData } from "../../services/operationsService";
import type { CustomRange, DateFilterKey } from "../../types/operations";
import { PipelineCard } from "./PipelineCard";
import { SectionCard } from "./SectionCard";

interface ChartPipelineProps {
  dateFilter: DateFilterKey;
  customRange?: CustomRange;
}

export function ChartPipeline({ dateFilter, customRange }: ChartPipelineProps) {
  const pipelineData = getPipelineData(dateFilter, customRange);
  return (
    <SectionCard title="Chart Pipeline" subtitle="Where every chart is in the workflow">
<div className="grid grid-cols-2 gap-3 px-1 pb-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7">
          {pipelineData.map((stage) => (
          <PipelineCard key={stage.id} stage={stage} />
        ))}
      </div>
    </SectionCard>
  );
}
