"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Harness } from "@/lib/types";
import { loadHarnessDetail } from "@/lib/harness-loader";
import { useFavorites } from "@/hooks/use-favorites";
import { useZipDownload } from "@/hooks/use-zip-download";
import { useLocalSetup } from "@/hooks/use-local-setup";
import { AgentList } from "@/components/detail/agent-list";
import { WorkflowDiagram } from "@/components/detail/workflow-diagram";
import { OutputPreview } from "@/components/detail/output-preview";
import { CompletionBanner } from "@/components/common/completion-banner";
import { CATEGORIES } from "@/lib/constants";

type LoadingState = "loading" | "loaded" | "error";

function getCategoryLabel(category: string): string {
  const found = CATEGORIES.find((c) => c.slug === category);
  return found ? found.label : category;
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 py-8">
      <div className="mb-6 h-4 w-20 rounded bg-gray-200" />
      <div className="mb-2 h-8 w-64 rounded bg-gray-200" />
      <div className="mb-6 h-4 w-96 rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-gray-200" />
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-[300px] rounded-lg bg-gray-200" />
          <div className="h-40 rounded-lg bg-gray-200" />
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
  const { status: zipStatus, download: downloadZip } = useZipDownload();
  const {
    status: setupStatus,
    result: setupResult,
    supported: setupSupported,
    setup: runSetup,
  } = useLocalSetup();

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
          className="mb-4 inline-block text-sm text-blue-600 hover:text-blue-800"
        >
          &larr; 목록
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">
            {errorMessage || "하네스를 불러올 수 없습니다."}
          </p>
        </div>
      </div>
    );
  }

  const favorited = isFavorite(harness.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/"
          className="mb-4 inline-block text-sm text-blue-600 transition-colors hover:text-blue-800"
        >
          &larr; 목록
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {harness.name}
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              {harness.description}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                {getCategoryLabel(harness.category)}
              </span>
              <span className="text-xs text-gray-400">|</span>
              <span className="text-xs text-gray-500">
                에이전트 {harness.agentCount}개
              </span>
              {harness.frameworks.length > 0 && (
                <>
                  <span className="text-xs text-gray-400">|</span>
                  <span className="text-xs text-gray-500">
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
              className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                favorited
                  ? "border-yellow-300 bg-yellow-50 text-yellow-700"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
              }`}
              aria-label={favorited ? "즐겨찾기 해제" : "즐겨찾기"}
            >
              {favorited ? "★" : "☆"}
            </button>

            <button
              type="button"
              onClick={() => runSetup(harness)}
              disabled={
                !setupSupported ||
                setupStatus === "selecting" ||
                setupStatus === "writing"
              }
              className="rounded-lg border border-blue-200 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {setupStatus === "selecting" || setupStatus === "writing"
                ? "세팅 중..."
                : "세팅 →"}
            </button>

            <button
              type="button"
              onClick={() => downloadZip(harness)}
              disabled={zipStatus === "building"}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {zipStatus === "building" ? "생성 중..." : "ZIP ↓"}
            </button>
          </div>
        </div>
      </div>

      {/* Completion banners */}
      {setupStatus === "complete" && setupResult && (
        <div className="mb-6">
          <CompletionBanner
            type="setup"
            harnessName={harness.name}
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
            harnessName={harness.name}
            slug={harness.slug}
          />
        </div>
      )}

      {/* Main content: two-panel on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left panel: Agent list */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            에이전트 ({harness.agents.length})
          </h2>
          <AgentList agents={harness.agents} />
        </section>

        {/* Right panel: Workflow + Outputs */}
        <section className="space-y-8">
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              워크플로우
            </h2>
            <WorkflowDiagram agents={harness.agents} />
          </div>

          <div>
            <OutputPreview harness={harness} />
          </div>
        </section>
      </div>

      {/* Phase 2 placeholder */}
      <div className="mt-8 border-t border-gray-200 pt-6">
        <div className="relative inline-block">
          <button
            type="button"
            disabled
            className="rounded-lg border border-gray-200 bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-400 cursor-not-allowed"
            title="준비 중"
          >
            수정해서 받기
          </button>
          <span className="ml-2 text-xs text-gray-400">(준비 중)</span>
        </div>
      </div>
    </div>
  );
}
