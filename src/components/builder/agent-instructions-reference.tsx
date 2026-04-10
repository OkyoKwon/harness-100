"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import matter from "gray-matter";
import { useLocale } from "@/hooks/use-locale";
import { Modal, ModalBody, IconButton } from "@/components/ui";
import type { ReferenceAgent } from "@/lib/ai-assist";

interface AgentInstructionsReferenceProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly agents: ReadonlyArray<ReferenceAgent>;
  readonly loading: boolean;
}

export function AgentInstructionsReference({
  open,
  onClose,
  agents,
  loading,
}: AgentInstructionsReferenceProps) {
  const { t } = useLocale();
  const [selectedIdx, setSelectedIdx] = useState(0);

  return (
    <Modal open={open} onClose={onClose} ariaLabelledBy="ref-modal-title">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500 shrink-0" aria-hidden="true">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <h3 id="ref-modal-title" className="text-base font-semibold text-[var(--foreground)]">
            {t("builder.agent.referenceTitle")}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {agents.length > 0 && (
            <select
              value={selectedIdx}
              onChange={(e) => setSelectedIdx(Number(e.target.value))}
              className="text-sm rounded border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] px-2 py-1"
              aria-label={t("builder.agent.referenceSelect")}
            >
              {agents.map((agent, idx) => (
                <option key={`${agent.harnessId}-${agent.name}`} value={idx}>
                  {agent.name} — {agent.harnessName}
                </option>
              ))}
            </select>
          )}
          <IconButton ariaLabel={t("a11y.close")} onClick={onClose}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </IconButton>
        </div>
      </div>

      {/* Body */}
      <ModalBody>
        {loading ? (
          <div className="animate-pulse space-y-3 py-4">
            <div className="h-5 w-1/3 rounded bg-[var(--muted)]" />
            <div className="h-4 w-full rounded bg-[var(--muted)]" />
            <div className="h-4 w-4/5 rounded bg-[var(--muted)]" />
            <div className="h-4 w-2/3 rounded bg-[var(--muted)]" />
          </div>
        ) : agents.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
            {t("builder.agent.referenceNoAgents")}
          </p>
        ) : (
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {matter(agents[selectedIdx].rawMd).content}
            </ReactMarkdown>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
}
