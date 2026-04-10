"use client";

import { useState, useCallback } from "react";
import { useLocale } from "@/hooks/use-locale";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/ui/multi-select";
import { ToolCheckboxGroup } from "./tool-checkbox-group";
import { AiAssistButton } from "./ai-assist-button";
import { AgentInstructionsReference } from "./agent-instructions-reference";
import {
  generateAgentDetails,
  generateAgentInstructions,
  parseAgentDetails,
  loadReferenceAgents,
} from "@/lib/ai-assist";
import type { ReferenceAgent } from "@/lib/ai-assist";
import type { Category } from "@/lib/types";
import type { CustomAgent } from "@/lib/custom-harness-types";
import type { useAiAssist } from "@/hooks/use-ai-assist";

interface BuilderAgentFormProps {
  readonly agent: CustomAgent;
  readonly allAgents: ReadonlyArray<CustomAgent>;
  readonly harnessName: string;
  readonly category: Category | "";
  readonly onUpdate: (field: keyof CustomAgent, value: string | boolean | ReadonlyArray<string>) => void;
  readonly errors: Record<string, string>;
  readonly ai: ReturnType<typeof useAiAssist>;
}

export function BuilderAgentForm({ agent, allAgents, harnessName, category, onUpdate, errors, ai }: BuilderAgentFormProps) {
  const { t, locale } = useLocale();
  const { addToast } = useToast();

  const [referenceOpen, setReferenceOpen] = useState(false);
  const [referenceAgents, setReferenceAgents] = useState<ReadonlyArray<ReferenceAgent>>([]);
  const [referenceLoading, setReferenceLoading] = useState(false);
  const [referenceLoaded, setReferenceLoaded] = useState(false);
  const [instructionsLoading, setInstructionsLoading] = useState(false);

  const dependencyOptions = allAgents
    .filter((a) => a.id !== agent.id && a.enabled)
    .map((a) => ({ value: a.id, label: a.name || a.id }));

  const handleGenerateDetails = async () => {
    if (!ai.isConfigured) { addToast(t("ai.error.noKey"), "error"); return; }
    if (!agent.name.trim()) { addToast(t("ai.error.noName"), "error"); return; }

    // Try to get an example MD for the AI prompt
    let exampleMd: string | undefined;
    if (referenceAgents.length > 0) {
      exampleMd = referenceAgents[0].rawMd;
    }

    const result = await ai.runAssist((key) =>
      generateAgentDetails(key, agent, harnessName, locale, exampleMd),
    );

    if (result?.success && result.text) {
      const parsed = parseAgentDetails(result.text);
      if (parsed.role) onUpdate("role", parsed.role);
      if (parsed.description) onUpdate("description", parsed.description);
      if (parsed.outputTemplate) onUpdate("outputTemplate", parsed.outputTemplate);
      if (parsed.instructions) onUpdate("instructions", parsed.instructions);
      addToast(t("ai.applied"), "success");
    } else if (result?.error) {
      addToast(t(result.error), "error");
    }
  };

  const handleToggleReference = useCallback(async () => {
    if (!referenceOpen && !referenceLoaded) {
      setReferenceLoading(true);
      setReferenceOpen(true);
      try {
        const agents = await loadReferenceAgents(category, locale);
        setReferenceAgents(agents);
        setReferenceLoaded(true);
      } finally {
        setReferenceLoading(false);
      }
    } else {
      setReferenceOpen((prev) => !prev);
    }
  }, [referenceOpen, referenceLoaded, category, locale]);

  const handleGenerateInstructions = async () => {
    if (!ai.isConfigured) { addToast(t("ai.error.noKey"), "error"); return; }
    if (!agent.name.trim() || !agent.role.trim()) {
      addToast(t("ai.error.noName"), "error");
      return;
    }

    setInstructionsLoading(true);

    // Load reference if not yet loaded
    let exampleMd = "";
    if (referenceAgents.length > 0) {
      exampleMd = referenceAgents[0].rawMd;
    } else {
      try {
        const agents = await loadReferenceAgents(category, locale);
        if (agents.length > 0) {
          setReferenceAgents(agents);
          setReferenceLoaded(true);
          exampleMd = agents[0].rawMd;
        }
      } catch {
        // Proceed without example
      }
    }

    try {
      const result = await ai.runAssist((key) =>
        generateAgentInstructions(key, agent, harnessName, exampleMd, locale),
      );

      if (result?.success && result.text) {
        onUpdate("instructions", result.text);
        addToast(t("ai.applied"), "success");
      } else if (result?.error) {
        addToast(t(result.error), "error");
      }
    } finally {
      setInstructionsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Reused agent banner */}
      {agent.sourceRef && (
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-3 py-2 text-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500 shrink-0" aria-hidden="true">
            <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
          <span className="font-medium text-blue-700 dark:text-blue-300">
            {t("builder.agent.reusedFrom")}
          </span>
          <span className="text-blue-600 dark:text-blue-400">
            {agent.sourceRef.harnessName}
          </span>
        </div>
      )}

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

      {/* Instructions section */}
      <div className="space-y-2">
        <Textarea
          label={t("builder.agent.instructions")}
          value={agent.instructions ?? ""}
          onChange={(e) => onUpdate("instructions", e.target.value)}
          placeholder={t("builder.agent.instructionsPlaceholder")}
          rows={8}
          helperText={t("builder.agent.instructionsHelper")}
        />

        {/* Action buttons for instructions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleReference}
            className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0" aria-hidden="true">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            {referenceOpen ? t("builder.agent.referenceHide") : t("builder.agent.referenceShow")}
          </button>

          {ai.isConfigured && (
            <AiAssistButton
              onClick={handleGenerateInstructions}
              loading={instructionsLoading || ai.loading}
              disabled={!agent.name.trim() || !agent.role.trim()}
              size="sm"
              label={t("builder.agent.generateInstructions")}
            />
          )}
        </div>

        {/* Reference panel */}
        <AgentInstructionsReference
          open={referenceOpen}
          agents={referenceAgents}
          loading={referenceLoading}
        />
      </div>

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
