"use client";

import { useState } from "react";
import { useLocale } from "@/hooks/use-locale";
import { useToast } from "@/hooks/use-toast";
import { GuideBanner } from "./guide-banner";
import { BuilderAgentSidebar } from "./builder-agent-sidebar";
import { BuilderAgentForm } from "./builder-agent-form";
import { AgentTemplatePicker } from "./agent-template-picker";
import { AiAssistButton } from "./ai-assist-button";
import { generateAgentTeam, parseAgentTeam } from "@/lib/ai-assist";
import { createAgentFromTemplate } from "@/lib/custom-harness-converter";
import type { useBuilderAgents } from "@/hooks/use-builder-agents";
import type { AgentTemplate, BuilderMeta } from "@/lib/custom-harness-types";
import type { useAiAssist } from "@/hooks/use-ai-assist";

interface StepAgentsProps {
  readonly hook: ReturnType<typeof useBuilderAgents>;
  readonly meta: BuilderMeta;
  readonly ai: ReturnType<typeof useAiAssist>;
}

export function StepAgents({ hook, meta, ai }: StepAgentsProps) {
  const { t, locale } = useLocale();
  const { addToast } = useToast();
  const [templateOpen, setTemplateOpen] = useState(false);

  const {
    agents,
    selectedAgent,
    selectedAgentId,
    errors,
    addAgent,
    updateAgent,
    removeAgent,
    toggleAgent,
    reorderAgent,
    selectAgent,
  } = hook;

  const handleGenerateTeam = async () => {
    if (!ai.isConfigured) { addToast(t("ai.error.noKey"), "error"); return; }
    if (!meta.name.trim()) { addToast(t("ai.error.noName"), "error"); return; }

    const result = await ai.runAssist((key) =>
      generateAgentTeam(key, meta, locale),
    );

    if (result?.success && result.text) {
      const teamData = parseAgentTeam(result.text);
      for (const data of teamData) {
        addAgent({
          name: data.name,
          role: data.role,
          description: data.description,
          tools: data.tools,
          outputTemplate: data.outputTemplate,
        });
      }
      if (teamData.length > 0) {
        addToast(t("ai.teamApplied"), "success");
      }
    } else if (result?.error) {
      addToast(t(result.error), "error");
    }
  };

  return (
    <div className="space-y-4">
      <GuideBanner id="step-agents">
        <p>{t("builder.guide.agents")}</p>
      </GuideBanner>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => addAgent()}
          className="rounded-lg bg-[var(--primary)] px-3 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-base focus-ring"
        >
          + {t("builder.agent.add")}
        </button>
        <button
          type="button"
          onClick={() => setTemplateOpen(true)}
          className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-base focus-ring"
        >
          {t("builder.agent.addFromTemplate")}
        </button>
        {ai.isConfigured && (
          <AiAssistButton
            onClick={handleGenerateTeam}
            loading={ai.loading}
            disabled={!meta.name.trim()}
            size="md"
          />
        )}
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 min-h-[400px]">
        {/* Left: Agent list */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 overflow-y-auto max-h-[500px]">
          <BuilderAgentSidebar
            agents={agents}
            selectedId={selectedAgentId}
            onSelect={selectAgent}
            onToggle={toggleAgent}
            onRemove={removeAgent}
            onMoveUp={(i) => i > 0 && reorderAgent(i, i - 1)}
            onMoveDown={(i) => i < agents.length - 1 && reorderAgent(i, i + 1)}
          />
        </div>

        {/* Right: Edit form */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 overflow-y-auto max-h-[500px]">
          {selectedAgent ? (
            <BuilderAgentForm
              agent={selectedAgent}
              allAgents={agents}
              harnessName={meta.name}
              onUpdate={(field, value) => updateAgent(selectedAgent.id, field, value)}
              errors={errors}
              ai={ai}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-[var(--muted-foreground)]">
              {agents.length === 0
                ? t("builder.agent.noAgents")
                : t("builder.agent.selectToEdit")}
            </div>
          )}
        </div>
      </div>

      {/* Errors */}
      {errors._global && (
        <p className="text-xs text-red-500" role="alert">{t(errors._global)}</p>
      )}
      {errors._cycle && (
        <p className="text-xs text-red-500" role="alert">{t(errors._cycle)}</p>
      )}

      <AgentTemplatePicker
        open={templateOpen}
        onClose={() => setTemplateOpen(false)}
        onSelect={(template: AgentTemplate) => addAgent(template)}
      />
    </div>
  );
}
