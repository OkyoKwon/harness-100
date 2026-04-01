"use client";

import { useState, useCallback } from "react";
import type { Agent, Harness } from "@/lib/types";
import { generateAgentMd, generateSkillMd } from "@/lib/zip-builder";
import { MarkdownViewer } from "@/components/common/markdown-viewer";

interface AgentListProps {
  readonly agents: ReadonlyArray<Agent>;
  readonly harness: Harness;
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

interface MdViewerState {
  readonly title: string;
  readonly content: string;
}

export function AgentList({ agents, harness }: AgentListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    agents.length > 0 ? agents[0].id : null,
  );
  const [mdViewer, setMdViewer] = useState<MdViewerState | null>(null);

  const handleToggle = useCallback((agentId: string) => {
    setExpandedId((prev) => (prev === agentId ? null : agentId));
  }, []);

  const handleViewAgentMd = useCallback((agent: Agent) => {
    const rawContent = harness.rawFiles?.agents?.[agent.id];
    setMdViewer({
      title: `${agent.name} — 에이전트 마크다운`,
      content: rawContent ?? generateAgentMd(agent),
    });
  }, [harness]);

  const handleViewSkillMd = useCallback(() => {
    const mainSkillKey = Object.keys(harness.rawFiles?.skills ?? {}).find(
      (k) => k.startsWith(harness.slug + "/"),
    );
    const rawContent = mainSkillKey ? harness.rawFiles?.skills?.[mainSkillKey] : undefined;
    setMdViewer({
      title: `${harness.skill.name} — 스킬 마크다운`,
      content: rawContent ?? generateSkillMd(harness),
    });
  }, [harness]);

  const handleCloseMd = useCallback(() => {
    setMdViewer(null);
  }, []);

  return (
    <>
      <div className="space-y-2">
        {agents.map((agent) => {
          const isExpanded = expandedId === agent.id;
          const emoji = getAgentEmoji(agent.role, agent.name);

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
                  <p className="text-sm leading-relaxed text-[var(--card-foreground)]">
                    {agent.description}
                  </p>

                  {agent.tools.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-1.5 text-xs font-medium text-[var(--muted-foreground)]">
                        도구
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
                        의존성
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {agent.dependencies.join(", ")}
                      </p>
                    </div>
                  )}

                  {agent.outputTemplate && (
                    <div className="mt-3">
                      <p className="mb-1.5 text-xs font-medium text-[var(--muted-foreground)]">
                        산출물 템플릿
                      </p>
                      <pre className="overflow-x-auto rounded-md bg-[var(--code-bg)] p-3 text-xs leading-relaxed text-[var(--code-fg)]">
                        {agent.outputTemplate}
                      </pre>
                    </div>
                  )}

                  {/* MD 보기 버튼 */}
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleViewAgentMd(agent)}
                      className="rounded-md border border-[var(--border)] bg-[var(--secondary)] px-3 py-1.5 text-xs font-medium text-[var(--secondary-foreground)] hover:bg-[var(--muted)] transition-base focus-ring"
                    >
                      MD 보기
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* 스킬 마크다운 보기 버튼 */}
        <button
          type="button"
          onClick={handleViewSkillMd}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-medium text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-base focus-ring"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          스킬 마크다운 보기
        </button>

        {/* 확장 스킬 버튼들 */}
        {harness.skill.extensionSkills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {harness.skill.extensionSkills.map((extSkill) => {
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
                      title: `${extSkill.name} — 확장 스킬`,
                      content: rawContent,
                    })
                  }
                  className="flex items-center gap-1.5 rounded-lg border border-dashed border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-medium text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-base focus-ring"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {extSkill.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 마크다운 뷰어 모달 */}
      <MarkdownViewer
        title={mdViewer?.title ?? ""}
        content={mdViewer?.content ?? ""}
        open={mdViewer !== null}
        onClose={handleCloseMd}
      />
    </>
  );
}
