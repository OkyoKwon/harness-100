"use client";

import { useLocale } from "@/hooks/use-locale";
import { HARNESS_TEMPLATES, type HarnessTemplate } from "@/lib/harness-templates";

interface BuilderEmptyStateProps {
  readonly onCreateNew: () => void;
  readonly onSelectTemplate: (template: HarnessTemplate) => void;
}

export function BuilderEmptyState({ onCreateNew, onSelectTemplate }: BuilderEmptyStateProps) {
  const { t } = useLocale();

  return (
    <section className="space-y-5">
      {/* Feature pills */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 dark:bg-violet-950/40 px-2.5 py-1 text-xs font-medium text-violet-700 dark:text-violet-300">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          {t("builder.feature.aiAssist")}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-950/40 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          {t("builder.feature.multiAgent")}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-950/40 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-300">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {t("builder.feature.exportReady")}
        </span>
      </div>

      {/* Section heading */}
      <div>
        <h3 className="text-base font-semibold text-[var(--foreground)]">
          {t("builder.getStarted")}
        </h3>
        <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
          {t("builder.getStartedDesc")}
        </p>
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {HARNESS_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelectTemplate(template)}
            className="group text-left rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden hover:border-[var(--primary)] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 active:scale-[0.99] transition-base focus-ring"
          >
            <div
              className="h-1"
              style={{ backgroundColor: template.color }}
              aria-hidden="true"
            />
            <div className="px-3.5 py-3 space-y-2">
              <h4 className="text-sm font-medium text-[var(--foreground)] group-hover:text-[var(--primary)] transition-base">
                {t(template.nameKey)}
              </h4>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                {t(template.descriptionKey)}
              </p>
              <div className="flex flex-wrap gap-1">
                {template.agentNames.map((name) => (
                  <span
                    key={name}
                    className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--muted-foreground)]"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <hr className="flex-1 border-[var(--border)]" />
        <span className="text-xs text-[var(--muted-foreground)]">{t("builder.or")}</span>
        <hr className="flex-1 border-[var(--border)]" />
      </div>

      {/* Start from scratch */}
      <button
        type="button"
        onClick={onCreateNew}
        className="w-full rounded-lg border border-dashed border-[var(--border)] py-3 text-sm font-medium text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 transition-base focus-ring"
      >
        + {t("builder.startFromScratch")}
      </button>
    </section>
  );
}
