"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { DemoScenario, DemoStep } from "@/lib/types";
import { loadDemoScenario } from "@/lib/demo-loader";
import type { Locale } from "@/lib/locale";

export type DemoStatus = "idle" | "loading" | "error" | "ready" | "playing";

export interface UseDemoReturn {
  readonly status: DemoStatus;
  readonly scenario: DemoScenario | null;
  readonly currentStepIndex: number;
  readonly totalSteps: number;
  readonly currentStep: DemoStep | null;
  readonly activeAgentId: string | null;
  readonly goToStep: (index: number) => void;
  readonly nextStep: () => void;
  readonly prevStep: () => void;
  readonly toggleAutoPlay: () => void;
  readonly startDemo: () => void;
  readonly reset: () => void;
}

export function useDemo(harnessId: number, locale: Locale): UseDemoReturn {
  const [status, setStatus] = useState<DemoStatus>("idle");
  const [scenario, setScenario] = useState<DemoScenario | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalSteps = scenario?.steps.length ?? 0;
  const currentStep = scenario?.steps[currentStepIndex] ?? null;
  const activeAgentId =
    status === "ready" || status === "playing"
      ? currentStep?.agentId ?? null
      : null;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => clearTimer, [clearTimer]);

  const scheduleNext = useCallback(
    (step: DemoStep, stepIndex: number, steps: ReadonlyArray<DemoStep>) => {
      clearTimer();
      if (stepIndex >= steps.length - 1) {
        setStatus("ready");
        return;
      }
      timerRef.current = setTimeout(() => {
        const nextIndex = stepIndex + 1;
        setCurrentStepIndex(nextIndex);
        const nextStep = steps[nextIndex];
        if (nextStep) {
          scheduleNext(nextStep, nextIndex, steps);
        }
      }, step.durationMs);
    },
    [clearTimer],
  );

  const startDemo = useCallback(async () => {
    if (status === "loading") return;

    if (scenario) {
      setCurrentStepIndex(0);
      setStatus("ready");
      return;
    }

    setStatus("loading");
    const data = await loadDemoScenario(harnessId, locale);
    if (data && data.steps.length > 0) {
      setScenario(data);
      setCurrentStepIndex(0);
      setStatus("ready");
    } else {
      setStatus("error");
    }
  }, [status, scenario, harnessId, locale]);

  const goToStep = useCallback(
    (index: number) => {
      if (!scenario || index < 0 || index >= scenario.steps.length) return;
      clearTimer();
      setCurrentStepIndex(index);
      setStatus("ready");
    },
    [scenario, clearTimer],
  );

  const nextStep = useCallback(() => {
    if (!scenario) return;
    const next = Math.min(currentStepIndex + 1, scenario.steps.length - 1);
    clearTimer();
    setCurrentStepIndex(next);
    setStatus("ready");
  }, [scenario, currentStepIndex, clearTimer]);

  const prevStep = useCallback(() => {
    if (!scenario) return;
    const prev = Math.max(currentStepIndex - 1, 0);
    clearTimer();
    setCurrentStepIndex(prev);
    setStatus("ready");
  }, [scenario, currentStepIndex, clearTimer]);

  const toggleAutoPlay = useCallback(() => {
    if (!scenario) return;

    if (status === "playing") {
      clearTimer();
      setStatus("ready");
      return;
    }

    setStatus("playing");
    const step = scenario.steps[currentStepIndex];
    if (step) {
      scheduleNext(step, currentStepIndex, scenario.steps);
    }
  }, [scenario, status, currentStepIndex, clearTimer, scheduleNext]);

  const reset = useCallback(() => {
    clearTimer();
    setCurrentStepIndex(0);
    setStatus(scenario ? "ready" : "idle");
  }, [scenario, clearTimer]);

  return {
    status,
    scenario,
    currentStepIndex,
    totalSteps,
    currentStep,
    activeAgentId,
    goToStep,
    nextStep,
    prevStep,
    toggleAutoPlay,
    startDemo,
    reset,
  };
}
