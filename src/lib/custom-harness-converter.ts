import { nanoid } from "nanoid";
import type { Agent, Harness } from "./types";
import type { AgentSourceRef, CustomAgent, CustomHarness } from "./custom-harness-types";

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    || "custom-harness";
}

/** Convert CustomHarness → Harness for zip-builder / local-writer */
export function toHarness(custom: CustomHarness): Harness {
  const activeAgents = custom.agents.filter((a) => a.enabled);

  const activeIds = new Set(activeAgents.map((a) => a.id));

  return {
    id: 0,
    slug: custom.slug,
    name: custom.name,
    description: custom.description,
    category: custom.category,
    agents: activeAgents.map(({ enabled: _, ...agent }) => agent),
    skill: {
      ...custom.skill,
      executionOrder: custom.skill.executionOrder.filter((step) =>
        activeIds.has(step.agentId),
      ),
    },
    frameworks: custom.frameworks,
    agentCount: activeAgents.length,
    popularityRank: 0,
    rawFiles: undefined,
  };
}

/** Clone an existing Harness → CustomHarness */
export function fromHarness(source: Harness): CustomHarness {
  return {
    id: nanoid(),
    slug: toSlug(source.slug) + "-custom",
    name: source.name,
    description: source.description,
    category: source.category,
    agents: source.agents.map((agent) => ({ ...agent, enabled: true })),
    skill: source.skill,
    frameworks: [...source.frameworks],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
    baseHarnessId: source.id,
  };
}

/** Create a blank CustomAgent with defaults */
export function createBlankAgent(): CustomAgent {
  return {
    id: nanoid(),
    name: "",
    role: "",
    description: "",
    tools: ["Read", "Write", "Edit"],
    outputTemplate: "",
    dependencies: [],
    enabled: true,
  };
}

/** Create a CustomAgent from a template */
export function createAgentFromTemplate(
  template: { name: string; role: string; description: string; tools: ReadonlyArray<string>; outputTemplate: string },
): CustomAgent {
  return {
    id: nanoid(),
    name: template.name,
    role: template.role,
    description: template.description,
    tools: template.tools,
    outputTemplate: template.outputTemplate,
    dependencies: [],
    enabled: true,
  };
}

/** Create a CustomAgent from a reused existing agent */
export function createAgentFromReuse(
  source: Agent,
  ref: AgentSourceRef,
): CustomAgent {
  return {
    id: nanoid(),
    name: source.name,
    role: source.role,
    description: source.description,
    tools: source.tools,
    outputTemplate: source.outputTemplate,
    dependencies: [],
    enabled: true,
    sourceRef: ref,
  };
}

export { toSlug };
