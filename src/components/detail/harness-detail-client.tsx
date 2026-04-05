"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Harness } from "@/lib/types";
import { loadHarnessDetail } from "@/lib/harness-loader";
import { useFavorites } from "@/hooks/use-favorites";
import { useZipDownload } from "@/hooks/use-zip-download";
import { useLocalSetup } from "@/hooks/use-local-setup";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/hooks/use-locale";
import { AgentList } from "@/components/detail/agent-list";
import { WorkflowDiagram } from "@/components/detail/workflow-diagram";
import { OutputPreview } from "@/components/detail/output-preview";
import { CompletionBanner } from "@/components/common/completion-banner";
import { ConflictModal } from "@/components/setup/conflict-modal";
import { CATEGORIES } from "@/lib/constants";
import { buildCliCommand } from "@/lib/cli";

type LoadingState = "loading" | "loaded" | "error";

function getCategoryLabel(category: string, locale: string): string {
  const found = CATEGORIES.find((c) => c.slug === category);
  if (!found) return category;
  return locale === "en" ? found.labelEn : found.label;
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 py-8">
      <div className="mb-6 h-4 w-20 rounded bg-[var(--muted)]" />
      <div className="mb-2 h-8 w-64 rounded bg-[var(--muted)]" />
      <div className="mb-6 h-4 w-96 rounded bg-[var(--muted)]" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-[var(--muted)]" />
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-[300px] rounded-lg bg-[var(--muted)]" />
          <div className="h-40 rounded-lg bg-[var(--muted)]" />
        </div>
      </div>
    </div>
  );
}

