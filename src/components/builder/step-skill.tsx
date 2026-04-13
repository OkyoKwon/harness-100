"use client";

import { useState, useMemo, type KeyboardEvent } from "react";
import { useLocale } from "@/hooks/use-locale";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { GuideBanner } from "./guide-banner";
import { ExecutionOrderEditor } from "./execution-order-editor";
import { AiAssistButton } from "./ai-assist-button";
import { generateSkillDetails, parseSkillDetails } from "@/lib/ai-assist";
import { generateSkillMd } from "@/lib/zip-builder";
import { toHarness } from "@/lib/custom-harness-converter";
import type { useBuilderSkill } from "@/hooks/use-builder-skill";
import type { CustomAgent } from "@/lib/custom-harness-types";
import type { useAiAssist } from "@/hooks/use-ai-assist";

interface StepSkillProps {
  readonly hook: ReturnType<typeof useBuilderSkill>;
  readonly agents: ReadonlyArray<CustomAgent>;
  readonly harnessName: string;
  readonly harnessDescription?: string;
  readonly ai: ReturnType<typeof useAiAssist>;
}

export function StepSkill({ hook, agents, harnessName, harnessDescription, ai }: StepSkillProps) {
  const { t, locale } = useLocale();
  const { addToast } = useToast();
  const [triggerInput, setTriggerInput] = useState("");
  const { skill, skillMarkdown, errors, updateName, addTrigger, removeTrigger, toggleParallel, reorderExecution, updateSkillMarkdown } = hook;
  const [mdExpanded, setMdExpanded] = useState(false);

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTrigger(triggerInput);
      setTriggerInput("");
    }
  };

  const handleGenerateSkillDetails = async () => {
    if (!ai.isConfigured) { addToast(t("ai.error.noKey"), "error"); return; }
    if (!harnessName.trim()) { addToast(t("ai.error.noName"), "error"); return; }

    const agentNames = agents.filter((a) => a.enabled).map((a) => a.name).filter(Boolean);

    const result = await ai.runAssist((key) =>
      generateSkillDetails(key, harnessName, agentNames, locale),
    );

    if (result?.success && result.text) {
      const parsed = parseSkillDetails(result.text);
      if (parsed.name) updateName(parsed.name);
      for (const trigger of parsed.triggers) {
        addTrigger(trigger);
      }
      addToast(t("ai.applied"), "success");
    } else if (result?.error) {
      addToast(t(result.error), "error");
    }
  };

  return (
    <div className="space-y-6">
      <GuideBanner id="step-skill">
        <p>{t("builder.guide.skill")}</p>
      </GuideBanner>

      {/* AI assist button — generates skill name + triggers */}
      {ai.isConfigured && (
        <div className="flex justify-end">
          <AiAssistButton
            onClick={handleGenerateSkillDetails}
            loading={ai.loading}
            disabled={!harnessName.trim()}
            size="md"
          />
        </div>
      )}

      <Input
        label={t("builder.skill.name")}
        value={skill.name}
        onChange={(e) => updateName(e.target.value)}
        placeholder="code-review"
        helperText={t("builder.skill.nameHelper")}
        errorMessage={errors.name ? t(errors.name) : undefined}
      />

      {/* Trigger conditions */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--foreground)]">
          {t("builder.skill.triggers")}
        </label>

        <div className="flex gap-2">
          <Input
            value={triggerInput}
            onChange={(e) => setTriggerInput(e.target.value)}
            onKeyDown={handleTriggerKeyDown}
            placeholder={t("builder.skill.triggersHelper")}
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => {
              addTrigger(triggerInput);
              setTriggerInput("");
            }}
            disabled={!triggerInput.trim()}
            className="shrink-0 rounded-lg bg-[var(--primary)] px-3 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-base focus-ring disabled:opacity-50"
          >
            +
          </button>
        </div>

        {skill.triggerConditions.length > 0 ? (
          <ul className="space-y-1">
            {skill.triggerConditions.map((condition, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-lg bg-[var(--muted)] px-3 py-1.5 text-sm"
              >
                <span className="text-[var(--foreground)]">{condition}</span>
                <button
                  type="button"
                  onClick={() => removeTrigger(i)}
                  className="text-[var(--muted-foreground)] hover:text-red-500 transition-base focus-ring rounded"
                  aria-label={`Remove "${condition}"`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-[var(--muted-foreground)]">{t("builder.skill.noTriggers")}</p>
        )}

        {errors.triggers && (
          <p className="text-xs text-red-500" role="alert">{t(errors.triggers)}</p>
        )}
      </div>

      {/* Execution order */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--foreground)]">
          {t("builder.skill.executionOrder")}
        </label>
        <ExecutionOrderEditor
          executionOrder={skill.executionOrder as never[]}
          agents={agents}
          onToggleParallel={toggleParallel}
          onReorder={reorderExecution}
        />
      </div>

      {/* Skill markdown preview / edit */}
      <SkillMarkdownSection
        skill={skill}
        skillMarkdown={skillMarkdown}
        agents={agents}
        harnessName={harnessName}
        harnessDescription={harnessDescription ?? ""}
        locale={locale}
        expanded={mdExpanded}
        onToggle={() => setMdExpanded((p) => !p)}
        onChange={updateSkillMarkdown}
      />
    </div>
  );
}

// ── Skill Markdown Preview/Edit Section ──

interface SkillMarkdownSectionProps {
  readonly skill: ReturnType<typeof useBuilderSkill>["skill"];
  readonly skillMarkdown: string;
  readonly agents: ReadonlyArray<CustomAgent>;
  readonly harnessName: string;
  readonly harnessDescription: string;
  readonly locale: string;
  readonly expanded: boolean;
  readonly onToggle: () => void;
  readonly onChange: (md: string) => void;
}

function SkillMarkdownSection({
  skill, skillMarkdown, agents, harnessName, harnessDescription, locale, expanded, onToggle, onChange,
}: SkillMarkdownSectionProps) {
  const { t } = useLocale();

  const autoGenerated = useMemo(() => {
    if (!skill.name || agents.filter((a) => a.enabled).length === 0) return "";
    const tempHarness = toHarness({
      id: "preview",
      slug: skill.name || "preview",
      name: harnessName,
      description: harnessDescription,
      category: "development",
      agents,
      skill,
      frameworks: [],
      createdAt: "",
      updatedAt: "",
      version: 1,
    });
    return generateSkillMd(tempHarness, locale as "ko" | "en");
  }, [skill, agents, harnessName, harnessDescription, locale]);

  const displayContent = skillMarkdown || autoGenerated;

  if (!displayContent) return null;

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]"
      >
        <svg
          className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-90" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        {t("builder.skill.markdown")}
        {skillMarkdown && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-600 text-white">{t("builder.skill.customized")}</span>
        )}
      </button>

      {expanded && (
        <div className="space-y-2">
          <p className="text-xs text-[var(--muted-foreground)]">{t("builder.skill.markdownHelper")}</p>
          <textarea
            value={skillMarkdown || autoGenerated}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-80 rounded-lg border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 text-xs font-mono text-[var(--foreground)] resize-y focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2"
            spellCheck={false}
          />
          {skillMarkdown && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline transition-base"
            >
              {t("builder.skill.resetToAuto")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
