import { cn } from "@/lib/cn";
import { useLocale } from "@/hooks/use-locale";
import type { CustomAgent } from "@/lib/custom-harness-types";

interface BuilderAgentSidebarProps {
  readonly agents: ReadonlyArray<CustomAgent>;
  readonly selectedId: string | null;
  readonly onSelect: (id: string) => void;
  readonly onToggle: (id: string) => void;
  readonly onRemove: (id: string) => void;
  readonly onMoveUp: (index: number) => void;
  readonly onMoveDown: (index: number) => void;
}

export function BuilderAgentSidebar({
  agents,
  selectedId,
  onSelect,
  onToggle,
  onRemove,
  onMoveUp,
  onMoveDown,
}: BuilderAgentSidebarProps) {
  const { t } = useLocale();

  if (agents.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-[var(--muted-foreground)]">
        {t("builder.agent.noAgents")}
      </div>
    );
  }

  return (
    <ul className="space-y-1" role="listbox" aria-label="Agents">
      {agents.map((agent, i) => (
        <li
          key={agent.id}
          role="option"
          aria-selected={agent.id === selectedId}
          className={cn(
            "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-base",
            agent.id === selectedId
              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "hover:bg-[var(--muted)]",
            !agent.enabled && "opacity-50",
          )}
          onClick={() => onSelect(agent.id)}
        >
          {/* Enable/disable toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(agent.id);
            }}
            className={cn(
              "h-4 w-4 shrink-0 rounded border transition-base",
              agent.enabled
                ? "bg-green-500 border-green-500"
                : "bg-transparent border-[var(--muted-foreground)]",
            )}
            aria-label={agent.enabled ? "Disable agent" : "Enable agent"}
          />

          {/* Name + Reused badge */}
          <span className="flex-1 truncate flex items-center gap-1">
            {agent.name || (
              <span className="italic text-[var(--muted-foreground)]">
                {t("builder.agent.name")}
              </span>
            )}
            {agent.sourceRef && (
              <span className={cn(
                "inline-flex shrink-0 rounded px-1 py-0.5 text-[9px] font-medium leading-none",
                agent.id === selectedId
                  ? "bg-white/20 text-white"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
              )}>
                {t("builder.agent.reused")}
              </span>
            )}
          </span>

          {/* Reorder + Delete (visible on hover/focus) */}
          <span className="hidden group-hover:flex items-center gap-0.5">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onMoveUp(i); }}
              disabled={i === 0}
              className="rounded p-0.5 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30"
              aria-label="Move up"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onMoveDown(i); }}
              disabled={i === agents.length - 1}
              className="rounded p-0.5 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30"
              aria-label="Move down"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(agent.id); }}
              className="rounded p-0.5 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
              aria-label={t("builder.agent.delete")}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </span>
        </li>
      ))}
    </ul>
  );
}
