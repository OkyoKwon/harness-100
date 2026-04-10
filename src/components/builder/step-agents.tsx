"use client";

import { useState, useCallback } from "react";
import { useLocale } from "@/hooks/use-locale";
import { useToast } from "@/hooks/use-toast";
import { GuideBanner } from "./guide-banner";
import { BuilderAgentSidebar } from "./builder-agent-sidebar";
import { BuilderAgentForm } from "./builder-agent-form";
import { AgentTemplatePicker } from "./agent-template-picker";
import { AgentInstructionsReference } from "./agent-instructions-reference";
import { AiAssistButton } from "./ai-assist-button";
import { generateAgentTeam, parseAgentTeam, buildAgentContext, loadReferenceAgents } from "@/lib/ai-assist";
import type { ReferenceAgent } from "@/lib/ai-assist";
import { loadAgentIndex, loadHarnessDetail } from "@/lib/harness-loader";
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

  // Reference panel state (lifted from BuilderAgentForm)
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [referenceAgents, setReferenceAgents] = useState<ReadonlyArray<ReferenceAgent>>([]);
  const [referenceLoading, setReferenceLoading] = useState(false);
  const [referenceLoaded, setReferenceLoaded] = useState(false);

  const {
    agents,
    selectedAgent,
    selectedAgentId,
    errors,
    addAgent,
    addReusedAgent,
    updateAgent,
    removeAgent,
    toggleAgent,
    reorderAgent,
    selectAgent,
  } = hook;

  const handleToggleReference = useCallback(async () => {
    if (!referenceOpen && !referenceLoaded) {
      setReferenceLoading(true);
      setReferenceOpen(true);
      try {
        const loaded = await loadReferenceAgents(meta.category, locale);
        setReferenceAgents(loaded);
        setReferenceLoaded(true);
      } finally {
        setReferenceLoading(false);
      }
    } else {
      setReferenceOpen((prev) => !prev);
    }
  }, [referenceOpen, referenceLoaded, meta.category, locale]);

  const handleGenerateTeam = async () => {
    if (!ai.isConfigured) { addToast(t("ai.error.noKey"), "error"); return; }
    if (!meta.name.trim()) { addToast(t("ai.error.noName"), "error"); return; }

    const result = await ai.runAssist(async (key) => {
      // Load agent index and build context for the AI prompt
      let agentContext: string | undefined;
      try {
        const index = await loadAgentIndex(locale);
        agentContext = buildAgentContext(index, meta.category, locale);
      } catch {
        // Non-critical: AI can still generate without context
      }

      return generateAgentTeam(key, meta, locale, agentContext);
    });

    if (result?.success && result.text) {
      const teamData = parseAgentTeam(result.text);
      let reusedCount = 0;

      for (const data of teamData) {
        if (data.reuseRef) {
          // Try to load the full agent from the source harness
          try {
            const harness = await loadHarnessDetail(data.reuseRef.harnessId, locale);
            const sourceAgent = harness.agents.find((a) => a.id === data.reuseRef!.agentId || a.name === data.reuseRef!.agentId);
            if (sourceAgent) {
              addReusedAgent(sourceAgent, {
                harnessId: harness.id,
                harnessName: harness.name,
                agentId: sourceAgent.id,
              });
              reusedCount++;
              continue;
            }
          } catch {
            // Fallback: add as custom agent if harness load fails
          }
        }

        // Add as new custom agent (no reuse ref or reuse failed)
        addAgent({
          name: data.name,
          role: data.role,
          description: data.description,
          tools: data.tools,
          outputTemplate: data.outputTemplate,
        });
      }

      if (teamData.length > 0) {
        const message = reusedCount > 0
          ? t("ai.teamWithReuse")
          : t("ai.teamApplied");
        addToast(message, "success");
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

      {/* Two/three-panel layout */}
      <div className={`grid grid-cols-1 gap-4 min-h-[400px] ${referenceOpen ? "md:grid-cols-[240px_1fr_1fr]" : "md:grid-cols-[240px_1fr]"}`}>
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
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 overflow-y-auto max-h-[600px]">
          {selectedAgent ? (
            <BuilderAgentForm
              agent={selectedAgent}
              allAgents={agents}
              harnessName={meta.name}
              category={meta.category}
              referenceOpen={referenceOpen}
              referenceAgents={referenceAgents}
              onToggleReference={handleToggleReference}
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

        {/* Right: Reference panel (third column) */}
        {referenceOpen && (
          <AgentInstructionsReference
            open={referenceOpen}
            agents={referenceAgents}
            loading={referenceLoading}
          />
        )}
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
