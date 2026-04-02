"use client";

import type { Modification } from "@/lib/types";
import { useLocale } from "@/hooks/use-locale";

interface AgentEditFormProps {
  readonly agentId: string;
  readonly getModifiedValue: (agentId: string, field: Modification["field"]) => string | boolean;
  readonly updateAgent: (agentId: string, field: Modification["field"], value: string | boolean) => void;
}

export function AgentEditForm({ agentId, getModifiedValue, updateAgent }: AgentEditFormProps) {
  const { t } = useLocale();
  const name = getModifiedValue(agentId, "name") as string;
  const role = getModifiedValue(agentId, "role") as string;
  const outputTemplate = getModifiedValue(agentId, "outputTemplate") as string;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
        {t("customizer.editArea")}
      </h3>

      <div>
        <label
          htmlFor="agent-name"
          className="mb-1 block text-sm font-medium text-[var(--foreground)]"
        >
          {t("customizer.name")}
        </label>
        <input
          id="agent-name"
          type="text"
          value={name}
          onChange={(e) => updateAgent(agentId, "name", e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-base focus-ring"
        />
      </div>

      <div>
        <label
          htmlFor="agent-role"
          className="mb-1 block text-sm font-medium text-[var(--foreground)]"
        >
          {t("customizer.role")}
        </label>
        <textarea
          id="agent-role"
          rows={3}
          value={role}
          onChange={(e) => updateAgent(agentId, "role", e.target.value)}
          className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-base focus-ring"
        />
      </div>

      <div>
        <label
          htmlFor="agent-output"
          className="mb-1 block text-sm font-medium text-[var(--foreground)]"
        >
          {t("customizer.outputTemplate")}
        </label>
        <textarea
          id="agent-output"
          rows={5}
          value={outputTemplate}
          onChange={(e) => updateAgent(agentId, "outputTemplate", e.target.value)}
          className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-base focus-ring"
        />
      </div>
    </div>
  );
}
