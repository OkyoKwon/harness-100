"use client";

import type { Harness } from "@/lib/types";
import { CopyCliButton } from "@/components/actions/copy-cli-button";

interface OutputPreviewProps {
  readonly harness: Harness;
}

function extractOutputTitle(template: string): string {
  const firstLine = template.trim().split("\n")[0] ?? "";
  // Strip leading markdown headings or dashes
  return firstLine.replace(/^[#\-*\s]+/, "").trim() || "산출물";
}

export function OutputPreview({ harness }: OutputPreviewProps) {
  const setupCommands = `cp -r ${harness.slug}/.claude/ your-project/.claude/\ncd your-project\nclaude --skill ${harness.slug}`;

  return (
    <div className="space-y-6">
      {/* Outputs */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">산출물</h3>
        <ul className="space-y-1.5">
          {harness.agents.map((agent) => (
            <li key={agent.id} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 text-[var(--primary)]">&#8226;</span>
              <span className="text-[var(--card-foreground)]">
                <span className="font-medium">{agent.name}:</span>{" "}
                {extractOutputTitle(agent.outputTemplate)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Frameworks */}
      {harness.frameworks.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
            적용 프레임워크
          </h3>
          <div className="flex flex-wrap gap-2">
            {harness.frameworks.map((fw) => (
              <span
                key={fw}
                className="rounded-full bg-[var(--badge-framework-bg)] px-3 py-1 text-xs font-medium text-[var(--badge-framework-fg)]"
              >
                {fw}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Usage */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">사용법</h3>
        <div className="relative">
          <pre className="overflow-x-auto rounded-lg bg-[var(--code-bg)] p-4 text-xs leading-relaxed text-[var(--code-fg)]">
            {setupCommands}
          </pre>
          <div className="absolute right-2 top-2">
            <CopyCliButton text={setupCommands} />
          </div>
        </div>
      </section>
    </div>
  );
}
