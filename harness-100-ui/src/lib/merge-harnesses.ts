import type { Agent, Harness, Skill, ExecutionStep } from "./types";

/**
 * Merge multiple harnesses into a single combined harness.
 * Uses short numeric prefix (h0_, h1_) to avoid ID collisions.
 */
export function mergeHarnesses(harnesses: ReadonlyArray<Harness>): Harness {
  if (harnesses.length === 0) {
    throw new Error("At least one harness is required for merging");
  }

  if (harnesses.length === 1) {
    return harnesses[0];
  }

  const allAgents: Agent[] = [];
  const allSteps: ExecutionStep[] = [];
  const allFrameworks = new Set<string>();
  const allTriggers: string[] = [];

  for (let i = 0; i < harnesses.length; i++) {
    const harness = harnesses[i];
    const prefix = `h${i}`;

    const prefixedAgents = harness.agents.map((agent) => ({
      ...agent,
      id: `${prefix}_${agent.id}`,
      dependencies: agent.dependencies.map((d) => `${prefix}_${d}`),
    }));
    allAgents.push(...prefixedAgents);

    const prefixedSteps = harness.skill.executionOrder.map((step) => ({
      ...step,
      agentId: `${prefix}_${step.agentId}`,
      dependsOn: step.dependsOn.map((d) => `${prefix}_${d}`),
    }));
    allSteps.push(...prefixedSteps);

    for (const f of harness.frameworks) {
      allFrameworks.add(f);
    }

    allTriggers.push(...harness.skill.triggerConditions);
  }

  const mergedSkill: Skill = {
    id: "merged",
    name: "병합 워크플로우",
    triggerConditions: allTriggers,
    executionOrder: allSteps,
    modes: {
      full: allSteps,
      reduced: allSteps.filter((s) => !s.parallel),
      single: allSteps.slice(0, 1),
    },
  };

  return {
    id: 0,
    slug: "merged-harness",
    name: `${harnesses.length}개 하네스 조합`,
    description: harnesses.map((h) => h.name).join(", "),
    category: harnesses[0].category,
    agents: allAgents,
    skill: mergedSkill,
    frameworks: [...allFrameworks],
    agentCount: allAgents.length,
  };
}
