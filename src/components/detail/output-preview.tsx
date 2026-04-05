"use client";

import type { Harness } from "@/lib/types";
import { useLocale } from "@/hooks/use-locale";

interface OutputPreviewProps {
  readonly harness: Harness;
}

function extractOutputTitle(template: string): string {
  const firstLine = template.trim().split("\n")[0] ?? "";
  return firstLine.replace(/^[#\-*\s]+/, "").trim();
}

export function OutputPreview({ harness }: OutputPreviewProps) {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      {/* Outputs */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">{t("detail.outputs")}</h3>
        <div className="space-y-1.5">
          {harness.agents.map((agent) => (
            <div
              key={agent.id}
              className="flex items-start gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
            >
              <span className="font-medium text-[var(--foreground)]">{agent.name}:</span>
              <span className="text-[var(--muted-foreground)]">
                {extractOutputTitle(agent.outputTemplate) || t("detail.outputsFallback")}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Frameworks */}
      {harness.frameworks.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
            {t("detail.frameworks")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {harness.frameworks.map((fw) => (
              <span
                key={fw}
                className="rounded-full bg-[var(--badge-framework-bg)] px-3 py-1 text-xs font-medium text-[var(--badge-framework-fg)]"
              >
                {fw}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
