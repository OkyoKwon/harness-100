"use client";

import { useState, useCallback } from "react";
import type { Harness } from "@/lib/types";
import { useLocale } from "@/hooks/use-locale";

interface OutputPreviewProps {
  readonly harness: Harness;
}

function extractOutputTitle(template: string): string {
  const firstLine = template.trim().split("\n")[0] ?? "";
  return firstLine.replace(/^[#\-*\s]+/, "").trim();
}

function TriggerChip({ text }: { readonly text: string }) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-3 py-1.5 text-xs text-[var(--foreground)] hover:border-[var(--primary)] hover:bg-[var(--card)] transition-base focus-ring cursor-copy"
      title={t("action.copy")}
    >
      <span className="text-[var(--primary)]">&ldquo;</span>
      {text}
      <span className="text-[var(--primary)]">&rdquo;</span>
      {copied && (
        <span className="ml-1 text-[var(--success-foreground,#22c55e)] text-[10px]">
          ✓
        </span>
      )}
    </button>
  );
}

export function OutputPreview({ harness }: OutputPreviewProps) {
  const { t } = useLocale();

  const triggers = harness.skill.triggerConditions;
  const modes = harness.skill.modes;
  const hasMultipleModes = modes.length > 1;

  return (
    <div className="space-y-6">
      {/* Outputs */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">{t("detail.outputs")}</h3>
        <ul className="space-y-1.5">
          {harness.agents.map((agent) => (
            <li key={agent.id} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 text-[var(--primary)]">&#8226;</span>
              <span className="text-[var(--card-foreground)]">
                <span className="font-medium">{agent.name}:</span>{" "}
                {extractOutputTitle(agent.outputTemplate) || t("detail.outputsFallback")}
              </span>
            </li>
          ))}
        </ul>
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

      {/* Trigger Conditions — "Try asking" */}
      {triggers.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
            {t("detail.tryAsking")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {triggers.map((trigger) => (
              <TriggerChip key={trigger} text={trigger.replace(/,\s*$/, "")} />
            ))}
          </div>
        </section>
      )}

      {/* Execution Modes — only when multiple modes exist */}
      {hasMultipleModes && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
            {t("detail.executionModes")}
          </h3>
          <div className="space-y-2">
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
