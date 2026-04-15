import { describe, it, expect } from "vitest";
import {
  parseCustomHarnessStore,
  detectCycle,
  validateMeta,
  validateAgents,
  validateSkill,
  validateExtensionSkills,
  validateAll,
  hasErrors,
} from "../builder-validation";
import type { CustomAgent } from "../custom-harness-types";
import type { ExtensionSkill, Skill } from "../types";

function makeAgent(overrides: Partial<CustomAgent> = {}): CustomAgent {
  return {
    id: "agent-1",
    name: "test-agent",
    role: "test role",
    description: "test description",
    tools: ["Read"],
    outputTemplate: "",
    dependencies: [],
    enabled: true,
    ...overrides,
  };
}

describe("parseCustomHarnessStore", () => {
  it("returns empty store for null input", () => {
    const result = parseCustomHarnessStore(null);
    expect(result).toEqual({ version: 1, harnesses: [] });
  });

  it("returns empty store for non-string input", () => {
    expect(parseCustomHarnessStore(42)).toEqual({ version: 1, harnesses: [] });
    expect(parseCustomHarnessStore(undefined)).toEqual({ version: 1, harnesses: [] });
  });

  it("returns empty store for invalid JSON", () => {
    expect(parseCustomHarnessStore("not json")).toEqual({ version: 1, harnesses: [] });
  });

  it("returns empty store for missing harnesses array", () => {
    expect(parseCustomHarnessStore(JSON.stringify({ version: 1 }))).toEqual({ version: 1, harnesses: [] });
  });

  it("parses valid v1 store", () => {
    const store = { version: 1, harnesses: [{ id: "abc", name: "test" }] };
    const result = parseCustomHarnessStore(JSON.stringify(store));
    expect(result.version).toBe(1);
    expect(result.harnesses).toHaveLength(1);
  });

  it("returns empty store for unknown version", () => {
    const store = { version: 99, harnesses: [{ id: "abc" }] };
    expect(parseCustomHarnessStore(JSON.stringify(store))).toEqual({ version: 1, harnesses: [] });
  });
});

describe("detectCycle", () => {
  it("returns null for no agents", () => {
    expect(detectCycle([])).toBeNull();
  });

  it("returns null for agents without dependencies", () => {
    const agents = [
      makeAgent({ id: "a" }),
      makeAgent({ id: "b" }),
    ];
    expect(detectCycle(agents)).toBeNull();
  });

  it("returns null for valid dependency chain", () => {
    const agents = [
      makeAgent({ id: "a", dependencies: [] }),
      makeAgent({ id: "b", dependencies: ["a"] }),
      makeAgent({ id: "c", dependencies: ["b"] }),
    ];
    expect(detectCycle(agents)).toBeNull();
  });

  it("detects simple cycle", () => {
    const agents = [
      makeAgent({ id: "a", name: "agent-a", dependencies: ["b"] }),
      makeAgent({ id: "b", name: "agent-b", dependencies: ["a"] }),
    ];
    const result = detectCycle(agents);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(2);
  });

  it("detects three-node cycle", () => {
    const agents = [
      makeAgent({ id: "a", name: "A", dependencies: ["c"] }),
      makeAgent({ id: "b", name: "B", dependencies: ["a"] }),
      makeAgent({ id: "c", name: "C", dependencies: ["b"] }),
    ];
    expect(detectCycle(agents)).toHaveLength(3);
  });

  it("ignores disabled agents", () => {
    const agents = [
      makeAgent({ id: "a", dependencies: ["b"], enabled: true }),
      makeAgent({ id: "b", dependencies: ["a"], enabled: false }),
    ];
    expect(detectCycle(agents)).toBeNull();
  });

  it("ignores dependencies on non-existent agents", () => {
    const agents = [
      makeAgent({ id: "a", dependencies: ["unknown"] }),
    ];
    expect(detectCycle(agents)).toBeNull();
  });
});

describe("validateMeta", () => {
  it("requires name", () => {
    const errors = validateMeta({ name: "", description: "long enough description", category: "development",  });
    expect(errors.name).toBeDefined();
  });

  it("requires name >= 2 chars", () => {
    const errors = validateMeta({ name: "a", description: "long enough description", category: "development",  });
    expect(errors.name).toBeDefined();
  });

  it("requires description >= 10 chars", () => {
    const errors = validateMeta({ name: "valid name", description: "short", category: "development",  });
    expect(errors.description).toBeDefined();
  });

  it("requires category", () => {
    const errors = validateMeta({ name: "valid name", description: "long enough description", category: "",  });
    expect(errors.category).toBeDefined();
  });

  it("returns no errors for valid meta", () => {
    const errors = validateMeta({
      name: "My Harness",
      description: "This is a valid harness description",
      category: "development",
    });
    expect(Object.keys(errors)).toHaveLength(0);
  });
});

