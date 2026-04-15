"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { HarnessMeta } from "@/lib/types";
import { loadCatalog } from "@/lib/harness-loader";
import { useLocale } from "@/hooks/use-locale";
import { useToast } from "@/hooks/use-toast";
import { useComposer } from "@/hooks/use-composer";
import { useModifications } from "@/hooks/use-modifications";
import { useComposerStep } from "@/hooks/use-composer-step";
import { HarnessSelector } from "@/components/composer/harness-selector";
import { CompositionPreview } from "@/components/composer/composition-preview";
import { ComposerStepper } from "@/components/composer/composer-stepper";
import { ComposerExportPanel } from "@/components/composer/composer-export-panel";
import { CustomizePanel } from "@/components/customizer/customize-panel";

function parseComposeParam(param: string | null): ReadonlyArray<number> {
  if (!param) return [];
  return param
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n >= 1 && n <= 100);
}

function buildComposeParam(ids: ReadonlyArray<number>): string {
  return ids.map((id) => String(id).padStart(2, "0")).join(",");
}

export function ComposerClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, locale } = useLocale();
  const { addToast } = useToast();

  const [catalog, setCatalog] = useState<ReadonlyArray<HarnessMeta>>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const {
    selectedIds,
    loadedHarnesses,
    merged,
    loading,
    addHarness,
    removeHarness,
    clear,
    setSelectedIds,
  } = useComposer();

  const {
    modifications,
    updateAgent,
    toggleAgent,
    isAgentEnabled,
    getModifiedValue,
    reset: resetModifications,
    hasChanges,
  } = useModifications(merged?.agents ?? []);

  const {
    step,
    stepIndex,
    steps,
    goToStep,
    nextStep,
    prevStep,
    canGoNext,
  } = useComposerStep(selectedIds.length > 0);

  // Reset modifications when merged harness changes
  const prevMergedRef = useRef(merged);
  useEffect(() => {
    if (merged !== prevMergedRef.current) {
      resetModifications();
      prevMergedRef.current = merged;
    }
  }, [merged, resetModifications]);

  // Load catalog on mount
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await loadCatalog(locale);
        if (!cancelled) setCatalog(data);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load catalog:", error);
          setCatalogError(t("composer.catalogError"));
        }
      }
    };

    load();
    return () => { cancelled = true; };
  }, [locale, t]);

  // Restore selection from URL on mount
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (initialized) return;
    const composeParam = searchParams.get("compose");
    const ids = parseComposeParam(composeParam);
    if (ids.length > 0) {
      setSelectedIds(ids);
    }
    setInitialized(true);
  }, [searchParams, initialized, setSelectedIds]);

  // Sync selectedIds to URL
  useEffect(() => {
    if (!initialized) return;

    const currentParam = searchParams.get("compose") ?? "";
    const newParam = selectedIds.length > 0 ? buildComposeParam(selectedIds) : "";

    if (currentParam !== newParam) {
      const params = new URLSearchParams(searchParams.toString());
      if (newParam) {
        params.set("compose", newParam);
      } else {
        params.delete("compose");
      }
      const queryString = params.toString();
      router.replace(queryString ? `?${queryString}` : "/composer", {
        scroll: false,
      });
    }
  }, [selectedIds, initialized, searchParams, router]);

  const handleAdd = useCallback(
    (id: number) => addHarness(id),
    [addHarness],
  );

  const handleRemove = useCallback(
    (id: number) => removeHarness(id),
    [removeHarness],
  );

  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      addToast(t("composer.urlCopied"), "success");
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = window.location.href;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        addToast(t("composer.urlCopied"), "success");
      } catch {
        // silent
      }
    }
  }, [addToast, t]);

  const handleClearAll = useCallback(() => {
    clear();
    resetModifications();
    goToStep("select");
  }, [clear, resetModifications, goToStep]);

  const canNavigateTo = useCallback(
    (target: typeof step) => {
      if (target === "select") return true;
      if (target === "customize") return selectedIds.length > 0;
      if (target === "export") return selectedIds.length > 0;
      return false;
    },
    [selectedIds.length],
  );

  const enabledAgentCount = merged
    ? merged.agents.filter((a) => isAgentEnabled(a.id)).length
    : 0;

  if (catalogError) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">{catalogError}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            {t("composer.title")}
          </h1>
          <p className="mt-2 text-[var(--muted-foreground)]">
            {t("composer.description")}
          </p>
        </div>
        {selectedIds.length > 0 && (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleCopyUrl}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] active:bg-[var(--secondary)] transition-base focus-ring"
            >
              {t("composer.copyUrl")}
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] active:bg-[var(--secondary)] transition-base focus-ring"
            >
              {t("composer.reset")}
            </button>
          </div>
        )}
      </div>

      {/* Stepper */}
      <ComposerStepper
        currentStep={step}
        stepIndex={stepIndex}
        steps={steps}
        onStepClick={goToStep}
        canNavigateTo={canNavigateTo}
      />

      {/* Step content */}
      <div key={step} className="animate-slide-in">
        {step === "select" && (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch" style={{ minHeight: "70vh" }}>
            <div className="w-full shrink-0 lg:w-[350px]">
              <HarnessSelector
                catalog={catalog}
                selectedIds={selectedIds}
                onAdd={handleAdd}
                onRemove={handleRemove}
              />
            </div>
            <div className="min-w-0 flex-1">
              <CompositionPreview
                merged={merged}
                loading={loading}
                selectedCount={selectedIds.length}
                loadedHarnesses={loadedHarnesses}
                isAgentEnabled={isAgentEnabled}
                onToggleAgent={toggleAgent}
                onNext={canGoNext ? nextStep : undefined}
                onSkipToExport={selectedIds.length > 0 ? () => goToStep("export") : undefined}
              />
            </div>
          </div>
        )}

        {step === "customize" && merged && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-base focus-ring"
              >
                &larr; {t("composer.back")}
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-[var(--primary-foreground)] hover:brightness-110 active:brightness-95 transition-base focus-ring"
              >
                {t("composer.next")} &rarr;
              </button>
            </div>
            <CustomizePanel harness={merged} onClose={prevStep} />
          </div>
        )}

        {step === "export" && merged && (
          <ComposerExportPanel
            merged={merged}
            modifications={modifications}
            enabledAgentCount={enabledAgentCount}
            changeCount={modifications.length}
            onBack={prevStep}
          />
        )}
      </div>
    </main>
  );
}
