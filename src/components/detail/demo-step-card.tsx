"use client";

import type { DemoStep, Agent } from "@/lib/types";

const ROLE_EMOJI_MAP: ReadonlyArray<readonly [string, string]> = [
  ["planner", "\uD83C\uDFAF"],
  ["strategist", "\uD83C\uDFAF"],
  ["writer", "\u270D\uFE0F"],
  ["script", "\u270D\uFE0F"],
  ["analyst", "\uD83D\uDD0D"],
  ["reviewer", "\u2705"],
  ["designer", "\uD83C\uDFA8"],
  ["developer", "\uD83D\uDCBB"],
  ["tester", "\uD83E\uDDEA"],
  ["optimizer", "\u26A1"],
  ["seo", "\u26A1"],
  ["manager", "\uD83D\uDCCB"],
  ["specialist", "\uD83D\uDD27"],
  ["auditor", "\uD83D\uDD0E"],
  ["builder", "\uD83D\uDEE0\uFE0F"],
];

function getAgentEmoji(role: string): string {
  const lower = role.toLowerCase();
  for (const [keyword, emoji] of ROLE_EMOJI_MAP) {
    if (lower.includes(keyword)) return emoji;
  }
  return "\uD83E\uDD16";
}

interface DemoStepCardProps {
  readonly step: DemoStep;
  readonly agent: Agent | undefined;
  readonly toolsLabel: string;
  readonly outputLabel: string;
}

export function DemoStepCard({
  step,
  agent,
  toolsLabel,
  outputLabel,
}: DemoStepCardProps) {
  const role = agent?.role ?? step.agentId;
  const emoji = getAgentEmoji(role);

  return (
    <div className="rounded-lg border border-[var(--primary)] bg-[var(--card)] p-4 transition-all duration-300 shadow-sm">
      {/* Agent header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg" aria-hidden="true">
          {emoji}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--foreground)] truncate">
            {agent?.name ?? step.agentId}
          </p>
          <p className="text-xs text-[var(--muted)] truncate">{role}</p>
        </div>
      </div>

      {/* Action description */}
      <p className="text-sm text-[var(--foreground)] mb-3">{step.action}</p>

      {/* Tools used */}
      {step.toolsUsed.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] font-medium text-[var(--muted)] mb-1 uppercase tracking-wider">
            {toolsLabel}
          </p>
          <div className="flex flex-wrap gap-1">
            {step.toolsUsed.map((tool) => (
              <span
                key={tool}
                className="inline-block rounded-full bg-[var(--badge-tool-bg)] px-2 py-0.5 text-[10px] text-[var(--badge-tool-text)]"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Output preview */}
      <div>
        <p className="text-[10px] font-medium text-[var(--muted)] mb-1 uppercase tracking-wider">
          {outputLabel}
        </p>
        <div className="rounded-md bg-[var(--background)] border border-[var(--border)] px-3 py-2">
          <p className="text-xs font-medium text-[var(--foreground)] mb-1">
            {step.output.title}
          </p>
          <pre className="text-[10px] text-[var(--muted)] whitespace-pre-wrap font-mono leading-relaxed overflow-hidden max-h-20">
            {step.output.snippet}
          </pre>
        </div>
      </div>
    </div>
  );
}
