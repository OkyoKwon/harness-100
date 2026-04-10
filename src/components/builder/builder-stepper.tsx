import { cn } from "@/lib/cn";
import { useLocale } from "@/hooks/use-locale";
import type { BuilderStep } from "@/hooks/use-builder-navigation";

const STEPS: ReadonlyArray<{ step: BuilderStep; key: string }> = [
  { step: 1, key: "builder.step.meta" },
  { step: 2, key: "builder.step.agents" },
  { step: 3, key: "builder.step.skill" },
  { step: 4, key: "builder.step.review" },
];

interface BuilderStepperProps {
  readonly currentStep: BuilderStep;
  readonly onStepClick: (step: number) => void;
}

export function BuilderStepper({ currentStep, onStepClick }: BuilderStepperProps) {
  const { t } = useLocale();

  return (
    <nav aria-label="Builder steps">
      <ol role="list" className="flex items-center gap-2">
        {STEPS.map(({ step, key }, i) => {
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;

          return (
            <li key={step} role="listitem" className="flex items-center gap-2">
              {i > 0 && (
                <div
                  className={cn(
                    "hidden sm:block h-px w-6 lg:w-10",
                    isCompleted ? "bg-[var(--primary)]" : "bg-[var(--border)]",
                  )}
                  aria-hidden="true"
                />
              )}
              <button
                type="button"
                onClick={() => onStepClick(step)}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-base focus-ring",
                  isCurrent && "bg-[var(--primary)] text-[var(--primary-foreground)]",
                  isCompleted && "text-[var(--primary)] hover:bg-[var(--muted)]",
                  !isCurrent && !isCompleted && "text-[var(--muted-foreground)] hover:bg-[var(--muted)]",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                    isCurrent && "bg-white/20",
                    isCompleted && "bg-[var(--primary)] text-[var(--primary-foreground)]",
                    !isCurrent && !isCompleted && "bg-[var(--muted)]",
                  )}
                >
                  {isCompleted ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    step
                  )}
                </span>
                <span className="hidden sm:inline">{t(key)}</span>
              </button>
            </li>
          );
        })}
      </ol>
      {/* Mobile: show current step label */}
      <p className="mt-1 text-center text-xs text-[var(--muted-foreground)] sm:hidden">
        {t(STEPS[currentStep - 1].key)}
      </p>
    </nav>
  );
}
