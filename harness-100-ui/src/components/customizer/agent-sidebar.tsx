"use client";

import type { Agent } from "@/lib/types";

interface AgentSidebarProps {
  readonly agents: ReadonlyArray<Agent>;
  readonly selectedId: string | null;
  readonly isAgentEnabled: (agentId: string) => boolean;
  readonly onSelect: (agentId: string) => void;
  readonly onToggle: (agentId: string) => void;
}

export function AgentSidebar({
  agents,
  selectedId,
  isAgentEnabled,
  onSelect,
  onToggle,
}: AgentSidebarProps) {
  return (
    <div className="space-y-1">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
        에이전트 목록
      </h3>
      <ul className="space-y-1">
        {agents.map((agent) => {
          const enabled = isAgentEnabled(agent.id);
          const selected = selectedId === agent.id;
          return (
            <li key={agent.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggle(agent.id)}
                className="shrink-0 text-base focus-ring rounded"
                aria-label={enabled ? `${agent.name} 비활성화` : `${agent.name} 활성화`}
              >
                {enabled ? "✅" : "☐"}
              </button>
              <button
                type="button"
                onClick={() => onSelect(agent.id)}
                className={`w-full truncate rounded px-2 py-1.5 text-left text-sm transition-base focus-ring ${
                  selected
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "text-[var(--foreground)] hover:bg-[var(--muted)]"
                } ${!enabled ? "opacity-50 line-through" : ""}`}
              >
                {agent.name}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
