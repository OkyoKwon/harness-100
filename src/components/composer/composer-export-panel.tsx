"use client";

import type { Harness, Modification } from "@/lib/types";
import { CompletionBanner } from "@/components/common/completion-banner";
import { ConflictModal } from "@/components/setup/conflict-modal";
import { useZipDownload } from "@/hooks/use-zip-download";
import { useLocalSetup } from "@/hooks/use-local-setup";
import { useLocale } from "@/hooks/use-locale";

interface ComposerExportPanelProps {
  readonly merged: Harness;
  readonly modifications: ReadonlyArray<Modification>;
  readonly enabledAgentCount: number;
  readonly changeCount: number;
  readonly onBack: () => void;
}

export function ComposerExportPanel({
  merged,
  modifications,
  enabledAgentCount,
  changeCount,
  onBack,
}: ComposerExportPanelProps) {
  const { locale, t } = useLocale();
  const { status: zipStatus, download: downloadZip } = useZipDownload();
  const {
    status: setupStatus,
    result: setupResult,
    setup: setupLocal,
    conflictReport,
    resolveConflicts,
    cancelConflicts,
  } = useLocalSetup();

  const handleSetup = () => setupLocal(merged, modifications, locale);
  const handleZip = () => downloadZip(merged, modifications, locale);

  const setupInProgress = setupStatus === "selecting" || setupStatus === "writing" || setupStatus === "confirming";

  return (
    <div className="flex h-full flex-col rounded-lg border border-[var(--border)] bg-[var(--card)]">
      {/* Conflict modal */}
      {conflictReport && (
        <ConflictModal
          open={setupStatus === "confirming"}
          conflicts={conflictReport.conflicts}
          onResolve={resolveConflicts}
          onCancel={cancelConflicts}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">
          {t("composer.step.export")}
        </h2>
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-base focus-ring"
        >
          {t("composer.back")}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Summary stats */}
        <div className="mb-6 flex flex-wrap gap-3">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-center">
            <div className="text-2xl font-bold text-[var(--primary)]">{enabledAgentCount}</div>
            <div className="text-xs text-[var(--muted-foreground)]">{t("composer.step.select")}</div>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-center">
            <div className="text-2xl font-bold text-[var(--foreground)]">{changeCount}</div>
            <div className="text-xs text-[var(--muted-foreground)]">{t("composer.step.customize")}</div>
          </div>
          {merged.frameworks.length > 0 && (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-center">
              <div className="text-2xl font-bold text-[var(--foreground)]">
                {[...new Set(merged.frameworks)].length}
              </div>
              <div className="text-xs text-[var(--muted-foreground)]">Frameworks</div>
            </div>
          )}
        </div>

        {/* Completion banners */}
        {setupStatus === "complete" && setupResult && (
          <div className="mb-4">
            <CompletionBanner
              type="setup"
              path={setupResult.path}
              slug={merged.slug}
              filesWritten={setupResult.filesWritten}
              filesSkipped={setupResult.filesSkipped}
              filesMerged={setupResult.filesMerged}
            />
          </div>
        )}
        {zipStatus === "complete" && (
          <div className="mb-4">
            <CompletionBanner type="zip" slug={merged.slug} />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleSetup}
            disabled={setupInProgress}
            className="flex-1 rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-medium text-[var(--primary-foreground)] hover:brightness-110 active:brightness-95 disabled:opacity-50 transition-base focus-ring inline-flex items-center justify-center gap-2"
          >
            {setupInProgress && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--primary-foreground)]/30 border-t-[var(--primary-foreground)]" />
            )}
            {setupInProgress ? t("action.setupInProgress") : t("composer.setupComposed")}
          </button>
          <button
            type="button"
            onClick={handleZip}
            disabled={zipStatus === "building"}
            className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] px-6 py-3 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] active:bg-[var(--secondary)] disabled:opacity-50 transition-base focus-ring inline-flex items-center justify-center gap-2"
          >
            {zipStatus === "building" && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--muted)] border-t-[var(--foreground)]" />
            )}
            {zipStatus === "building" ? t("action.zipBuilding") : t("action.zip")}
          </button>
        </div>
      </div>
    </div>
  );
}
