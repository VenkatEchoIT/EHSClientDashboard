import { getPipelineData } from "../../services/operationsService";

const pipelineData = getPipelineData();
import { PipelineCard } from "./PipelineCard";
import { SectionCard } from "./SectionCard";



export function ChartPipeline() {
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
