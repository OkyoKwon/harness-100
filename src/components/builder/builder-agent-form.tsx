import { useLocale } from "@/hooks/use-locale";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/ui/multi-select";
import { ToolCheckboxGroup } from "./tool-checkbox-group";
import { AiAssistButton } from "./ai-assist-button";
import { generateAgentDetails, parseAgentDetails } from "@/lib/ai-assist";
import type { CustomAgent } from "@/lib/custom-harness-types";
import type { useAiAssist } from "@/hooks/use-ai-assist";

interface BuilderAgentFormProps {
  readonly agent: CustomAgent;
  readonly allAgents: ReadonlyArray<CustomAgent>;
  readonly harnessName: string;
  readonly onUpdate: (field: keyof CustomAgent, value: string | boolean | ReadonlyArray<string>) => void;
  readonly errors: Record<string, string>;
  readonly ai: ReturnType<typeof useAiAssist>;
}

export function BuilderAgentForm({ agent, allAgents, harnessName, onUpdate, errors, ai }: BuilderAgentFormProps) {
  const { t, locale } = useLocale();
  const { addToast } = useToast();

  const dependencyOptions = allAgents
    .filter((a) => a.id !== agent.id && a.enabled)
    .map((a) => ({ value: a.id, label: a.name || a.id }));

  const handleGenerateDetails = async () => {
    if (!ai.isConfigured) { addToast(t("ai.error.noKey"), "error"); return; }
    if (!agent.name.trim()) { addToast(t("ai.error.noName"), "error"); return; }

    const result = await ai.runAssist((key) =>
      generateAgentDetails(key, agent, harnessName, locale),
    );

    if (result?.success && result.text) {
      const parsed = parseAgentDetails(result.text);
      if (parsed.role) onUpdate("role", parsed.role);
      if (parsed.description) onUpdate("description", parsed.description);
      if (parsed.outputTemplate) onUpdate("outputTemplate", parsed.outputTemplate);
      addToast(t("ai.applied"), "success");
    } else if (result?.error) {
      addToast(t(result.error), "error");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[var(--foreground)]">{agent.name || t("builder.agent.name")}</span>
        {ai.isConfigured && (
          <AiAssistButton
            onClick={handleGenerateDetails}
            loading={ai.loading}
            disabled={!agent.name.trim()}
            size="md"
          />
        )}
      </div>

      <Input
        label={t("builder.agent.name")}
        value={agent.name}
        onChange={(e) => onUpdate("name", e.target.value)}
        placeholder="code-reviewer"
        helperText={t("builder.agent.nameHelper")}
        errorMessage={errors[`${agent.id}_name`] ? t(errors[`${agent.id}_name`]) : undefined}
      />

      <Input
        label={t("builder.agent.role")}
        value={agent.role}
        onChange={(e) => onUpdate("role", e.target.value)}
        placeholder="Code quality reviewer"
        helperText={t("builder.agent.roleHelper")}
        errorMessage={errors[`${agent.id}_role`] ? t(errors[`${agent.id}_role`]) : undefined}
      />

      <Textarea
        label={t("builder.agent.description")}
        value={agent.description}
        onChange={(e) => onUpdate("description", e.target.value)}
        placeholder="Reviews code for quality, readability, and potential bugs..."
        rows={3}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--foreground)]">
          {t("builder.agent.tools")}
        </label>
        <p className="text-xs text-[var(--muted-foreground)]">{t("builder.agent.toolsHelper")}</p>
        <ToolCheckboxGroup
          selected={agent.tools as string[]}
          onChange={(tools) => onUpdate("tools", tools)}
        />
      </div>

      <Input
        label={t("builder.agent.output")}
        value={agent.outputTemplate}
        onChange={(e) => onUpdate("outputTemplate", e.target.value)}
        placeholder="_workspace/report.md"
        helperText={t("builder.agent.outputHelper")}
      />

      <MultiSelect
        label={t("builder.agent.dependencies")}
        options={dependencyOptions}
        selected={agent.dependencies as string[]}
        onChange={(deps) => onUpdate("dependencies", deps)}
        placeholder={t("builder.agent.dependenciesHelper")}
        helperText={t("builder.agent.dependenciesHelper")}
      />
    </div>
  );
}
