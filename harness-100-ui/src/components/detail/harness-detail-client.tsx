"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { Harness } from "@/lib/types";
import { loadHarnessDetail } from "@/lib/harness-loader";
import { useFavorites } from "@/hooks/use-favorites";
import { useZipDownload } from "@/hooks/use-zip-download";
import { useLocalSetup } from "@/hooks/use-local-setup";
import { useToast } from "@/hooks/use-toast";
import { CustomizePanel } from "@/components/customizer/customize-panel";
import { AgentList } from "@/components/detail/agent-list";
import { WorkflowDiagram } from "@/components/detail/workflow-diagram";
import { OutputPreview } from "@/components/detail/output-preview";
import { CompletionBanner } from "@/components/common/completion-banner";
import { StickyActionBar } from "@/components/detail/sticky-action-bar";
import { CATEGORIES } from "@/lib/constants";

type LoadingState = "loading" | "loaded" | "error";

function getCategoryLabel(category: string): string {
  const found = CATEGORIES.find((c) => c.slug === category);
  return found ? found.label : category;
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
  const [customizing, setCustomizing] = useState(false);

  const { toggle: toggleFavorite, isFavorite } = useFavorites();
  const { status: zipStatus, download: downloadZip } = useZipDownload();
  const {
    status: setupStatus,
    result: setupResult,
    supported: setupSupported,
    setup: runSetup,
  } = useLocalSetup();
  const { addToast } = useToast();

  const actionButtonsRef = useRef<HTMLDivElement>(null);

  // Toast notifications for setup/zip completion
  useEffect(() => {
    if (setupStatus === "complete" && setupResult) {
      addToast(`세팅 완료 — ${setupResult.filesWritten}개 파일 생성됨`, "success");
    }
  }, [setupStatus, setupResult, addToast]);

  useEffect(() => {
    if (zipStatus === "complete") {
      addToast("ZIP 다운로드 완료", "success");
    }
  }, [zipStatus, addToast]);

  useEffect(() => {
    if (Number.isNaN(id) || id < 1) {
      setLoadingState("error");
      setErrorMessage("올바르지 않은 하네스 ID입니다.");
      return;
    }

    let cancelled = false;
    setLoadingState("loading");

    loadHarnessDetail(id)
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
              : "하네스를 불러오는 데 실패했습니다.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

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
          &larr; 목록
        </Link>
        <div className="rounded-lg border border-[var(--danger-border)] bg-[var(--danger-bg)] p-6 text-center">
          <p className="text-sm text-[var(--danger-foreground)]">
            {errorMessage || "하네스를 불러올 수 없습니다."}
          </p>
        </div>
      </div>
    );
  }

  const favorited = isFavorite(harness.id);
  const setupDisabled = !setupSupported || setupStatus === "selecting" || setupStatus === "writing";
  const setupLabel = setupStatus === "selecting" || setupStatus === "writing" ? "세팅 중..." : "세팅 →";
  const zipLabel = zipStatus === "building" ? "생성 중..." : "ZIP ↓";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/"
          className="mb-4 inline-block text-sm text-[var(--primary)] hover:opacity-80 transition-base focus-ring rounded"
        >
          &larr; 목록
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
                {getCategoryLabel(harness.category)}
              </span>
              <span className="text-xs text-[var(--border)]">|</span>
              <span className="text-xs text-[var(--muted-foreground)]">
                에이전트 {harness.agentCount}개
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
          <div ref={actionButtonsRef} className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => toggleFavorite(harness.id)}
              className={`rounded-lg border px-3 py-2 text-sm transition-base focus-ring ${
                favorited
                  ? "border-[var(--warning-border)] bg-[var(--warning-bg)] text-[var(--warning-foreground)]"
                  : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
              }`}
              aria-label={favorited ? "즐겨찾기 해제" : "즐겨찾기"}
            >
              {favorited ? "★" : "☆"}
            </button>

            <button
              type="button"
              onClick={() => runSetup(harness)}
              disabled={setupDisabled}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:brightness-110 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 transition-base focus-ring"
            >
              {setupLabel}
            </button>

            <button
              type="button"
              onClick={() => downloadZip(harness)}
              disabled={zipStatus === "building"}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] active:bg-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-50 transition-base focus-ring"
            >
              {zipLabel}
            </button>
          </div>
        </div>
      </div>

      {/* Completion banners (kept for CLI command display) */}
      {setupStatus === "complete" && setupResult && (
        <div className="mb-6">
          <CompletionBanner
            type="setup"
            slug={harness.slug}
            path={setupResult.path}
            filesWritten={setupResult.filesWritten}
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

      {/* Customization panel */}
      {customizing ? (
        <CustomizePanel harness={harness} onClose={() => setCustomizing(false)} />
      ) : (
        <>
          {/* Main content: two-panel on desktop, stacked on mobile */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left panel: Agent list */}
            <section>
              <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
                에이전트 ({harness.agents.length})
              </h2>
              <AgentList agents={harness.agents} harness={harness} />
            </section>

            {/* Right panel: Workflow + Outputs */}
            <section className="space-y-8">
              <div>
                <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
                  워크플로우
                </h2>
                <WorkflowDiagram agents={harness.agents} />
              </div>

              <div>
                <OutputPreview harness={harness} />
              </div>
            </section>
          </div>

          {/* Customize button */}
          <div className="mt-8 border-t border-[var(--border)] pt-6">
            <button
              type="button"
              onClick={() => setCustomizing(true)}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] active:bg-[var(--secondary)] transition-base focus-ring"
            >
              수정해서 받기
            </button>
          </div>
        </>
      )}

      {/* Sticky action bar */}
      <StickyActionBar
        name={harness.name}
        favorited={favorited}
        onToggleFavorite={() => toggleFavorite(harness.id)}
        onSetup={() => runSetup(harness)}
        onDownloadZip={() => downloadZip(harness)}
        setupDisabled={setupDisabled}
        zipDisabled={zipStatus === "building"}
        setupLabel={setupLabel}
        zipLabel={zipLabel}
        triggerRef={actionButtonsRef}
      />
    </div>
  );
}
