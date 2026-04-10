"use client";

import { useState, useCallback } from "react";
import { useLocale } from "@/hooks/use-locale";
import { useHarnessBuilder } from "@/hooks/use-harness-builder";
import { useAiAssist } from "@/hooks/use-ai-assist";
import { BuilderStepper } from "./builder-stepper";
import { StepMeta } from "./step-meta";
import { StepAgents } from "./step-agents";
import { StepSkill } from "./step-skill";
import { StepReview } from "./step-review";
import { MyHarnessList } from "./my-harness-list";
import { ApiKeySettings } from "./api-key-settings";
import type { CustomHarness } from "@/lib/custom-harness-types";
import { resolveTemplateAgents, type HarnessTemplate } from "@/lib/harness-templates";

type Mode = "list" | "builder";

export function BuilderClient() {
  const { t } = useLocale();
  const [mode, setMode] = useState<Mode>("list");
  const [editingHarness, setEditingHarness] = useState<CustomHarness | undefined>();

  const builder = useHarnessBuilder(editingHarness);
  const ai = useAiAssist();

  const handleCreateNew = useCallback(() => {
    setEditingHarness(undefined);
    builder.resetAll();
    setMode("builder");
  }, [builder]);

  const handleEdit = useCallback(
    (harness: CustomHarness) => {
      setEditingHarness(harness);
      builder.loadFromExisting(harness);
      setMode("builder");
    },
    [builder],
  );

  const handleCreateFromTemplate = useCallback(
    (template: HarnessTemplate) => {
      builder.resetAll();
      builder.meta.updateField("name", t(template.nameKey));
      builder.meta.setCategory(template.category);
      const agentTemplates = resolveTemplateAgents(template.agentNames);
      for (const at of agentTemplates) {
        builder.agents.addAgent(at);
      }
      setEditingHarness(undefined);
      setMode("builder");
    },
    [builder, t],
  );

  const handleBackToList = useCallback(() => {
    setMode("list");
    setEditingHarness(undefined);
    builder.resetAll();
  }, [builder]);

  const handleSaved = useCallback(() => {
    builder.clearDraft();
    setMode("list");
    setEditingHarness(undefined);
  }, [builder]);

  const { currentStep, goTo, next, prev } = builder.navigation;

  const canProceedFromStep = (step: number): boolean => {
    switch (step) {
      case 1: return builder.meta.isValid;
      case 2: return builder.agents.isValid;
      case 3: return builder.skill.isValid;
      default: return true;
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {mode === "list" ? (
        <>
          <div className="hero-gradient rounded-xl px-5 py-5 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-1">{t("builder.title")}</h1>
            <p className="text-sm text-[var(--muted-foreground)]">{t("builder.subtitle")}</p>
          </div>

          {/* AI API Key settings */}
          <div className="mb-4">
            <ApiKeySettings
              apiKey={ai.apiKey}
              isConfigured={ai.isConfigured}
              onSave={ai.saveApiKey}
              onClear={ai.clearApiKey}
            />
          </div>

          <MyHarnessList
            onEdit={handleEdit}
            onCreateNew={handleCreateNew}
            onSelectTemplate={handleCreateFromTemplate}
          />
        </>
      ) : (
        <>
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBackToList}
              className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-base focus-ring rounded"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              {t("builder.myHarnesses")}
            </button>
            <button
              type="button"
              onClick={() => {
                builder.resetAll();
                setEditingHarness(undefined);
              }}
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-base focus-ring rounded px-2 py-1"
            >
              {t("builder.action.reset")}
            </button>
          </div>

          {/* Stepper */}
          <div className="mb-8">
            <BuilderStepper currentStep={currentStep} onStepClick={goTo} />
          </div>

          {/* Step content */}
          <div className="mb-8">
            {currentStep === 1 && (
              <StepMeta hook={builder.meta} ai={ai} />
            )}
            {currentStep === 2 && (
              <StepAgents hook={builder.agents} meta={builder.meta.meta} ai={ai} />
            )}
            {currentStep === 3 && (
              <StepSkill
                hook={builder.skill}
                agents={builder.agents.agents}
                harnessName={builder.meta.meta.name}
                ai={ai}
              />
            )}
            {currentStep === 4 && (
              <StepReview
                harness={builder.build()}
                errors={builder.validationErrors}
                onSaved={handleSaved}
              />
            )}
          </div>

          {/* Navigation buttons */}
          {currentStep < 4 && (
            <div className="flex justify-between">
              <button
                type="button"
                onClick={prev}
                disabled={currentStep === 1}
                className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-base focus-ring disabled:opacity-30"
              >
                {t("builder.action.prev")}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 1) builder.meta.touchAll();
                  if (canProceedFromStep(currentStep)) next();
                }}
                className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-base focus-ring"
              >
                {t("builder.action.next")}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