describe("validateAgents", () => {
  it("requires at least one enabled agent", () => {
    const errors = validateAgents([]);
    expect(errors._global).toBeDefined();
  });

  it("requires agent name", () => {
    const errors = validateAgents([makeAgent({ name: "" })]);
    expect(Object.keys(errors).some((k) => k.includes("_name"))).toBe(true);
  });

  it("requires agent role", () => {
    const errors = validateAgents([makeAgent({ role: "" })]);
    expect(Object.keys(errors).some((k) => k.includes("_role"))).toBe(true);
  });

  it("passes for valid agent", () => {
    const errors = validateAgents([makeAgent()]);
    expect(Object.keys(errors)).toHaveLength(0);
  });
});

describe("validateSkill", () => {
  const validSkill: Skill = {
    id: "s1",
    name: "test-skill",
    triggerConditions: ["trigger me"],
    executionOrder: [],
    modes: [],
    extensionSkills: [],
  };

  it("requires skill name", () => {
    const errors = validateSkill({ ...validSkill, name: "" });
    expect(errors.name).toBeDefined();
  });

  it("requires at least one trigger", () => {
    const errors = validateSkill({ ...validSkill, triggerConditions: [] });
    expect(errors.triggers).toBeDefined();
  });

  it("passes for valid skill", () => {
    const errors = validateSkill(validSkill);
    expect(Object.keys(errors)).toHaveLength(0);
  });
});

describe("validateExtensionSkills", () => {
  const agents = [
    makeAgent({ id: "a1", name: "writer" }),
    makeAgent({ id: "a2", name: "reviewer" }),
  ];

  function makeExt(overrides: Partial<ExtensionSkill> = {}): ExtensionSkill {
    return {
      name: "hook-writing",
      path: "hook-writing/skill.md",
      targetAgent: "a1",
      description: "Writes hooks",
      ...overrides,
    };
  }

  it("returns no errors for empty array", () => {
    const errors = validateExtensionSkills([], agents, "main-skill");
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it("returns no errors for valid extension skills", () => {
    const exts = [makeExt(), makeExt({ name: "thumbnail-psychology", targetAgent: "a2" })];
    const errors = validateExtensionSkills(exts, agents, "main-skill");
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it("requires extension skill name", () => {
    const errors = validateExtensionSkills([makeExt({ name: "" })], agents, "main-skill");
    expect(errors["0_name"]).toBe("builder.validation.extNameRequired");
  });

  it("requires kebab-case name", () => {
    const errors = validateExtensionSkills([makeExt({ name: "BadName" })], agents, "main-skill");
    expect(errors["0_name"]).toBe("builder.validation.extNameFormat");
  });

  it("detects collision with main skill name", () => {
    const errors = validateExtensionSkills([makeExt({ name: "main-skill" })], agents, "main-skill");
    expect(errors["0_name"]).toBe("builder.validation.extNameCollision");
  });

  it("detects duplicate names", () => {
    const exts = [makeExt(), makeExt()];
    const errors = validateExtensionSkills(exts, agents, "main-skill");
    expect(errors["1_name"]).toBe("builder.validation.extNameDuplicate");
  });

  it("requires target agent", () => {
    const errors = validateExtensionSkills([makeExt({ targetAgent: "" })], agents, "main-skill");
    expect(errors["0_target"]).toBe("builder.validation.extTargetRequired");
  });

  it("validates target agent exists (by id)", () => {
    const errors = validateExtensionSkills([makeExt({ targetAgent: "nonexistent" })], agents, "main-skill");
    expect(errors["0_target"]).toBe("builder.validation.extTargetInvalid");
  });

  it("accepts target agent by name", () => {
    const errors = validateExtensionSkills([makeExt({ targetAgent: "writer" })], agents, "main-skill");
    expect(errors["0_target"]).toBeUndefined();
  });

  it("rejects target agent referencing disabled agent", () => {
    const disabledAgents = [makeAgent({ id: "a1", name: "writer", enabled: false })];
    const errors = validateExtensionSkills([makeExt({ targetAgent: "a1" })], disabledAgents, "main-skill");
    expect(errors["0_target"]).toBe("builder.validation.extTargetInvalid");
  });
});

describe("validateAll / hasErrors", () => {
  it("aggregates all errors", () => {
    const errors = validateAll(
      { name: "", description: "", category: "",  },
      [],
      { id: "", name: "", triggerConditions: [], executionOrder: [], modes: [], extensionSkills: [] },
    );
    expect(hasErrors(errors)).toBe(true);
    expect(Object.keys(errors.meta).length).toBeGreaterThan(0);
    expect(Object.keys(errors.agents).length).toBeGreaterThan(0);
    expect(Object.keys(errors.skill).length).toBeGreaterThan(0);
  });

  it("returns no errors when all valid", () => {
    const errors = validateAll(
      { name: "My Harness", description: "A valid description here", category: "development",  },
      [makeAgent()],
      { id: "s1", name: "test", triggerConditions: ["go"], executionOrder: [], modes: [], extensionSkills: [] },
    );
    expect(hasErrors(errors)).toBe(false);
  });
});