export function HarnessDetailClient({ idParam }: { readonly idParam: string }) {
  const id = Number(idParam);

  const [harness, setHarness] = useState<Harness | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const { toggle: toggleFavorite, isFavorite } = useFavorites();
  const { status: zipStatus, errorMessage: zipError, download: downloadZip } = useZipDownload();
  const {
    status: setupStatus,
    result: setupResult,
    supported: setupSupported,
    setup: runSetup,
    conflictReport,
    resolveConflicts,
    cancelConflicts,
  } = useLocalSetup();
  const { addToast } = useToast();
  const { t, locale } = useLocale();

  // Toast notifications for setup/zip completion
  useEffect(() => {
    if (setupStatus === "complete" && setupResult) {
      addToast(t("toast.setupComplete", { count: setupResult.filesWritten }), "success");
    }
  }, [setupStatus, setupResult, addToast]);

  useEffect(() => {
    if (zipStatus === "complete") {
      addToast(t("toast.zipComplete"), "success");
    }
    if (zipStatus === "error") {
      addToast(zipError ?? t("error.zipFailed"), "error");
    }
  }, [zipStatus, zipError, addToast]);

  useEffect(() => {
    if (Number.isNaN(id) || id < 1) {
      setLoadingState("error");
      setErrorMessage(t("detail.invalidId"));
      return;
    }

    let cancelled = false;
    setLoadingState("loading");

    loadHarnessDetail(id, locale)
      .then((data) => {
        if (!cancelled) {
          setHarness(data);
          setLoadingState("loaded");
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadingState("error");
          setErrorMessage(
            err instanceof Error
              ? err.message
              : t("detail.loadError"),
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, locale]);

  if (loadingState === "loading") {
    return <DetailSkeleton />;
  }

  if (loadingState === "error" || harness === null) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link
          href="/"
          className="mb-4 inline-block text-sm text-[var(--primary)] hover:opacity-80 transition-base focus-ring rounded"
        >
          &larr; {t("detail.backToList")}
        </Link>
        <div className="rounded-lg border border-[var(--danger-border)] bg-[var(--danger-bg)] p-6 text-center">
          <p className="text-sm text-[var(--danger-foreground)]">
            {errorMessage || t("detail.cannotLoad")}
          </p>
        </div>
      </div>
    );
  }

  const favorited = isFavorite(harness.id);
  const setupDisabled = !setupSupported || setupStatus === "selecting" || setupStatus === "writing" || setupStatus === "confirming";
  const setupLabel = setupStatus === "selecting" || setupStatus === "writing" || setupStatus === "confirming" ? t("action.setupInProgress") : t("action.setup");
  const zipLabel = zipStatus === "building" ? t("action.zipBuilding") : t("action.zip");

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/"
          className="mb-4 inline-block text-sm text-[var(--primary)] hover:opacity-80 transition-base focus-ring rounded"
        >
          &larr; {t("detail.backToList")}
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              {harness.name}
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
              {harness.description}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--secondary)] px-2.5 py-0.5 text-xs font-medium text-[var(--secondary-foreground)]">
                {getCategoryLabel(harness.category, locale)}
              </span>
              <span className="text-xs text-[var(--border)]">|</span>
              <span className="text-xs text-[var(--muted-foreground)]">
                {t("detail.agentCount", { count: harness.agentCount })}
              </span>
              {harness.frameworks.length > 0 && (
                <>
                  <span className="text-xs text-[var(--border)]">|</span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {harness.frameworks.slice(0, 3).join(", ")}
                    {harness.frameworks.length > 3 && " ..."}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => toggleFavorite(harness.id)}
              className={`rounded-lg border px-3 py-2 text-sm transition-base focus-ring ${
                favorited
                  ? "border-[var(--warning-border)] bg-[var(--warning-bg)] text-[var(--warning-foreground)]"
                  : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
              }`}
              aria-label={favorited ? t("favorite.remove") : t("favorite.add")}
            >
              {favorited ? "★" : "☆"}
            </button>

            <button
              type="button"
              onClick={() => runSetup(harness, undefined, locale)}
              disabled={setupDisabled}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:brightness-110 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 transition-base focus-ring inline-flex items-center gap-1.5"
            >
              {(setupStatus === "selecting" || setupStatus === "writing" || setupStatus === "confirming") && (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--primary-foreground)]/30 border-t-[var(--primary-foreground)]" />
              )}
              {setupLabel}
            </button>

            <button
              type="button"
              onClick={() => downloadZip(harness, undefined, locale)}
              disabled={zipStatus === "building"}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] active:bg-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-50 transition-base focus-ring inline-flex items-center gap-1.5"
            >
              {zipStatus === "building" && (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--muted)] border-t-[var(--foreground)]" />
              )}
              {zipLabel}
            </button>
          </div>
        </div>
      </div>

      {/* Conflict resolution modal */}
      {conflictReport && (
        <ConflictModal
          open={setupStatus === "confirming"}
          conflicts={conflictReport.conflicts}
          onResolve={resolveConflicts}
          onCancel={cancelConflicts}
        />
      )}

      {/* Completion banners (kept for CLI command display) */}
      {setupStatus === "complete" && setupResult && (
        <div className="mb-6">
          <CompletionBanner
            type="setup"
            slug={harness.slug}
            path={setupResult.path}
            filesWritten={setupResult.filesWritten}
            filesSkipped={setupResult.filesSkipped}
            filesMerged={setupResult.filesMerged}
          />
        </div>
      )}
      {zipStatus === "complete" && (
        <div className="mb-6">
          <CompletionBanner
            type="zip"
            slug={harness.slug}
          />
        </div>
      )}

      {/* 세팅 가이드 */}
      <div className="mb-6 rounded-lg border border-[var(--info-border)] bg-[var(--info-bg)] px-4 py-3">
        <p className="text-sm font-semibold text-[var(--info-foreground)] mb-2">{t("setup.guideTitle")}</p>
        <ol className="space-y-1 text-xs text-[var(--info-foreground)] list-decimal list-inside">
          <li>{t("setup.step1")}</li>
          <li>{t("setup.step2")}</li>
          <li>
            {t("setup.step3prefix")}{" "}
            <code className="rounded bg-[var(--badge-tool-bg)] px-1 font-mono">
              {buildCliCommand(harness.slug)}
            </code>{" "}
            {t("setup.step3suffix")}
          </li>
        </ol>
        <p className="mt-2 text-[10px] text-[var(--info-foreground)] opacity-70">
          {t("setup.tip")}
        </p>
      </div>

      {/* Main content: two-panel on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left panel: Agent list */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
            {t("detail.agents", { count: harness.agents.length })}
          </h2>
          <AgentList agents={harness.agents} harness={harness} />
        </section>

        {/* Right panel: Workflow + Outputs */}
        <section className="space-y-8">
          <div>
            <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
              {t("detail.workflow")}
            </h2>
            <WorkflowDiagram agents={harness.agents} />
          </div>

          <div>
            <OutputPreview harness={harness} />
          </div>
        </section>
      </div>

    </div>
  );
}
