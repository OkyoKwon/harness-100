"use client";

import type { Harness } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocale } from "@/hooks/use-locale";

interface CompositionPreviewProps {
  readonly merged: Harness | null;
  readonly loading: boolean;
  readonly selectedCount: number;
  readonly loadedHarnesses: ReadonlyArray<Harness>;
  readonly isAgentEnabled?: (agentId: string) => boolean;
  readonly onToggleAgent?: (agentId: string) => void;
  readonly onNext?: () => void;
  readonly onSkipToExport?: () => void;
}

interface HarnessCardProps {
  readonly harness: Harness;
  readonly isAgentEnabled?: (agentId: string) => boolean;
  readonly onToggleAgent?: (agentId: string) => void;
}

function HarnessCard({ harness, isAgentEnabled, onToggleAgent }: HarnessCardProps) {
  const { t } = useLocale();
  const hasToggle = isAgentEnabled !== undefined && onToggleAgent !== undefined;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-[var(--foreground)]">
          {harness.name}
        </span>
        <span className="rounded-full bg-[var(--secondary)] px-2 py-0.5 text-xs text-[var(--secondary-foreground)]">
          {t("composer.agentCount", { count: harness.agentCount })}
        </span>
      </div>
      <div className="space-y-1">
        {harness.agents.map((agent) => {
          const enabled = isAgentEnabled?.(agent.id) ?? true;
          const displayName = agent.name.replace(harness.name + " ", "");

          return hasToggle ? (
            <div
              key={agent.id}
              className={`flex items-center gap-2 rounded px-1.5 py-1 hover:bg-[var(--muted)] transition-all duration-200 ${
                enabled ? "" : "opacity-40"
              }`}
            >
              <Checkbox
                checked={enabled}
                onChange={() => onToggleAgent?.(agent.id)}
                label={displayName}
              />
            </div>
          ) : (
            <span
              key={agent.id}
              className="inline-block rounded bg-[var(--badge-tool-bg)] px-1.5 py-0.5 text-xs text-[var(--badge-tool-fg)] mr-1 mb-1"
            >
              {displayName}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function CompositionPreview({
  merged,
  loading,
  selectedCount,
  loadedHarnesses,
  isAgentEnabled,
  onToggleAgent,
  onNext,
  onSkipToExport,
}: CompositionPreviewProps) {
  const { t } = useLocale();

  return (
    <div className="flex h-full flex-col rounded-lg border border-[var(--border)] bg-[var(--card)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">
          {t("composer.previewTitle")}
        </h2>
        {merged && selectedCount > 0 && !loading && onNext && (
          <div className="flex items-center gap-2">
            {onSkipToExport && (
              <button
                type="button"
                onClick={onSkipToExport}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-base focus-ring"
              >
                {t("composer.skipToExport")}
              </button>
            )}
            <button
              type="button"
              onClick={onNext}
              className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-[var(--primary-foreground)] hover:brightness-110 active:brightness-95 transition-base focus-ring"
            >
              {t("composer.next")} &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
          </div>
        ) : !merged || selectedCount === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-[var(--muted-foreground)]">
            <span className="mb-3 text-4xl">&#x1F9E9;</span>
            <p className="text-sm">{t("composer.selectPrompt")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[var(--secondary)] px-2.5 py-0.5 text-xs font-medium text-[var(--secondary-foreground)]">
                {t("composer.harnessCount", { count: loadedHarnesses.length })}
              </span>
              <span className="rounded-full bg-[var(--secondary)] px-2.5 py-0.5 text-xs font-medium text-[var(--secondary-foreground)]">
                {t("composer.totalAgents", { count: merged.agentCount })}
              </span>
              {merged.frameworks.length > 0 && (
                <span className="rounded-full bg-[var(--badge-framework-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--badge-framework-fg)]">
                  {t("composer.frameworkCount", { count: [...new Set(merged.frameworks)].length })}
                </span>
              )}
            </div>

            {/* Harness cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {loadedHarnesses.map((harness) => (
                <HarnessCard
                  key={harness.id}
                  harness={harness}
                  isAgentEnabled={isAgentEnabled}
                  onToggleAgent={onToggleAgent}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
