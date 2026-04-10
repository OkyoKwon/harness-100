"use client";

import { useState, type KeyboardEvent } from "react";
import { useLocale } from "@/hooks/use-locale";
import { Input } from "@/components/ui/input";
import { GuideBanner } from "./guide-banner";
import { ExecutionOrderEditor } from "./execution-order-editor";
import type { useBuilderSkill } from "@/hooks/use-builder-skill";
import type { CustomAgent } from "@/lib/custom-harness-types";

interface StepSkillProps {
  readonly hook: ReturnType<typeof useBuilderSkill>;
  readonly agents: ReadonlyArray<CustomAgent>;
}

export function StepSkill({ hook, agents }: StepSkillProps) {
  const { t } = useLocale();
  const [triggerInput, setTriggerInput] = useState("");
  const { skill, errors, updateName, addTrigger, removeTrigger, toggleParallel, reorderExecution } = hook;

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTrigger(triggerInput);
      setTriggerInput("");
    }
  };

  return (
    <div className="space-y-6">
      <GuideBanner id="step-skill">
        <p>{t("builder.guide.skill")}</p>
      </GuideBanner>

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
    </div>
  );
}
