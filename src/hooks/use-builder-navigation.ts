"use client";

import { useState, useCallback } from "react";

export type BuilderStep = 1 | 2 | 3 | 4;

export function useBuilderNavigation() {
  const [currentStep, setCurrentStep] = useState<BuilderStep>(1);

  const goTo = useCallback((step: number) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step as BuilderStep);
    }
  }, []);

  const next = useCallback(() => {
    setCurrentStep((prev) => (prev < 4 ? ((prev + 1) as BuilderStep) : prev));
  }, []);

  const prev = useCallback(() => {
    setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as BuilderStep) : prev));
  }, []);

  return { currentStep, goTo, next, prev } as const;
}
