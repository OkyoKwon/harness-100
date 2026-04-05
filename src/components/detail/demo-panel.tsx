"use client";

import { useMemo, useCallback } from "react";
import type { Agent } from "@/lib/types";
import { useLocale } from "@/hooks/use-locale";
import { useDemo } from "@/hooks/use-demo";
import { t } from "@/lib/translations";
import { DemoPromptBubble } from "./demo-prompt-bubble";
import { DemoProgressBar } from "./demo-progress-bar";
import { DemoStepCard } from "./demo-step-card";

interface DemoPanelProps {
  readonly harnessId: number;
  readonly agents: ReadonlyArray<Agent>;
  readonly onActiveAgentChange?: (agentId: string | null) => void;
}

export function DemoPanel({
  harnessId,
  agents,
  onActiveAgentChange,
}: DemoPanelProps) {
  const { locale } = useLocale();
  const demo = useDemo(harnessId, locale);

  const agentMap = useMemo(
    () => new Map(agents.map((a) => [a.id, a])),
    [agents],
  );

  const agentNames = useMemo(
    () =>
      demo.scenario?.steps.map(
        (s) => agentMap.get(s.agentId)?.name ?? s.agentId,
      ) ?? [],
    [demo.scenario, agentMap],
  );

  // Notify parent of active agent changes
  const prevAgentIdRef = useMemo(() => ({ current: null as string | null }), []);
  if (demo.activeAgentId !== prevAgentIdRef.current) {
    prevAgentIdRef.current = demo.activeAgentId;
    onActiveAgentChange?.(demo.activeAgentId);
  }

  const handleStepClick = useCallback(
    (index: number) => demo.goToStep(index),
    [demo.goToStep],
  );

  // Idle state — show trigger button
  if (demo.status === "idle") {
    return (
      <div className="mb-6">
        <button
          type="button"
          onClick={demo.startDemo}
          className="w-full rounded-lg border border-dashed border-[var(--primary)] bg-[var(--card)] px-4 py-4 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors duration-200 cursor-pointer"
        >
          &#9654;&#xFE0E; {t(locale, "demo.seeItInAction")}
        </button>
      </div>
    );
  }

  // Loading state
  if (demo.status === "loading") {
    return (
      <div className="mb-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 text-center">
        <div className="inline-block w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-sm text-[var(--muted)]">
          {t(locale, "demo.loading")}
        </p>
      </div>
    );
  }

  // Error state
  if (demo.status === "error") {
    return (
      <div className="mb-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 text-center">
        <p className="text-sm text-[var(--muted)]">
          {t(locale, "demo.error")}
        </p>
      </div>
    );
  }

  // Ready / Playing state
  const { scenario, currentStep, currentStepIndex, totalSteps, status } = demo;
  if (!scenario || !currentStep) return null;

  const isPlaying = status === "playing";
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === totalSteps - 1;

  return (
    <div className="mb-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
      {/* Section title */}
      <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
        {t(locale, "demo.title")}
      </h3>

      {/* User prompt bubble */}
      <DemoPromptBubble
        prompt={scenario.userPrompt}
        label={t(locale, "demo.userPrompt")}
      />

      {/* Progress bar */}
      <DemoProgressBar
        totalSteps={totalSteps}
        currentStepIndex={currentStepIndex}
        isPlaying={isPlaying}
        agentNames={agentNames}
        onStepClick={handleStepClick}
        stepLabel={t(locale, "demo.stepOf", {
          current: currentStepIndex + 1,
          total: totalSteps,
        })}
      />

      {/* Current step card */}
      <DemoStepCard
        step={currentStep}
        agent={agentMap.get(currentStep.agentId)}
        toolsLabel={t(locale, "demo.toolsUsed")}
        outputLabel={t(locale, "demo.outputPreview")}
      />

      {/* Controls */}
      <div className="flex items-center justify-between mt-4 gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={demo.prevStep}
            disabled={isFirst}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--foreground)] disabled:opacity-30 hover:bg-[var(--background)] transition-colors cursor-pointer disabled:cursor-default"
          >
            &#9664; {t(locale, "demo.prev")}
          </button>
          <button
            type="button"
            onClick={demo.nextStep}
            disabled={isLast}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--foreground)] disabled:opacity-30 hover:bg-[var(--background)] transition-colors cursor-pointer disabled:cursor-default"
          >
            {t(locale, "demo.next")} &#9654;
          </button>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={demo.toggleAutoPlay}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              isPlaying
                ? "bg-[var(--primary)] text-white"
                : "border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"
            }`}
          >
            {isPlaying
              ? `⏸ ${t(locale, "demo.pause")}`
              : `▶▶ ${t(locale, "demo.autoPlay")}`}
          </button>
          <button
            type="button"
            onClick={demo.reset}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] hover:bg-[var(--background)] transition-colors cursor-pointer"
          >
            {t(locale, "demo.restart")}
          </button>
        </div>
      </div>
    </div>
  );
}
