"use client";

import { useState, useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import matter from "gray-matter";
import type { Locale } from "@/lib/locale";
import type { Agent, Harness, ExecutionStep } from "@/lib/types";
import { generateAgentMd } from "@/lib/zip-builder";
import { groupAgentsByStep } from "@/lib/execution-order";
import { MarkdownViewer } from "@/components/common/markdown-viewer";
import { useLocale } from "@/hooks/use-locale";

interface AgentListProps {
  readonly agents: ReadonlyArray<Agent>;
  readonly harness: Harness;
  readonly executionOrder: ReadonlyArray<ExecutionStep>;
  readonly onViewSkillMd: () => void;
}

const ROLE_EMOJI_MAP: ReadonlyArray<readonly [ReadonlyArray<string>, string]> = [
  [["planner", "plan", "기획", "설계"], "🎯"],
  [["writer", "write", "작성", "콘텐츠"], "✍️"],
  [["analyst", "analy", "분석", "research"], "🔍"],
  [["design", "디자인", "ui", "ux"], "🎨"],
  [["data", "데이터", "수집", "처리"], "📊"],
  [["edit", "편집", "검수", "review"], "📝"],
  [["security", "보안", "검증"], "🛡️"],
  [["code", "개발", "develop", "implement"], "💻"],
  [["test", "테스트", "qa"], "🧪"],
  [["deploy", "배포", "운영"], "🚀"],
];

function getAgentEmoji(role: string, name: string): string {
  const searchText = `${role} ${name}`.toLowerCase();
  for (const [keywords, emoji] of ROLE_EMOJI_MAP) {
    if (keywords.some((kw) => searchText.includes(kw))) {
      return emoji;
    }
  }
  return "🤖";
}

function getAgentMarkdownBody(agent: Agent, harness: Harness, locale: Locale): string {
  const rawContent = harness.rawFiles?.agents?.[agent.id];
  const source = rawContent ?? generateAgentMd(agent, locale);
  const parsed = matter(source);
  return parsed.content.trim();
}

interface MdViewerState {
  readonly title: string;
  readonly content: string;
}

export function AgentList({ agents, harness, executionOrder, onViewSkillMd }: AgentListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [mdViewer, setMdViewer] = useState<MdViewerState | null>(null);
  const { locale, t } = useLocale();

  const handleToggle = useCallback((agentId: string) => {
    setExpandedId((prev) => (prev === agentId ? null : agentId));
  }, []);

  const handleCloseMd = useCallback(() => {
    setMdViewer(null);
  }, []);

  const markdownBodies = useMemo(() => {
    const map = new Map<string, string>();
    for (const agent of agents) {
      map.set(agent.id, getAgentMarkdownBody(agent, harness, locale));
    }
    return map;
  }, [agents, harness, locale]);

  const stepGroups = useMemo(
    () => groupAgentsByStep(agents, executionOrder),
    [agents, executionOrder],
  );

  // Build extension skill lookup by targetAgent
  const extensionsByAgent = useMemo(() => {
    const map = new Map<string, typeof harness.skill.extensionSkills>();
    for (const ext of harness.skill.extensionSkills) {
      const existing = map.get(ext.targetAgent) ?? [];
      map.set(ext.targetAgent, [...existing, ext]);
    }
    return map;
  }, [harness.skill.extensionSkills]);

  const renderAgentCard = (agent: Agent) => {
    const isExpanded = expandedId === agent.id;
    const emoji = getAgentEmoji(agent.role, agent.name);
    const agentExtensions = extensionsByAgent.get(agent.id) ?? [];

    return (
      <div
        key={agent.id}
        className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)]"
      >
        <button
          type="button"
          onClick={() => handleToggle(agent.id)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        >
          <span className="text-xl" role="img" aria-label={agent.role}>
            {emoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              {agent.name}
            </p>
            <p className="truncate text-xs text-[var(--muted-foreground)]">{agent.role}</p>
          </div>
          <svg
            className={`h-4 w-4 shrink-0 text-[var(--muted-foreground)] transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isExpanded && (
          <div className="border-t border-[var(--border)] px-4 py-3">
            {agent.tools.length > 0 && (
              <div className="mt-3">
                <p className="mb-1.5 text-xs font-medium text-[var(--muted-foreground)]">
                  {t("detail.tools")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {agent.tools.map((tool) => (
                    <span
                      key={tool}
                      className="rounded-full bg-[var(--badge-tool-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--badge-tool-fg)]"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {agent.dependencies.length > 0 && (
              <div className="mt-3">
                <p className="mb-1 text-xs font-medium text-[var(--muted-foreground)]">
                  {t("detail.dependencies")}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {agent.dependencies.join(", ")}
                </p>
              </div>
            )}

            {/* Extension skills inline */}
            {agentExtensions.length > 0 && (
              <div className="mt-3">
                <p className="mb-1.5 text-xs font-medium text-[var(--muted-foreground)]">
                  {t("detail.extensionSkill")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {agentExtensions.map((extSkill) => {
                    const rawKey = Object.keys(harness.rawFiles?.skills ?? {}).find(
                      (k) => k.startsWith(extSkill.name + "/"),
                    );
                    const rawContent = rawKey ? harness.rawFiles?.skills?.[rawKey] : undefined;
                    if (!rawContent) return null;
                    return (
                      <button
                        key={extSkill.name}
                        type="button"
                        onClick={() =>
                          setMdViewer({
                            title: `${extSkill.name} — ${t("detail.extensionSkill")}`,
                            content: rawContent,
                          })
                        }
                        className="flex items-center gap-1.5 rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-base focus-ring"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {extSkill.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {markdownBodies.get(agent.id) && (
              <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 p-3">
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {markdownBodies.get(agent.id)!}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="space-y-4">
        {stepGroups.map((group) => (
          <div key={group.step}>
            {/* Step divider */}
            <div className="mb-2 flex items-center gap-2">
              <div className="h-4 w-0.5 rounded-full bg-[var(--primary)]" />
              <span className="text-xs font-medium text-[var(--muted-foreground)]">
                {group.parallel
                  ? t("detail.parallelStep", { n: group.step })
                  : t("detail.step", { n: group.step })}
              </span>
              <div className="flex-1 border-t border-[var(--border)]" />
            </div>
            {/* Agent cards */}
            <div className="space-y-2">
              {group.agents.map(renderAgentCard)}
            </div>
          </div>
        ))}
      </div>

      <MarkdownViewer
        title={mdViewer?.title ?? ""}
        content={mdViewer?.content ?? ""}
        open={mdViewer !== null}
        onClose={handleCloseMd}
      />
    </>
  );
}
