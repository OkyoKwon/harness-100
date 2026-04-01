"use client";

import type { Harness } from "@/lib/types";
import { CompletionBanner } from "@/components/common/completion-banner";
import { useZipDownload } from "@/hooks/use-zip-download";
import { useLocalSetup } from "@/hooks/use-local-setup";

interface CompositionPreviewProps {
  readonly merged: Harness | null;
  readonly loading: boolean;
  readonly selectedCount: number;
  readonly loadedHarnesses: ReadonlyArray<Harness>;
}

function HarnessCard({ harness }: { readonly harness: Harness }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-[var(--foreground)]">
          {harness.name}
        </span>
        <span className="rounded-full bg-[var(--secondary)] px-2 py-0.5 text-xs text-[var(--secondary-foreground)]">
          {harness.agentCount}명
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
  const { status: zipStatus, download: downloadZip } = useZipDownload();
  const {
    status: setupStatus,
    result: setupResult,
    setup: setupLocal,
  } = useLocalSetup();

  const handleSetup = () => { if (merged) setupLocal(merged); };
  const handleZip = () => { if (merged) downloadZip(merged); };

  return (
    <div className="flex h-full flex-col rounded-lg border border-[var(--border)] bg-[var(--card)]">
      {/* Header + Actions */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">
          조합 결과 미리보기
        </h2>
        {merged && selectedCount > 0 && !loading && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSetup}
              disabled={setupStatus === "selecting" || setupStatus === "writing"}
              className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-[var(--primary-foreground)] hover:brightness-110 active:brightness-95 disabled:opacity-50 transition-base focus-ring"
            >
              {setupStatus === "selecting" || setupStatus === "writing" ? "세팅 중..." : "조합 세팅 →"}
            </button>
            <button
              type="button"
              onClick={handleZip}
              disabled={zipStatus === "building"}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)] active:bg-[var(--secondary)] disabled:opacity-50 transition-base focus-ring"
            >
              {zipStatus === "building" ? "생성 중..." : "ZIP ↓"}
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
            <p className="text-sm">왼쪽에서 하네스를 선택하세요</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[var(--secondary)] px-2.5 py-0.5 text-xs font-medium text-[var(--secondary-foreground)]">
                하네스 {loadedHarnesses.length}개
              </span>
              <span className="rounded-full bg-[var(--secondary)] px-2.5 py-0.5 text-xs font-medium text-[var(--secondary-foreground)]">
                에이전트 총 {merged.agentCount}명
              </span>
              {merged.frameworks.length > 0 && (
                <span className="rounded-full bg-[var(--badge-framework-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--badge-framework-fg)]">
                  프레임워크 {[...new Set(merged.frameworks)].length}개
                </span>
              )}
            </div>

            {/* Completion banners */}
            {setupStatus === "complete" && setupResult && (
              <CompletionBanner
                type="setup"
                harnessName={merged.name}
                path={setupResult.path}
                slug={merged.slug}
                filesWritten={setupResult.filesWritten}
              />
            )}
            {zipStatus === "complete" && (
              <CompletionBanner
                type="zip"
                harnessName={merged.name}
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
