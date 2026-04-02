"use client";

import type { Harness } from "@/lib/types";
import { CompletionBanner } from "@/components/common/completion-banner";
import { ConflictModal } from "@/components/setup/conflict-modal";
import { useZipDownload } from "@/hooks/use-zip-download";
import { useLocalSetup } from "@/hooks/use-local-setup";
import { useLocale } from "@/hooks/use-locale";

interface CompositionPreviewProps {
  readonly merged: Harness | null;
  readonly loading: boolean;
  readonly selectedCount: number;
  readonly loadedHarnesses: ReadonlyArray<Harness>;
}

function HarnessCard({ harness }: { readonly harness: Harness }) {
  const { t } = useLocale();
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
      <div className="flex flex-wrap gap-1">
        {harness.agents.map((agent) => (
          <span
            key={agent.id}
            className="rounded bg-[var(--badge-tool-bg)] px-1.5 py-0.5 text-xs text-[var(--badge-tool-fg)]"
          >
            {agent.name.replace(harness.name + " ", "")}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CompositionPreview({
  merged,
  loading,
  selectedCount,
  loadedHarnesses,
}: CompositionPreviewProps) {
  const { t } = useLocale();
  const { status: zipStatus, download: downloadZip } = useZipDownload();
  const {
    status: setupStatus,
    result: setupResult,
    setup: setupLocal,
    conflictReport,
    resolveConflicts,
    cancelConflicts,
  } = useLocalSetup();

  const handleSetup = () => { if (merged) setupLocal(merged); };
  const handleZip = () => { if (merged) downloadZip(merged); };

  return (
    <div className="flex h-full flex-col rounded-lg border border-[var(--border)] bg-[var(--card)]">
      {/* Header + Actions */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">
          {t("composer.previewTitle")}
        </h2>
        {merged && selectedCount > 0 && !loading && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSetup}
              disabled={setupStatus === "selecting" || setupStatus === "writing" || setupStatus === "confirming"}
              className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-[var(--primary-foreground)] hover:brightness-110 active:brightness-95 disabled:opacity-50 transition-base focus-ring"
            >
              {setupStatus === "selecting" || setupStatus === "writing" || setupStatus === "confirming" ? t("action.setupInProgress") : t("composer.setupComposed")}
            </button>
            <button
              type="button"
              onClick={handleZip}
              disabled={zipStatus === "building"}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)] active:bg-[var(--secondary)] disabled:opacity-50 transition-base focus-ring"
            >
              {zipStatus === "building" ? t("action.zipBuilding") : t("action.zip")}
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
            <span className="mb-3 text-4xl">🧩</span>
            <p className="text-sm">{t("composer.selectPrompt")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Conflict resolution modal */}
            {conflictReport && (
              <ConflictModal
                open={setupStatus === "confirming"}
                conflicts={conflictReport.conflicts}
                onResolve={resolveConflicts}
                onCancel={cancelConflicts}
              />
            )}

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

            {/* Completion banners */}
            {setupStatus === "complete" && setupResult && (
              <CompletionBanner
                type="setup"
                path={setupResult.path}
                slug={merged.slug}
                filesWritten={setupResult.filesWritten}
                filesSkipped={setupResult.filesSkipped}
                filesMerged={setupResult.filesMerged}
              />
            )}
            {zipStatus === "complete" && (
              <CompletionBanner
                type="zip"

                slug={merged.slug}
              />
            )}

            {/* Harness cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {loadedHarnesses.map((harness) => (
                <HarnessCard key={harness.id} harness={harness} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
