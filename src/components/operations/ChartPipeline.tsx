import { pipelineData } from "../../data/operationsData";
import { PipelineCard } from "./PipelineCard";
import { SectionCard } from "./SectionCard";

export function ChartPipeline() {
  return (
    <SectionCard title="Chart Pipeline" subtitle="Where every chart is in the workflow">
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 md:grid md:grid-cols-4 md:overflow-visible xl:grid-cols-7">
        {pipelineData.map((stage) => (
          <PipelineCard key={stage.id} stage={stage} />
        ))}
      </div>
    </SectionCard>
  );
}
