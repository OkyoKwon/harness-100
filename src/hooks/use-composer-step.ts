"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export type ComposerStep = "select" | "customize" | "export";

const STEP_ORDER: ReadonlyArray<ComposerStep> = ["select", "customize", "export"];

function isValidStep(value: string | null): value is ComposerStep {
  return value !== null && STEP_ORDER.includes(value as ComposerStep);
}

export function useComposerStep(hasSelection: boolean) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [initialized, setInitialized] = useState(false);
  const [step, setStepInternal] = useState<ComposerStep>("select");

  // Restore step from URL on mount
  useEffect(() => {
    if (initialized) return;
    const stepParam = searchParams.get("step");
    if (isValidStep(stepParam)) {
      setStepInternal(stepParam);
    }
    setInitialized(true);
  }, [searchParams, initialized]);

  // Sync step to URL
  useEffect(() => {
    if (!initialized) return;
    const currentStep = searchParams.get("step") ?? "select";
    if (currentStep !== step) {
      const params = new URLSearchParams(searchParams.toString());
      if (step === "select") {
        params.delete("step");
      } else {
        params.set("step", step);
      }
      const queryString = params.toString();
      router.replace(queryString ? `?${queryString}` : "/composer", { scroll: false });
    }
  }, [step, initialized, searchParams, router]);

  const goToStep = useCallback((target: ComposerStep) => {
    setStepInternal(target);
  }, []);

  const nextStep = useCallback(() => {
    setStepInternal((current) => {
      const idx = STEP_ORDER.indexOf(current);
      return idx < STEP_ORDER.length - 1 ? STEP_ORDER[idx + 1] : current;
    });
  }, []);

  const prevStep = useCallback(() => {
    setStepInternal((current) => {
      const idx = STEP_ORDER.indexOf(current);
      return idx > 0 ? STEP_ORDER[idx - 1] : current;
    });
  }, []);

  const canGoNext = step === "select" ? hasSelection : step === "customize";
  const canGoPrev = step !== "select";
  const stepIndex = STEP_ORDER.indexOf(step);

  return {
    step,
    stepIndex,
    steps: STEP_ORDER,
    goToStep,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
  } as const;
}
