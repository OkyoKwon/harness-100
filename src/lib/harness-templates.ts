import type { Category } from "./types";
import type { AgentTemplate } from "./custom-harness-types";
import { AGENT_TEMPLATES } from "./agent-templates";

export interface HarnessTemplate {
  readonly id: string;
  readonly nameKey: string;
  readonly descriptionKey: string;
  readonly category: Category;
  readonly agentNames: ReadonlyArray<string>;
  readonly color: string;
}

export const HARNESS_TEMPLATES: ReadonlyArray<HarnessTemplate> = [
  {
    id: "pr-review",
    nameKey: "builder.template.prReview.name",
    descriptionKey: "builder.template.prReview.desc",
    category: "development",
    agentNames: ["code-reviewer", "test-writer", "security-analyst"],
    color: "#2563eb",
  },
  {
    id: "doc-gen",
    nameKey: "builder.template.docGen.name",
    descriptionKey: "builder.template.docGen.desc",
    category: "content",
    agentNames: ["doc-writer", "researcher"],
    color: "#f59e0b",
  },
  {
    id: "fullstack",
    nameKey: "builder.template.fullstack.name",
    descriptionKey: "builder.template.fullstack.desc",
    category: "development",
    agentNames: ["architect", "code-reviewer", "test-writer"],
    color: "#8b5cf6",
  },
  {
    id: "security",
    nameKey: "builder.template.security.name",
    descriptionKey: "builder.template.security.desc",
    category: "development",
    agentNames: ["security-analyst", "code-reviewer"],
    color: "#059669",
  },
] as const;

/** Resolve agent names to AgentTemplate objects from the global template list */
export function resolveTemplateAgents(
  agentNames: ReadonlyArray<string>,
): ReadonlyArray<AgentTemplate> {
  return agentNames.flatMap((name) => {
    const found = AGENT_TEMPLATES.find((t) => t.name === name);
    return found ? [found] : [];
  });
}
