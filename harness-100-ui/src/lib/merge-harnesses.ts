import type { Agent, Harness, Skill, ExecutionStep } from "./types";

/**
 * Merge multiple harnesses into a single combined harness.
 * Agents are prefixed with harness slug to avoid filename conflicts.
 * Skills are combined into a single orchestrator.
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

  for (const harness of harnesses) {
    const prefixedAgents = harness.agents.map((agent) => ({
      ...agent,
      id: `${harness.slug}_${agent.id}`,
      dependencies: agent.dependencies.map((d) => `${harness.slug}_${d}`),
    }));
    allAgents.push(...prefixedAgents);

    const prefixedSteps = harness.skill.executionOrder.map((step) => ({
      ...step,
      agentId: `${harness.slug}_${step.agentId}`,
      dependsOn: step.dependsOn.map((d) => `${harness.slug}_${d}`),
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
    slug: harnesses.map((h) => h.slug).join("_"),
    name: harnesses.map((h) => h.name).join(" + "),
    description: harnesses.map((h) => h.description).join(". "),
    category: harnesses[0].category,
    agents: allAgents,
    skill: mergedSkill,
    frameworks: [...allFrameworks],
    agentCount: allAgents.length,
  };
}
