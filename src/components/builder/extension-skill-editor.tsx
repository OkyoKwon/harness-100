"use client";

import { useState } from "react";
import { useLocale } from "@/hooks/use-locale";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { AiAssistButton } from "./ai-assist-button";
import { generateExtensionSkillMarkdown } from "@/lib/ai-assist";
import type { ExtensionSkill } from "@/lib/types";
import type { CustomAgent } from "@/lib/custom-harness-types";
import type { useAiAssist } from "@/hooks/use-ai-assist";

interface ExtensionSkillEditorProps {
  readonly ext: ExtensionSkill;
  readonly index: number;
  readonly agents: ReadonlyArray<CustomAgent>;
  readonly harnessName: string;
  readonly markdown: string | undefined;
  readonly errors: Readonly<Record<string, string>>;
  readonly ai: ReturnType<typeof useAiAssist>;
  readonly onUpdate: (index: number, ext: ExtensionSkill) => void;
  readonly onRemove: (index: number) => void;
  readonly onUpdateMarkdown: (name: string, md: string) => void;
  readonly onClearMarkdown: (name: string) => void;
}

export function ExtensionSkillEditor({
  ext, index, agents, harnessName, markdown, errors, ai,
  onUpdate, onRemove, onUpdateMarkdown, onClearMarkdown,
}: ExtensionSkillEditorProps) {
  const { t, locale } = useLocale();
  const { addToast } = useToast();
  const [mdExpanded, setMdExpanded] = useState(false);

  const enabledAgents = agents.filter((a) => a.enabled);

  const handleFieldChange = (field: keyof ExtensionSkill, value: string) => {
    onUpdate(index, { ...ext, [field]: value });
  };

  const handleGenerateMarkdown = async () => {
    if (!ai.isConfigured) { addToast(t("ai.error.noKey"), "error"); return; }
    if (!ext.name.trim() || !ext.targetAgent.trim()) return;

    const agent = enabledAgents.find((a) => a.id === ext.targetAgent || a.name === ext.targetAgent);
    if (!agent) return;

    const result = await ai.runAssist((key) =>
      generateExtensionSkillMarkdown(
        key,
        ext.name,
        ext.description,
        { name: agent.name, role: agent.role, description: agent.description },
        harnessName,
        locale,
      ),
    );

    if (result?.success && result.text) {
      onUpdateMarkdown(ext.name, result.text);
      setMdExpanded(true);
      addToast(t("ai.applied"), "success");
    } else if (result?.error) {
      addToast(t(result.error), "error");
    }
  };

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
      {/* Header with delete */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--muted-foreground)]">
          #{index + 1}
        </span>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-[var(--muted-foreground)] hover:text-red-500 transition-base focus-ring rounded p-0.5"
          aria-label={`Remove extension skill "${ext.name}"`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Name */}
      <Input
        label={t("builder.skill.extensionName")}
        value={ext.name}
        onChange={(e) => handleFieldChange("name", e.target.value)}
        placeholder="hook-writing"
        helperText={t("builder.skill.extensionNameHelper")}
        errorMessage={errors[`${index}_name`] ? t(errors[`${index}_name`]) : undefined}
      />

      {/* Target agent dropdown */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[var(--foreground)]">
          {t("builder.skill.extensionTarget")}
        </label>
        <select
          value={ext.targetAgent}
          onChange={(e) => handleFieldChange("targetAgent", e.target.value)}
          className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2.5 text-sm hover:border-[var(--input-focus-border)] focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2 transition-base"
        >
          <option value="">{t("builder.skill.extensionTargetPlaceholder")}</option>
          {enabledAgents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name || a.id} — {a.role}
            </option>
          ))}
        </select>
        {errors[`${index}_target`] && (
          <p className="text-xs text-red-500" role="alert">{t(errors[`${index}_target`])}</p>
        )}
      </div>

      {/* Description */}
      <Input
        label={t("builder.skill.extensionDesc")}
        value={ext.description}
        onChange={(e) => handleFieldChange("description", e.target.value)}
        placeholder={t("builder.skill.extensionDescPlaceholder")}
      />

      {/* Actions row */}
      <div className="flex items-center gap-2">
        {ai.isConfigured && (
          <AiAssistButton
            onClick={handleGenerateMarkdown}
            loading={ai.loading}
            disabled={!ext.name.trim() || !ext.targetAgent.trim()}
            size="sm"
            label={t("builder.skill.generateExtensionMd")}
          />
        )}
      </div>

      {/* Markdown preview/edit */}
      {(markdown || ext.name) && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setMdExpanded((p) => !p)}
            className="flex items-center gap-2 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-base"
          >
            <svg
              className={`h-3 w-3 transition-transform ${mdExpanded ? "rotate-90" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            skill.md
            {markdown && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-600 text-white">
                {t("builder.skill.customized")}
              </span>
            )}
          </button>

          {mdExpanded && (
            <div className="space-y-1.5">
              <textarea
                value={markdown ?? ""}
                onChange={(e) => onUpdateMarkdown(ext.name, e.target.value)}
                placeholder={t("builder.skill.markdownHelper")}
                className="w-full h-48 rounded-lg border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 text-xs font-mono text-[var(--foreground)] resize-y focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2"
                spellCheck={false}
              />
              {markdown && (
                <button
                  type="button"
                  onClick={() => onClearMarkdown(ext.name)}
                  className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline transition-base"
                >
                  {t("builder.skill.resetToAuto")}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
