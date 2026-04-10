import type {
  Agent,
  Category,
  Harness,
  HarnessMeta,
  Skill,
  ExecutionStep,
  SkillMode,
} from "@/lib/types";

let idCounter = 1;

export function resetFixtureCounter(): void {
  idCounter = 1;
}

export function createAgent(overrides?: Partial<Agent>): Agent {
  const id = overrides?.id ?? `agent-${idCounter++}`;
  return {
    id,
    name: `Agent ${id}`,
    role: "Test role",
    description: "Test description",
    instructions: "",
    tools: ["Read", "Write"],
    outputTemplate: "# Output",
    dependencies: [],
    ...overrides,
  };
}

export function createExecutionStep(
  overrides?: Partial<ExecutionStep>,
): ExecutionStep {
  return {
    agentId: overrides?.agentId ?? "agent-1",
    parallel: false,
    dependsOn: [],
    ...overrides,
  };
}

export function createSkillMode(overrides?: Partial<SkillMode>): SkillMode {
  return {
    name: "Default Mode",
    triggerPattern: "default trigger",
    agents: ["agent-1"],
    ...overrides,
  };
}

export function createSkill(
  agents: ReadonlyArray<Agent>,
  overrides?: Partial<Skill>,
): Skill {
  return {
    id: "test-skill",
    name: "Test Skill",
    triggerConditions: ["trigger condition"],
    executionOrder: agents.map((a) => createExecutionStep({ agentId: a.id })),
    modes: [
      createSkillMode({ name: "Full", agents: agents.map((a) => a.id) }),
    ],
    extensionSkills: [],
    ...overrides,
  };
}

export function createHarness(overrides?: Partial<Harness>): Harness {
  const agents = overrides?.agents ?? [createAgent(), createAgent()];
  return {
    id: overrides?.id ?? idCounter++,
    slug: "test-harness",
    name: "Test Harness",
    description: "A test harness",
    category: "development",
    agents,
    skill: createSkill(agents),
    frameworks: ["vitest"],
    agentCount: agents.length,
    popularityRank: 0,
    ...overrides,
  };
}

export function createHarnessMeta(
  overrides?: Partial<HarnessMeta>,
): HarnessMeta {
  return {
    id: overrides?.id ?? idCounter++,
    slug: "test-harness",
    name: "Test Harness",
    description: "A test harness",
    category: "development",
    agentCount: 3,
    frameworks: ["vitest"],
    popularityRank: 0,
    ...overrides,
  };
}

/**
 * Creates a set of 5 harness metas with varying ranks, categories, and agent counts.
 */
export function createCatalogFixture(): ReadonlyArray<HarnessMeta> {
  return [
    createHarnessMeta({
      id: 16,
      slug: "fullstack-web-app",
      name: "Fullstack Web App",
      description: "Full stack web application development harness",
      category: "development",
      agentCount: 5,
      popularityRank: 1,
    }),
    createHarnessMeta({
      id: 21,
      slug: "code-reviewer",
      name: "Code Reviewer",
      description: "Automated code review pipeline",
      category: "development",
      agentCount: 4,
      popularityRank: 2,
    }),
    createHarnessMeta({
      id: 1,
      slug: "youtube-production",
      name: "YouTube Production",
      description: "YouTube content creation workflow",
      category: "content",
      agentCount: 6,
      popularityRank: 3,
    }),
    createHarnessMeta({
      id: 43,
      slug: "startup-launcher",
      name: "Startup Launcher",
      description: "Startup planning and launch toolkit",
      category: "business",
      agentCount: 7,
      popularityRank: 4,
    }),
    createHarnessMeta({
      id: 32,
      slug: "data-analysis",
      name: "Data Analysis",
      description: "Data analysis and visualization pipeline",
      category: "data-ai",
      agentCount: 3,
      popularityRank: 5,
    }),
  ];
}

/**
 * Creates a larger catalog with items spanning ranks 1-15 for ranking page tests.
 */
export function createRankingFixture(): ReadonlyArray<HarnessMeta> {
  const categories: ReadonlyArray<Category> = [
    "development",
    "content",
    "business",
    "data-ai",
    "education",
  ];
  return Array.from({ length: 15 }, (_, i) => {
    const rank = i + 1;
    return createHarnessMeta({
      id: rank,
      slug: `harness-${rank}`,
      name: `Harness Rank ${rank}`,
      description: `Description for rank ${rank} harness`,
      category: categories[i % categories.length],
      agentCount: 10 - Math.min(i, 7),
      popularityRank: rank,
    });
  });
}
