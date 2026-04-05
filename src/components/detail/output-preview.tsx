"use client";

import { useState } from "react";
import type { Harness } from "@/lib/types";
import { useLocale } from "@/hooks/use-locale";

interface OutputPreviewProps {
  readonly harness: Harness;
}

const TRIGGER_VISIBLE_COUNT = 4;

function extractOutputTitle(template: string): string {
  const firstLine = template.trim().split("\n")[0] ?? "";
  return firstLine.replace(/^[#\-*\s]+/, "").trim();
}

export function OutputPreview({ harness }: OutputPreviewProps) {
  const { t } = useLocale();
  const [triggersExpanded, setTriggersExpanded] = useState(false);

  const modes = harness.skill.modes;
  const hasMultipleModes = modes.length > 1;
  const triggerConditions = harness.skill.triggerConditions;
  const hasMoreTriggers = triggerConditions.length > TRIGGER_VISIBLE_COUNT;
  const visibleTriggers = triggersExpanded
    ? triggerConditions
    : triggerConditions.slice(0, TRIGGER_VISIBLE_COUNT);

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

      {/* Request Examples (trigger conditions) — inline chips */}
      {triggerConditions.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
            {t("detail.tryAsking")}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {visibleTriggers.map((condition) => (
              <span
                key={condition}
                className="rounded-full border border-[var(--border)] bg-[var(--secondary)] px-2.5 py-1 text-xs text-[var(--muted-foreground)]"
              >
                &ldquo;{condition}&rdquo;
              </span>
            ))}
            {hasMoreTriggers && (
              <button
                type="button"
                onClick={() => setTriggersExpanded((prev) => !prev)}
                className="rounded-full border border-dashed border-[var(--border)] px-2.5 py-1 text-xs text-[var(--primary)] hover:bg-[var(--muted)] transition-base focus-ring"
              >
                {triggersExpanded
                  ? t("a11y.close")
                  : `+${triggerConditions.length - TRIGGER_VISIBLE_COUNT}`}
              </button>
            )}
          </div>
        </section>
      )}

      {/* Execution Modes — 2-column grid */}
      {hasMultipleModes && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
            {t("detail.executionModes")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
