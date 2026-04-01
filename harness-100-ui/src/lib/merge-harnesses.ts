import type { Agent, Harness, Skill, ExecutionStep, SkillMode } from "./types";

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
    name: "병합 워크플로우",
    triggerConditions: allTriggers,
    executionOrder: allSteps,
    modes: [
      {
        name: "풀 파이프라인",
        triggerPattern: "전체 작업 요청",
        agents: allAgents.map((a) => a.id),
      },
      ...allModes,
    ],
    extensionSkills: [],
  };

  return {
    id: 0,
    slug: "merged-harness",
    name: `${harnesses.length}개 하네스 조합`,
    description: harnesses.map((h) => h.name).join(", "),
    category: harnesses[0].category,
    agents: allAgents,
    skill: mergedSkill,
    frameworks: allFrameworks,
    agentCount: allAgents.length,
  };
}
