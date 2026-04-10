import { cn } from "@/lib/cn";
import { useLocale } from "@/hooks/use-locale";
import type { ExecutionStep } from "@/lib/types";
import type { CustomAgent } from "@/lib/custom-harness-types";

interface ExecutionOrderEditorProps {
  readonly executionOrder: ReadonlyArray<ExecutionStep>;
  readonly agents: ReadonlyArray<CustomAgent>;
  readonly onToggleParallel: (agentId: string) => void;
  readonly onReorder: (fromIndex: number, toIndex: number) => void;
}

export function ExecutionOrderEditor({
  executionOrder,
  agents,
  onToggleParallel,
  onReorder,
}: ExecutionOrderEditorProps) {
  const { t } = useLocale();

  const getAgentName = (agentId: string) =>
    agents.find((a) => a.id === agentId)?.name || agentId;

  if (executionOrder.length === 0) {
    return (
      <p className="text-sm text-[var(--muted-foreground)] py-4">
        {t("builder.agent.noAgents")}
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {executionOrder.map((step, i) => (
        <div
          key={step.agentId}
          className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2"
        >
          {/* Order number */}
          <span className="text-xs font-mono text-[var(--muted-foreground)] w-6 text-center">
            {i + 1}
          </span>

          {/* Agent name */}
          <span className="flex-1 text-sm text-[var(--foreground)] truncate">
            {getAgentName(step.agentId)}
          </span>

          {/* Parallel toggle */}
          {i > 0 && (
            <button
              type="button"
              onClick={() => onToggleParallel(step.agentId)}
              className={cn(
                "rounded px-2 py-0.5 text-xs font-medium transition-base",
                step.parallel
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)]",
              )}
            >
              {t("builder.skill.parallel")}
            </button>
          )}

          {/* Reorder buttons */}
          <div className="flex gap-0.5">
            <button
              type="button"
              onClick={() => i > 0 && onReorder(i, i - 1)}
              disabled={i === 0}
              className="rounded p-1 hover:bg-[var(--muted)] disabled:opacity-30 transition-base"
              aria-label="Move up"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => i < executionOrder.length - 1 && onReorder(i, i + 1)}
              disabled={i === executionOrder.length - 1}
              className="rounded p-1 hover:bg-[var(--muted)] disabled:opacity-30 transition-base"
              aria-label="Move down"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>

          {/* Dependencies indicator */}
          {step.dependsOn.length > 0 && (
            <span className="text-[10px] text-[var(--muted-foreground)]" title={`Depends on: ${step.dependsOn.map(getAgentName).join(", ")}`}>
              dep: {step.dependsOn.length}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
