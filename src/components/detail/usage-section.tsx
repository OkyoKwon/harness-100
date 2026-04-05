"use client";

import type { Harness } from "@/lib/types";
import { useLocale } from "@/hooks/use-locale";

interface UsageSectionProps {
  readonly harness: Harness;
}

export function UsageSection({ harness }: UsageSectionProps) {
  const { t } = useLocale();
  const triggerConditions = harness.skill.triggerConditions;
  const modes = harness.skill.modes;
  const hasMultipleModes = modes.length > 1;

  if (triggerConditions.length === 0 && !hasMultipleModes) return null;

  return (
    <div className="mt-8 border-t border-[var(--border)] pt-8 space-y-6">
      {/* Request Examples — inline chips */}
      {triggerConditions.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
            {t("detail.tryAsking")}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {triggerConditions.map((condition) => (
              <span
                key={condition}
                className="rounded-full border border-[var(--border)] bg-[var(--secondary)] px-2.5 py-1 text-xs text-[var(--muted-foreground)]"
              >
                &ldquo;{condition}&rdquo;
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Execution Modes — 3-column grid on full width */}
      {hasMultipleModes && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
            {t("detail.executionModes")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {modes.map((mode) => (
              <div
                key={mode.name}
                className="rounded-lg border border-[var(--border)] bg-[var(--secondary)] p-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {mode.name}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {t("detail.modeAgents", { count: mode.agents.length })}
                  </span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mb-2">
                  &ldquo;{mode.triggerPattern}&rdquo;
                </p>
                <div className="flex flex-wrap gap-1">
                  {mode.agents.map((agent) => (
                    <span
                      key={agent}
                      className="rounded bg-[var(--card)] px-2 py-0.5 text-[10px] text-[var(--muted-foreground)] border border-[var(--border)]"
                    >
                      {agent}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
