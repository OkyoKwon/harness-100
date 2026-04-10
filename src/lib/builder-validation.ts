import type { CustomAgent, CustomHarness, CustomHarnessStore, BuilderMeta } from "./custom-harness-types";
import type { Skill } from "./types";

/** Safely parse localStorage data into CustomHarnessStore */
export function parseCustomHarnessStore(raw: unknown): CustomHarnessStore {
  const empty: CustomHarnessStore = { version: 1, harnesses: [] };

  if (typeof raw !== "string") return empty;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return empty;
    if (!Array.isArray(parsed.harnesses)) return empty;

    switch (parsed.version) {
      case 1:
        return parsed as CustomHarnessStore;
      default:
        return empty;
    }
  } catch {
    return empty;
  }
}

/** Detect circular dependencies using Kahn's algorithm. Returns cycle node names or null. */
export function detectCycle(agents: ReadonlyArray<CustomAgent>): ReadonlyArray<string> | null {
  const enabledAgents = agents.filter((a) => a.enabled);
  const ids = new Set(enabledAgents.map((a) => a.id));

  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  for (const agent of enabledAgents) {
    inDegree.set(agent.id, 0);
    adj.set(agent.id, []);
  }

  for (const agent of enabledAgents) {
    for (const dep of agent.dependencies) {
      if (!ids.has(dep)) continue;
      adj.get(dep)?.push(agent.id);
      inDegree.set(agent.id, (inDegree.get(agent.id) ?? 0) + 1);
    }
  }

  const queue = [...inDegree.entries()]
    .filter(([, deg]) => deg === 0)
    .map(([id]) => id);
  const sorted: string[] = [];

  while (queue.length > 0) {
    const node = queue.shift()!;
    sorted.push(node);
    for (const neighbor of adj.get(node) ?? []) {
      const newDeg = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  if (sorted.length < enabledAgents.length) {
    const sortedSet = new Set(sorted);
    return enabledAgents
      .filter((a) => !sortedSet.has(a.id))
      .map((a) => a.name || a.id);
  }

  return null;
}

export interface ValidationErrors {
  readonly meta: Readonly<Record<string, string>>;
  readonly agents: Readonly<Record<string, string>>;
  readonly skill: Readonly<Record<string, string>>;
}

const EMPTY_ERRORS: ValidationErrors = { meta: {}, agents: {}, skill: {} };

export function validateMeta(meta: BuilderMeta): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!meta.name || meta.name.trim().length < 2) {
    errors.name = "builder.validation.nameRequired";
  } else if (meta.name.trim().length > 60) {
    errors.name = "builder.validation.nameTooLong";
  }

  if (!meta.description || meta.description.trim().length < 10) {
    errors.description = "builder.validation.descRequired";
  } else if (meta.description.trim().length > 500) {
    errors.description = "builder.validation.descTooLong";
  }

  if (!meta.category) {
    errors.category = "builder.validation.categoryRequired";
  }

  return errors;
}

export function validateAgents(agents: ReadonlyArray<CustomAgent>): Record<string, string> {
  const errors: Record<string, string> = {};
  const enabledAgents = agents.filter((a) => a.enabled);

  if (enabledAgents.length === 0) {
    errors._global = "builder.validation.minAgents";
  }

  for (const agent of enabledAgents) {
    if (!agent.name.trim()) {
      errors[`${agent.id}_name`] = "builder.validation.agentNameRequired";
    }
    if (!agent.role.trim()) {
      errors[`${agent.id}_role`] = "builder.validation.agentRoleRequired";
    }
  }

  const cycle = detectCycle(agents);
  if (cycle) {
    errors._cycle = "builder.validation.cyclicDeps";
  }

  return errors;
}

export function validateSkill(skill: Skill): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!skill.name.trim()) {
    errors.name = "builder.validation.skillNameRequired";
  }

  if (skill.triggerConditions.length === 0 || !skill.triggerConditions.some((tc) => tc.trim())) {
    errors.triggers = "builder.validation.minTriggers";
  }

  return errors;
}

export function validateAll(
  meta: BuilderMeta,
  agents: ReadonlyArray<CustomAgent>,
  skill: Skill,
): ValidationErrors {
  const metaErrors = validateMeta(meta);
  const agentErrors = validateAgents(agents);
  const skillErrors = validateSkill(skill);

  if (Object.keys(metaErrors).length === 0 && Object.keys(agentErrors).length === 0 && Object.keys(skillErrors).length === 0) {
    return EMPTY_ERRORS;
  }

  return { meta: metaErrors, agents: agentErrors, skill: skillErrors };
}

export function hasErrors(errors: ValidationErrors): boolean {
  return (
    Object.keys(errors.meta).length > 0 ||
    Object.keys(errors.agents).length > 0 ||
    Object.keys(errors.skill).length > 0
  );
}
