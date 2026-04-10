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

      // Load example MD for instructions quality
      let exampleMd: string | undefined;
      if (referenceAgents.length > 0) {
        exampleMd = referenceAgents[0].rawMd;
      } else {
        try {
          const refs = await loadReferenceAgents(meta.category, locale);
          if (refs.length > 0) {
            setReferenceAgents(refs);
            setReferenceLoaded(true);
            exampleMd = refs[0].rawMd;
          }
        } catch {
          // Proceed without example
        }
      }

      return generateAgentTeam(key, meta, locale, agentContext, exampleMd);
    });

    if (result?.success && result.text) {
      const teamData = parseAgentTeam(result.text);
      let reusedCount = 0;

      // First pass: create agents and collect name→id mapping
      const nameToId = new Map<string, string>();

      for (const data of teamData) {
        if (data.reuseRef) {
          try {
            const harness = await loadHarnessDetail(data.reuseRef.harnessId, locale);
            const sourceAgent = harness.agents.find((a) => a.id === data.reuseRef!.agentId || a.name === data.reuseRef!.agentId);
            if (sourceAgent) {
              const added = addReusedAgent(sourceAgent, {
                harnessId: harness.id,
                harnessName: harness.name,
                agentId: sourceAgent.id,
              });
              nameToId.set(data.name, added.id);
              reusedCount++;
              continue;
            }
          } catch {
            // Fallback: add as custom agent if harness load fails
          }
        }

        // Add as new custom agent
        const added = addAgent({
          name: data.name,
          role: data.role,
          description: data.description,
          instructions: data.instructions,
          tools: data.tools,
          outputTemplate: data.outputTemplate,
        });
        nameToId.set(data.name, added.id);
      }

      // Second pass: resolve dependency names to IDs
      for (const data of teamData) {
        const agentId = nameToId.get(data.name);
        if (!agentId || data.dependencyNames.length === 0) continue;

        const depIds = data.dependencyNames
          .map((depName) => nameToId.get(depName))
          .filter((id): id is string => !!id);

        if (depIds.length > 0) {
          updateAgent(agentId, "dependencies", depIds);
        }
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

      {/* Main layout: grid + optional reference panel */}
      <div className="flex gap-4 min-h-[400px]">
        {/* Two-panel grid */}
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 flex-1 min-w-0">
          {/* Left: Agent list */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 overflow-y-auto max-h-[500px]">
            {ai.loading && agents.length === 0 ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg p-2">
                    <div className="h-3 w-3 rounded-full bg-[var(--muted)]" />
                    <div className="h-3 flex-1 rounded bg-[var(--muted)]" />
                  </div>
                ))}
              </div>
            ) : (
              <BuilderAgentSidebar
                agents={agents}
                selectedId={selectedAgentId}
                onSelect={selectAgent}
                onToggle={toggleAgent}
                onRemove={removeAgent}
                onMoveUp={(i) => i > 0 && reorderAgent(i, i - 1)}
                onMoveDown={(i) => i < agents.length - 1 && reorderAgent(i, i + 1)}
              />
            )}
          </div>

          {/* Right: Edit form */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 overflow-y-auto max-h-[600px]">
            {ai.loading && agents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                <svg className="animate-spin h-8 w-8 text-violet-500" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeLinecap="round" />
                </svg>
                <p className="text-sm text-[var(--muted-foreground)] whitespace-pre-line max-w-xs">
                  {t("ai.generatingTeam")}
                </p>
                <div className="w-full max-w-sm space-y-3 animate-pulse mt-4">
                  <div className="h-4 w-2/3 rounded bg-[var(--muted)]" />
                  <div className="h-3 w-full rounded bg-[var(--muted)]" />
                  <div className="h-3 w-4/5 rounded bg-[var(--muted)]" />
                  <div className="h-8 w-full rounded bg-[var(--muted)] mt-4" />
                  <div className="h-3 w-1/2 rounded bg-[var(--muted)]" />
                </div>
              </div>
            ) : selectedAgent ? (
              <BuilderAgentForm
                agent={selectedAgent}
                allAgents={agents}
                harnessName={meta.name}
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
        </div>

        {/* Reference panel (separate column) */}
        {referenceOpen && (
          <div className="hidden md:block w-[400px] shrink-0 max-h-[600px]">
            <AgentInstructionsReference
              open={referenceOpen}
              agents={referenceAgents}
              loading={referenceLoading}
            />
          </div>
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
