"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/hooks/use-locale";
import { useHarnessBuilder } from "@/hooks/use-harness-builder";
import { useAiAssist } from "@/hooks/use-ai-assist";
import { useCustomHarnesses } from "@/hooks/use-custom-harnesses";
import { BuilderStepper } from "./builder-stepper";
import { StepMeta } from "./step-meta";
import { StepAgents } from "./step-agents";
import { StepSkill } from "./step-skill";
import { StepReview } from "./step-review";
import { MyHarnessList } from "./my-harness-list";
import { ApiKeySettings } from "./api-key-settings";
import { CustomHarnessDetail } from "./custom-harness-detail";
import type { CustomHarness } from "@/lib/custom-harness-types";

type Mode = "list" | "builder" | "detail";

export function BuilderClient() {
  const { t } = useLocale();
  const [mode, setMode] = useState<Mode>("list");
  const [editingHarness, setEditingHarness] = useState<CustomHarness | undefined>();
  const [viewingHarness, setViewingHarness] = useState<CustomHarness | undefined>();

  const builder = useHarnessBuilder(editingHarness);
  const ai = useAiAssist();
  const { getById, isLoading: customLoading } = useCustomHarnesses();
  const searchParams = useSearchParams();

  // Sync mode with URL: open detail when ?view={id}, reset to list when it's removed
  useEffect(() => {
    if (customLoading) return;
    const viewId = searchParams.get("view");
    if (viewId && mode === "list") {
      const found = getById(viewId);
      if (found) {
        setViewingHarness(found);
        setMode("detail");
      }
    } else if (!viewId && mode === "detail") {
      setMode("list");
      setViewingHarness(undefined);
    }
  }, [searchParams, customLoading, getById]);

  // Listen for header "내 하네스" nav clicks to reset to list
  useEffect(() => {
    const handler = () => {
      setMode("list");
      setViewingHarness(undefined);
      setEditingHarness(undefined);
      builder.resetAll();
    };
    window.addEventListener("builder-nav-reset", handler);
    return () => window.removeEventListener("builder-nav-reset", handler);
  }, [builder]);

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

  const handleView = useCallback((harness: CustomHarness) => {
    setViewingHarness(harness);
    setMode("detail");
  }, []);

  const handleBackToList = useCallback(() => {
    setMode("list");
    setEditingHarness(undefined);
    setViewingHarness(undefined);
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
    <main className={`mx-auto px-4 py-8 ${mode === "detail" ? "max-w-6xl" : "max-w-4xl"}`}>
      {mode === "list" && (
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
            onView={handleView}
            onCreateNew={handleCreateNew}
          />
        </>
      )}

      {mode === "detail" && viewingHarness && (
        <CustomHarnessDetail
          harness={viewingHarness}
          onBack={handleBackToList}
          onEdit={handleEdit}
        />
      )}

      {mode === "builder" && (
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
                harnessDescription={builder.meta.meta.description}
                ai={ai}
                extensionSkillErrors={builder.validationErrors.extensionSkills}
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
                  if (currentStep === 3) builder.skill.touchAll();
                  if (canProceedFromStep(currentStep)) next();
                }}
                disabled={ai.loading}
                className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-base focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
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
