"use client";

import { useState, useCallback } from "react";
import type { Agent } from "@/lib/types";

interface AgentListProps {
  readonly agents: ReadonlyArray<Agent>;
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

export function AgentList({ agents }: AgentListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    agents.length > 0 ? agents[0].id : null,
  );

  const handleToggle = useCallback((agentId: string) => {
    setExpandedId((prev) => (prev === agentId ? null : agentId));
  }, []);

  return (
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
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
