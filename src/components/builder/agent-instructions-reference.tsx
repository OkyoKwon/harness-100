"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import matter from "gray-matter";
import { useLocale } from "@/hooks/use-locale";
import type { ReferenceAgent } from "@/lib/ai-assist";

interface AgentInstructionsReferenceProps {
  readonly open: boolean;
  readonly agents: ReadonlyArray<ReferenceAgent>;
  readonly loading: boolean;
}

export function AgentInstructionsReference({
  open,
  agents,
  loading,
}: AgentInstructionsReferenceProps) {
  const { t } = useLocale();
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (!open) return null;

  if (loading) {
    return (
      <div className="mt-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 w-1/3 rounded bg-blue-200 dark:bg-blue-800" />
          <div className="h-3 w-full rounded bg-blue-100 dark:bg-blue-900" />
          <div className="h-3 w-2/3 rounded bg-blue-100 dark:bg-blue-900" />
        </div>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="mt-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4 text-sm text-[var(--muted-foreground)]">
        {t("builder.agent.referenceNoAgents")}
      </div>
    );
  }

  const selected = agents[selectedIdx];
  const parsed = matter(selected.rawMd);

  return (
    <div className="mt-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
      {/* Header with dropdown */}
      <div className="flex items-center gap-2 border-b border-blue-200 dark:border-blue-800 px-3 py-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500 shrink-0" aria-hidden="true">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
          {t("builder.agent.referenceTitle")}
        </span>
        <select
          value={selectedIdx}
          onChange={(e) => setSelectedIdx(Number(e.target.value))}
          className="ml-auto text-xs rounded border border-blue-200 dark:border-blue-700 bg-white dark:bg-[var(--card)] text-[var(--foreground)] px-2 py-1"
          aria-label={t("builder.agent.referenceSelect")}
        >
          {agents.map((agent, idx) => (
            <option key={`${agent.harnessId}-${agent.name}`} value={idx}>
              {agent.name} — {agent.harnessName}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto px-4 py-3">
        <div className="markdown-body text-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {parsed.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
