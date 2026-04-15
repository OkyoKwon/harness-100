"use client";

import type { ComposerStep } from "@/hooks/use-composer-step";
import { useLocale } from "@/hooks/use-locale";

interface ComposerStepperProps {
  readonly currentStep: ComposerStep;
  readonly stepIndex: number;
  readonly steps: ReadonlyArray<ComposerStep>;
  readonly onStepClick: (step: ComposerStep) => void;
  readonly canNavigateTo: (step: ComposerStep) => boolean;
}

const STEP_ICONS: Readonly<Record<ComposerStep, string>> = {
  select: "1",
  customize: "2",
  export: "3",
};

export function ComposerStepper({
  currentStep,
  stepIndex,
  steps,
  onStepClick,
  canNavigateTo,
}: ComposerStepperProps) {
  const { t } = useLocale();

  return (
    <nav className="mb-6" aria-label="Composer steps">
      <ol className="flex items-center justify-center gap-0">
        {steps.map((step, idx) => {
          const isActive = step === currentStep;
          const isCompleted = idx < stepIndex;
          const isClickable = canNavigateTo(step);

          return (
            <li key={step} className="flex items-center">
              {/* Connector line */}
              {idx > 0 && (
                <div
                  className={`h-0.5 w-8 sm:w-16 transition-base ${
                    idx <= stepIndex
                      ? "bg-[var(--primary)]"
                      : "bg-[var(--border)]"
                  }`}
                />
              )}

              {/* Step circle + label */}
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step)}
                disabled={!isClickable}
                className={`flex flex-col items-center gap-1.5 transition-base focus-ring rounded-lg px-2 py-1 ${
                  isClickable ? "cursor-pointer" : "cursor-default"
                }`}
                aria-current={isActive ? "step" : undefined}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)] ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--background)] scale-110"
                      : isCompleted
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "bg-[var(--secondary)] text-[var(--secondary-foreground)]"
                  }`}
                >
                  {isCompleted ? "✓" : STEP_ICONS[step]}
                </span>
                <span
                  className={`text-xs font-medium transition-base ${
                    isActive
                      ? "text-[var(--primary)]"
                      : isCompleted
                        ? "text-[var(--foreground)]"
                        : "text-[var(--muted-foreground)]"
                  }`}
                >
                  {t(`composer.step.${step}`)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
