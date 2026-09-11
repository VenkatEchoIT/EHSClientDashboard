import type { ReactNode } from "react";

interface QualitySectionCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function QualitySectionCard({
  title,
  subtitle,
  action,
  children,
  className = "",
}: QualitySectionCardProps) {
  return (
    <section
      className={`rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-6 shadow-[0_2px_8px_rgba(36,33,29,0.10)] ${className}`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border-soft)] pb-4">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-ink)]">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              {subtitle}
            </p>
          )}
        </div>

        {action}
      </div>

      <div className="pt-5">
        {children}
      </div>
    </section>
  );
}