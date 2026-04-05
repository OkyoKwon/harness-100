import type { Agent, ExecutionStep } from "./types";

export function computeDepth(
  agents: ReadonlyArray<Agent>,
): Map<string, number> {
  const ids = new Set(agents.map((a) => a.id));
  const depth = new Map<string, number>();

  let changed = true;
  while (changed) {
    changed = false;
    for (const agent of agents) {
      const deps = agent.dependencies.filter((d) => ids.has(d));
      if (deps.length === 0) {
        if (!depth.has(agent.id)) {
          depth.set(agent.id, 0);
          changed = true;
        }
      } else {
        const depDepths = deps.map((d) => depth.get(d));
        if (depDepths.every((d) => d !== undefined)) {
          const col = Math.max(...(depDepths as number[])) + 1;
          if (depth.get(agent.id) !== col) {
            depth.set(agent.id, col);
            changed = true;
          }
        }
      }
    }
  }

  for (const a of agents) {
    if (!depth.has(a.id)) depth.set(a.id, 0);
  }
  return depth;
}

export interface StepGroup {
  readonly step: number;
  readonly parallel: boolean;
  readonly agents: ReadonlyArray<Agent>;
}

export function groupAgentsByStep(
  agents: ReadonlyArray<Agent>,
  _executionOrder: ReadonlyArray<ExecutionStep>,
): ReadonlyArray<StepGroup> {
  const depthMap = computeDepth(agents);

  // Group agents by depth
  const byDepth = new Map<number, Agent[]>();
  for (const agent of agents) {
    const d = depthMap.get(agent.id) ?? 0;
    byDepth.set(d, [...(byDepth.get(d) ?? []), agent]);
  }

  // Sort depths and build step groups
  const sortedDepths = Array.from(byDepth.keys()).sort((a, b) => a - b);
  return sortedDepths.map((depth, idx) => {
    const groupAgents = byDepth.get(depth) ?? [];
    return {
      step: idx + 1,
      parallel: groupAgents.length > 1,
      agents: groupAgents,
    };
  });
}
