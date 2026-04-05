import type { Locale } from "./locale";
import type { Agent, Harness, Skill, ExecutionStep, SkillMode } from "./types";
import { t } from "./translations";

/**
 * Merge multiple harnesses into a single combined harness.
 * Uses short numeric prefix (h0_, h1_) to avoid ID collisions.
 */
export function mergeHarnesses(harnesses: ReadonlyArray<Harness>, locale: Locale = "ko"): Harness {
  if (harnesses.length === 0) {
    throw new Error("At least one harness is required for merging");
  }

  if (harnesses.length === 1) {
    return harnesses[0];
  }

  const allAgents: ReadonlyArray<Agent> = harnesses.flatMap((harness, i) => {
    const prefix = `h${i}`;
    return harness.agents.map((agent) => ({
      ...agent,
      id: `${prefix}_${agent.id}`,
      dependencies: agent.dependencies.map((d) => `${prefix}_${d}`),
    }));
  });

  const allSteps: ReadonlyArray<ExecutionStep> = harnesses.flatMap((harness, i) => {
    const prefix = `h${i}`;
    return harness.skill.executionOrder.map((step) => ({
      ...step,
      agentId: `${prefix}_${step.agentId}`,
      dependsOn: step.dependsOn.map((d) => `${prefix}_${d}`),
    }));
  });

  const allFrameworks: ReadonlyArray<string> = [
    ...new Set(harnesses.flatMap((h) => h.frameworks)),
  ];

  const allTriggers: ReadonlyArray<string> = harnesses.flatMap(
    (h) => h.skill.triggerConditions,
  );

  const allModes: ReadonlyArray<SkillMode> = harnesses.flatMap((harness, i) => {
    const prefix = `h${i}`;
    return harness.skill.modes.map((mode) => ({
      ...mode,
      name: `[${harness.name}] ${mode.name}`,
      agents: mode.agents.map((a) => `${prefix}_${a}`),
    }));
  });

  const mergedSkill: Skill = {
    id: "merged",
    name: t(locale, "merge.workflowName"),
    triggerConditions: allTriggers,
    executionOrder: allSteps,
    modes: [
      {
        name: t(locale, "merge.fullPipeline"),
        triggerPattern: t(locale, "merge.fullRequest"),
        agents: allAgents.map((a) => a.id),
      },
      ...allModes,
    ],
    extensionSkills: [],
  };

  return {
    id: 0,
    slug: "merged-harness",
    name: t(locale, "merge.combinedName", { count: harnesses.length }),
    description: harnesses.map((h) => h.name).join(", "),
    category: harnesses[0].category,
    agents: allAgents,
    skill: mergedSkill,
    frameworks: allFrameworks,
    agentCount: allAgents.length,
    popularityRank: 0,
  };
}
