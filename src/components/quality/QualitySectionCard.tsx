import type { ReactNode } from "react";

interface QualitySectionCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  legend?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function QualitySectionCard({
  title,
  subtitle,
  action,
  legend,
  children,
  className = "",
}: QualitySectionCardProps) {
  return (
    <section
      className={`rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-6 ${className}`}
    >
        <div className="flex items-start justify-between gap-3">
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

        {legend && (
          <div className="mt-3 flex flex-wrap items-center gap-4">
            {legend}
          </div>
        )}

      <div className="pt-5">
        {children}
      </div>
    </section>
  );
}