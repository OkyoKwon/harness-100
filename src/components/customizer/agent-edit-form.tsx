"use client";

import type { Modification } from "@/lib/types";
import { useLocale } from "@/hooks/use-locale";
import { validateAgentField } from "@/lib/validate-agent-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface AgentEditFormProps {
  readonly agentId: string;
  readonly getModifiedValue: (agentId: string, field: Modification["field"]) => string | boolean;
  readonly updateAgent: (agentId: string, field: Modification["field"], value: string | boolean) => void;
}

export function AgentEditForm({ agentId, getModifiedValue, updateAgent }: AgentEditFormProps) {
  const { t, locale } = useLocale();

  const name = getModifiedValue(agentId, "name") as string;
  const description = getModifiedValue(agentId, "description") as string;
  const role = getModifiedValue(agentId, "role") as string;
  const instructions = getModifiedValue(agentId, "instructions") as string;
  const outputTemplate = getModifiedValue(agentId, "outputTemplate") as string;

  const validLocale = locale === "en" ? "en" : "ko";

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
        {t("customizer.editArea")}
      </h3>

      <Input
        label={t("customizer.name")}
        value={name}
        onChange={(e) => updateAgent(agentId, "name", e.target.value)}
        errorMessage={validateAgentField("name", name, validLocale) ?? undefined}
      />

      <Textarea
        label={t("customizer.description")}
        rows={3}
        value={description}
        onChange={(e) => updateAgent(agentId, "description", e.target.value)}
        errorMessage={validateAgentField("description", description, validLocale) ?? undefined}
      />

      <Textarea
        label={t("customizer.role")}
        rows={3}
        value={role}
        onChange={(e) => updateAgent(agentId, "role", e.target.value)}
        errorMessage={validateAgentField("role", role, validLocale) ?? undefined}
      />

      <Textarea
        label={t("customizer.instructions")}
        rows={8}
        value={instructions}
        onChange={(e) => updateAgent(agentId, "instructions", e.target.value)}
        className="font-mono text-xs"
        errorMessage={validateAgentField("instructions", instructions, validLocale) ?? undefined}
      />

      <Textarea
        label={t("customizer.outputTemplate")}
        rows={5}
        value={outputTemplate}
        onChange={(e) => updateAgent(agentId, "outputTemplate", e.target.value)}
        errorMessage={validateAgentField("outputTemplate", outputTemplate, validLocale) ?? undefined}
      />
    </div>
  );
}
