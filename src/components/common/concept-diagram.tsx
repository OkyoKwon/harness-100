"use client";

import { useLocale } from "@/hooks/use-locale";

interface ConceptDiagramProps {
  readonly compact?: boolean;
}

export function ConceptRelationshipDiagram({
  compact = false,
}: ConceptDiagramProps) {
  const { t } = useLocale();

  if (compact) {
    return (
      <div className="mt-3 flex items-center gap-2 text-[10px] text-[var(--info-foreground)]">
        <span className="rounded border border-[var(--info-border)] bg-[var(--background)] px-2 py-1 font-semibold">
          {t("concepts.diagram.skill")}
        </span>
        <span className="text-[var(--muted-foreground)]">
          → {t("concepts.diagram.orchestrates")} →
        </span>
        <span className="rounded border border-[var(--info-border)] bg-[var(--background)] px-2 py-1 font-semibold">
          {t("concepts.diagram.agents")}
        </span>
        <span className="text-[var(--muted-foreground)]">
          ← {t("concepts.diagram.enhances")} ←
        </span>
        <span className="rounded border border-[var(--info-border)] bg-[var(--background)] px-2 py-1 font-semibold">
          {t("concepts.diagram.extensionSkills")}
        </span>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4">
      <p className="mb-3 text-center text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
        {t("concepts.diagram.harness")}
      </p>

      <div className="flex flex-col items-center gap-3">
        {/* Skill */}
        <div className="rounded-md border border-[var(--primary)] bg-[var(--background)] px-4 py-2 text-center">
          <p className="text-sm font-semibold text-[var(--primary)]">
            {t("concepts.diagram.skill")}
          </p>
          <p className="text-[10px] text-[var(--muted-foreground)]">
            executionOrder · modes · triggers
          </p>
        </div>

        {/* Arrow: orchestrates */}
        <div className="flex flex-col items-center text-[var(--muted-foreground)]">
          <span className="text-[10px]">{t("concepts.diagram.orchestrates")}</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Agents row */}
        <div className="flex flex-wrap justify-center gap-2">
          {["Agent A", "Agent B", "Agent C"].map((name) => (
            <div
              key={name}
              className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-center"
            >
              <p className="text-xs font-medium text-[var(--foreground)]">
                {name}
              </p>
            </div>
          ))}
        </div>

        {/* Arrow: enhances */}
        <div className="flex flex-col items-center text-[var(--muted-foreground)]">
          <svg className="h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          <span className="text-[10px]">{t("concepts.diagram.enhances")}</span>
        </div>

        {/* Extension Skills */}
        <div className="flex flex-wrap justify-center gap-2">
          {["Ext. Skill 1", "Ext. Skill 2"].map((name) => (
            <div
              key={name}
              className="rounded-md border border-dashed border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-center"
            >
              <p className="text-xs text-[var(--muted-foreground)]">{name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
