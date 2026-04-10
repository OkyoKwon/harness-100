import { describe, it, expect } from "vitest";
import { toHarness, fromHarness, toSlug, createBlankAgent, createAgentFromTemplate } from "../custom-harness-converter";
import type { Harness } from "../types";
import type { CustomHarness, CustomAgent } from "../custom-harness-types";

function makeCustomHarness(overrides: Partial<CustomHarness> = {}): CustomHarness {
  return {
    id: "custom_abc123",
    slug: "test-harness",
    name: "Test Harness",
    description: "A test harness for testing",
    category: "development",
    agents: [
      {
        id: "a1",
        name: "agent-one",
        role: "first agent",
        description: "does things",
        tools: ["Read", "Write"],
        outputTemplate: "_workspace/out.md",
        dependencies: [],
        enabled: true,
      },
      {
        id: "a2",
        name: "agent-two",
        role: "second agent",
        description: "does other things",
        tools: ["Bash"],
        outputTemplate: "",
        dependencies: ["a1"],
        enabled: true,
      },
      {
        id: "a3",
        name: "agent-disabled",
        role: "disabled agent",
        description: "should be excluded",
        tools: ["Read"],
        outputTemplate: "",
        dependencies: [],
        enabled: false,
      },
    ],
    skill: {
      id: "s1",
      name: "test-skill",
      triggerConditions: ["run test"],
      executionOrder: [
        { agentId: "a1", parallel: false, dependsOn: [] },
        { agentId: "a2", parallel: false, dependsOn: ["a1"] },
        { agentId: "a3", parallel: false, dependsOn: [] },
      ],
      modes: [],
      extensionSkills: [],
    },
    frameworks: ["React", "Node.js"],
    createdAt: "2026-04-10T00:00:00Z",
    updatedAt: "2026-04-10T00:00:00Z",
    version: 1,
    ...overrides,
  };
}

describe("toHarness", () => {
  it("converts CustomHarness to Harness with id=0", () => {
    const custom = makeCustomHarness();
    const result = toHarness(custom);
    expect(result.id).toBe(0);
    expect(result.slug).toBe("test-harness");
    expect(result.name).toBe("Test Harness");
  });

  it("filters out disabled agents", () => {
    const custom = makeCustomHarness();
    const result = toHarness(custom);
    expect(result.agents).toHaveLength(2);
    expect(result.agents.every((a) => a.id !== "a3")).toBe(true);
  });

  it("removes enabled field from agents", () => {
    const result = toHarness(makeCustomHarness());
    expect(result.agents[0]).not.toHaveProperty("enabled");
  });

  it("filters disabled agents from execution order", () => {
    const result = toHarness(makeCustomHarness());
    expect(result.skill.executionOrder).toHaveLength(2);
    expect(result.skill.executionOrder.some((s) => s.agentId === "a3")).toBe(false);
  });

  it("sets agentCount to active agents count", () => {
    const result = toHarness(makeCustomHarness());
    expect(result.agentCount).toBe(2);
  });

  it("sets popularityRank to 0", () => {
    expect(toHarness(makeCustomHarness()).popularityRank).toBe(0);
  });

  it("sets rawFiles to undefined", () => {
    expect(toHarness(makeCustomHarness()).rawFiles).toBeUndefined();
  });
});

describe("fromHarness", () => {
  const source: Harness = {
    id: 42,
    slug: "source-harness",
    name: "Source Harness",
    description: "Original harness",
    category: "business",
    agents: [
      { id: "x1", name: "agent-x", role: "x role", description: "x desc", tools: ["Read"], outputTemplate: "", dependencies: [] },
    ],
    skill: {
      id: "sk1",
      name: "source-skill",
      triggerConditions: ["trigger"],
      executionOrder: [{ agentId: "x1", parallel: false, dependsOn: [] }],
      modes: [],
      extensionSkills: [],
    },
    frameworks: ["Python"],
    agentCount: 1,
    popularityRank: 5,
  };

  it("creates a CustomHarness with new id", () => {
    const result = fromHarness(source);
    expect(result.id).toBeDefined();
    expect(result.id).not.toBe(42);
    expect(typeof result.id).toBe("string");
  });

  it("sets baseHarnessId to source id", () => {
    expect(fromHarness(source).baseHarnessId).toBe(42);
  });

  it("adds enabled: true to all agents", () => {
    const result = fromHarness(source);
    expect(result.agents.every((a) => a.enabled === true)).toBe(true);
  });

  it("copies all fields", () => {
    const result = fromHarness(source);
    expect(result.name).toBe("Source Harness");
    expect(result.category).toBe("business");
    expect(result.frameworks).toEqual(["Python"]);
  });
});

describe("toSlug", () => {
  it("converts name to kebab-case", () => {
    expect(toSlug("My Harness Name")).toBe("my-harness-name");
  });

  it("handles special characters", () => {
    expect(toSlug("PR Review (Auto)")).toBe("pr-review-auto");
  });

  it("returns fallback for empty string", () => {
    expect(toSlug("")).toBe("custom-harness");
  });
});

describe("createBlankAgent", () => {
  it("creates an agent with unique id", () => {
    const a1 = createBlankAgent();
    const a2 = createBlankAgent();
    expect(a1.id).not.toBe(a2.id);
  });

  it("has enabled=true", () => {
    expect(createBlankAgent().enabled).toBe(true);
  });

  it("has default tools", () => {
    expect(createBlankAgent().tools).toEqual(["Read", "Write", "Edit"]);
  });
});

describe("createAgentFromTemplate", () => {
  it("copies template fields", () => {
    const template = {
      name: "tpl-agent",
      role: "tpl role",
      description: "tpl desc",
      tools: ["Bash", "Grep"] as ReadonlyArray<string>,
      outputTemplate: "_workspace/out.md",
    };
    const result = createAgentFromTemplate(template);
    expect(result.name).toBe("tpl-agent");
    expect(result.role).toBe("tpl role");
    expect(result.tools).toEqual(["Bash", "Grep"]);
    expect(result.enabled).toBe(true);
    expect(result.dependencies).toEqual([]);
  });
});
