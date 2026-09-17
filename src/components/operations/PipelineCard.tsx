import {
  CheckCircle2,
  CircleHelp,
  Clock,
  FileSearch,
  FolderOpen,
  Layers,
  Repeat,
  type LucideIcon,
} from "lucide-react";
import type { PipelineStageData, PipelineTone } from "../../types/operations";
import { TrendTag } from "./TrendTag";

const iconByStage: Record<string, LucideIcon> = {
  unallocated: Layers,
  open: FolderOpen,
  "in-progress": Clock,
  "pending-clarification": CircleHelp,
  "qa-review": FileSearch,
  "re-assigned": Repeat,
  completed: CheckCircle2,
};

const toneClasses: Record<PipelineTone, { bg: string; border: string; text: string; icon: string }> = {
  neutral: {
    bg: "bg-[var(--color-neutral-soft)]",
    border: "border-[var(--color-border-strong)]",
    text: "text-[var(--color-ink)]",
    icon: "text-[var(--color-ink-soft)]",
  },
  accent: {
    bg: "bg-[var(--color-accent-softer)]",
    border: "border-[#f3d2b8]",
    text: "text-[var(--color-ink)]",
    icon: "text-[var(--color-accent)]",
  },
  amber: {
    bg: "bg-[var(--color-amber-soft)]",
    border: "border-[#f2ddaa]",
    text: "text-[var(--color-ink)]",
    icon: "text-[var(--color-amber)]",
  },
  info: {
    bg: "bg-[var(--color-info-soft)]",
    border: "border-[#c9d8f4]",
    text: "text-[var(--color-ink)]",
    icon: "text-[var(--color-info)]",
  },
  danger: {
    bg: "bg-[var(--color-danger-soft)]",
    border: "border-[#f2c3ac]",
    text: "text-[var(--color-ink)]",
    icon: "text-[var(--color-danger)]",
  },
  success: {
    bg: "bg-[var(--color-success-soft)]",
    border: "border-[#b9e0c8]",
    text: "text-[var(--color-ink)]",
    icon: "text-[var(--color-success)]",
  },
 darkyellow: {
  bg: "bg-[#FFF7EB]",
  border: "border-[#9C5905]/20",
  text: "text-[var(--color-ink)]",
  icon: "text-[#9C5905]",
},

reassigned: {
  bg: "bg-[#FFFBE4]",
  border: "border-[#BF9C0F]/20",
  text: "text-[var(--color-ink)]",
  icon: "text-[#BF9C0F]",
},


};

export function PipelineCard({ stage }: { stage: PipelineStageData }) {
  const Icon = iconByStage[stage.id] ?? Layers;
  const tone = toneClasses[stage.tone];

  return (
    <div
      className={`flex min-w-0 flex-1 flex-col justify-between rounded-2xl border ${tone.border} ${tone.bg} p-4`}
    >
      {/* Label + Icon */}
      <div className="flex items-start justify-between">
        <p className="text-sm text-[var(--color-ink-soft)]">
          {stage.label}
        </p>

        <Icon
          className={`h-6 w-6 ${tone.icon}`}
          strokeWidth={2}
          aria-hidden="true"
        />
      </div>

      {/* Value + Trend */}
      <div className="mt-3">
        <p className="text-2xl font-semibold leading-none text-[var(--color-ink)]">
          {stage.value.toLocaleString()}
        </p>

        {stage.trend && (
          <div className="mt-2">
            <TrendTag
              trend={{
                direction: stage.trend.direction,
                label: stage.percentLabel,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}