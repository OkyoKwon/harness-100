"use client";

import type { Harness } from "@/lib/types";
import { CopyCliButton } from "@/components/actions/copy-cli-button";
import { buildCliCommand } from "@/lib/cli";

interface OutputPreviewProps {
  readonly harness: Harness;
}

function extractOutputTitle(template: string): string {
  const firstLine = template.trim().split("\n")[0] ?? "";
  // Strip leading markdown headings or dashes
  return firstLine.replace(/^[#\-*\s]+/, "").trim() || "산출물";
}

export function OutputPreview({ harness }: OutputPreviewProps) {
  const cliCommand = buildCliCommand(harness.slug);
  const setupCommands = `cp -r ${harness.slug}/.claude/ your-project/.claude/\ncd your-project\n${cliCommand}`;

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

        {/* Mode-specific usage examples */}
        {harness.skill.modes.length > 0 && (
          <div className="mt-4">
            <h4 className="mb-2 text-xs font-semibold text-[var(--muted-foreground)]">
              요청 예시
            </h4>
            <ul className="space-y-1.5">
              {harness.skill.modes.map((mode) => (
                <li
                  key={mode.name}
                  className="flex items-start gap-2 text-xs text-[var(--card-foreground)]"
                >
                  <span className="mt-0.5 shrink-0 text-[var(--primary)]">&#8250;</span>
                  <span>
                    <span className="font-medium">{mode.name}</span>
                    {" — "}
                    <span className="text-[var(--muted-foreground)]">
                      &ldquo;{mode.triggerPattern}&rdquo;
                    </span>
                    <span className="ml-1 text-[var(--muted-foreground)]">
                      ({mode.agents.length}명)
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
