"use client";

import { useCallback } from "react";

interface DemoProgressBarProps {
  readonly totalSteps: number;
  readonly currentStepIndex: number;
  readonly isPlaying: boolean;
  readonly agentNames: ReadonlyArray<string>;
  readonly onStepClick: (index: number) => void;
  readonly stepLabel: string;
}

export function DemoProgressBar({
  totalSteps,
  currentStepIndex,
  isPlaying,
  agentNames,
  onStepClick,
  stepLabel,
}: DemoProgressBarProps) {
  const handleClick = useCallback(
    (index: number) => () => onStepClick(index),
    [onStepClick],
  );

  return (
    <div className="mb-4">
      <div className="flex items-center gap-1 mb-2 overflow-x-auto scrollbar-hide">
        {Array.from({ length: totalSteps }, (_, i) => {
          const isCompleted = i < currentStepIndex;
          const isCurrent = i === currentStepIndex;

          return (
            <div key={i} className="flex items-center flex-shrink-0">
              <button
                type="button"
                onClick={handleClick(i)}
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium
                  transition-all duration-200 cursor-pointer
                  ${
                    isCurrent
                      ? "bg-[var(--primary)] text-white scale-110 shadow-md"
                      : isCompleted
                        ? "bg-[var(--primary)] opacity-60 text-white"
                        : "bg-[var(--badge-default-bg)] text-[var(--muted)]"
                  }
                  ${isPlaying && isCurrent ? "animate-pulse" : ""}
                `}
                aria-label={`${agentNames[i] ?? `Step ${i + 1}`}`}
                aria-current={isCurrent ? "step" : undefined}
              >
                {i + 1}
              </button>
              {i < totalSteps - 1 && (
                <div
                  className={`w-4 h-0.5 mx-0.5 transition-colors duration-200 ${
                    i < currentStepIndex
                      ? "bg-[var(--primary)] opacity-60"
                      : "bg-[var(--border)]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-[var(--muted)]">{stepLabel}</p>
    </div>
  );
}
