"use client";

import type { Harness } from "@/lib/types";
import { WorkflowDiagram } from "@/components/detail/workflow-diagram";
import { SetupButton } from "@/components/actions/setup-button";
import { ZipButton } from "@/components/actions/zip-button";
import { CompletionBanner } from "@/components/common/completion-banner";
import { useZipDownload } from "@/hooks/use-zip-download";
import { useLocalSetup } from "@/hooks/use-local-setup";

interface CompositionPreviewProps {
  readonly merged: Harness | null;
  readonly loading: boolean;
  readonly selectedCount: number;
}

function LoadingSpinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-64 flex-col items-center justify-center text-[var(--muted-foreground)]">
      <span className="mb-3 text-4xl">🧩</span>
      <p className="text-sm">왼쪽에서 하네스를 선택하세요</p>
    </div>
  );
}

function MergedAgentList({ merged }: { readonly merged: Harness }) {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-[var(--foreground)]">
        에이전트 목록
      </h3>
      <ul className="space-y-1">
        {merged.agents.map((agent) => (
          <li
            key={agent.id}
            className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-[var(--muted-foreground)]"
          >
            <span className="font-mono text-xs text-[var(--foreground)]">
              {agent.id}
            </span>
            <span className="text-[var(--border)]">·</span>
            <span>{agent.role}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CompositionPreview({
  merged,
  loading,
  selectedCount,
}: CompositionPreviewProps) {
  const { status: zipStatus, download: downloadZip } = useZipDownload();
  const {
    status: setupStatus,
    result: setupResult,
    setup: setupLocal,
  } = useLocalSetup();

  const handleSetup = () => {
    if (merged) {
      setupLocal(merged);
    }
  };

  const handleZip = () => {
    if (merged) {
      downloadZip(merged);
    }
  };

  const uniqueFrameworks = merged
    ? [...new Set(merged.frameworks)]
    : [];

  return (
    <div className="flex h-full flex-col rounded-lg border border-[var(--border)] bg-[var(--card)]">
      {/* Header */}
      <div className="border-b border-[var(--border)] px-4 py-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">
          조합 결과 미리보기
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <LoadingSpinner />
        ) : !merged || selectedCount === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {/* Stats */}
            <p className="text-sm text-[var(--muted-foreground)]">
              에이전트 {merged.agentCount}명 · 프레임워크{" "}
              {uniqueFrameworks.length}개
            </p>

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

            {/* Workflow diagram */}
            <WorkflowDiagram agents={merged.agents} />

            {/* Agent list */}
            <MergedAgentList merged={merged} />
          </div>
        )}
      </div>

      {/* Actions footer */}
      {merged && selectedCount > 0 && !loading && (
        <div className="flex items-center gap-2 border-t border-[var(--border)] px-4 py-3">
          <SetupButton
            onClick={handleSetup}
            disabled={setupStatus === "selecting" || setupStatus === "writing"}
          />
          <ZipButton
            onClick={handleZip}
            disabled={zipStatus === "building"}
          />
        </div>
      )}
    </div>
  );
}
