"use client";

import { useState } from "react";
import type { Harness } from "@/lib/types";
import { useModifications } from "@/hooks/use-modifications";
import { useZipDownload } from "@/hooks/use-zip-download";
import { useLocalSetup } from "@/hooks/use-local-setup";
import { AgentSidebar } from "./agent-sidebar";
import { AgentEditForm } from "./agent-edit-form";

interface CustomizePanelProps {
  readonly harness: Harness;
  readonly onClose: () => void;
}

export function CustomizePanel({ harness, onClose }: CustomizePanelProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(
    harness.agents[0]?.id ?? null,
  );

  const {
    modifications,
    updateAgent,
    toggleAgent,
    isAgentEnabled,
    getModifiedValue,
    reset,
    hasChanges,
  } = useModifications(harness.agents);

  const { status: zipStatus, download: downloadZip } = useZipDownload();
  const { status: setupStatus, setup: runSetup } = useLocalSetup();

  const changeCount = modifications.length;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">
          수정 모드 &mdash; {harness.name}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reset}
            disabled={!hasChanges}
            className="rounded px-2.5 py-1 text-xs text-[var(--muted-foreground)] hover:bg-[var(--muted)] disabled:opacity-40 transition-base focus-ring"
          >
            원본 복원
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-base focus-ring"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-[240px_1fr]">
        <AgentSidebar
          agents={harness.agents}
          selectedId={selectedAgentId}
          isAgentEnabled={isAgentEnabled}
          onSelect={setSelectedAgentId}
          onToggle={toggleAgent}
        />

        <div>
          {selectedAgentId && isAgentEnabled(selectedAgentId) ? (
            <AgentEditForm
              agentId={selectedAgentId}
              getModifiedValue={getModifiedValue}
              updateAgent={updateAgent}
            />
          ) : selectedAgentId ? (
            <div className="flex h-full items-center justify-center text-sm text-[var(--muted-foreground)]">
              비활성화된 에이전트입니다.
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[var(--muted-foreground)]">
              에이전트를 선택해주세요.
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] px-4 py-3">
        <span className="text-xs text-[var(--muted-foreground)]">
          변경사항: {changeCount}개 수정됨
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reset}
            disabled={!hasChanges}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)] disabled:opacity-40 transition-base focus-ring"
          >
            원본 복원
          </button>

          <button
            type="button"
            onClick={() => runSetup(harness, modifications)}
            disabled={setupStatus === "selecting" || setupStatus === "writing"}
            className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-[var(--primary-foreground)] hover:brightness-110 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 transition-base focus-ring"
          >
            {setupStatus === "selecting" || setupStatus === "writing"
              ? "세팅 중..."
              : "수정본 세팅 →"}
          </button>

          <button
            type="button"
            onClick={() => downloadZip(harness, modifications)}
            disabled={zipStatus === "building"}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)] disabled:cursor-not-allowed disabled:opacity-50 transition-base focus-ring"
          >
            {zipStatus === "building" ? "생성 중..." : "수정본 ZIP ↓"}
          </button>
        </div>
      </div>
    </div>
  );
}
