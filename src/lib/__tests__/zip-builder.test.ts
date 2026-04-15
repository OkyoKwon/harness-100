import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  applyModifications,
  generateAgentMd,
  generateClaudeMd,
  generateSkillMd,
  generateExtensionSkillMd,
  buildZip,
} from "../zip-builder";
import type { Agent, ExtensionSkill, Harness, Modification } from "../types";
import {
  createAgent,
  createHarness,
  resetFixtureCounter,
} from "@/test/mocks/harness-fixtures";

beforeEach(() => {
  resetFixtureCounter();
});

// ---------------------------------------------------------------------------
// applyModifications
// ---------------------------------------------------------------------------
describe("applyModifications", () => {
  const agents: ReadonlyArray<Agent> = [
    createAgent({ id: "a1", name: "Alpha", role: "writer" }),
    createAgent({ id: "a2", name: "Beta", role: "reviewer" }),
  ];

  it("returns agents unchanged when modifications is undefined", () => {
    expect(applyModifications(agents, undefined)).toBe(agents);
  });

  it("returns agents unchanged when modifications is empty", () => {
    expect(applyModifications(agents, [])).toBe(agents);
  });

  it("filters out disabled agents", () => {
    const mods: ReadonlyArray<Modification> = [
      { agentId: "a1", field: "enabled", value: false },
    ];
    const result = applyModifications(agents, mods);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("a2");
  });

  it("applies string field modifications to agents", () => {
    const mods: ReadonlyArray<Modification> = [
      { agentId: "a1", field: "name", value: "Alpha v2" },
      { agentId: "a1", field: "role", value: "editor" },
    ];
    const result = applyModifications(agents, mods);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Alpha v2");
    expect(result[0].role).toBe("editor");
    // second agent unchanged
    expect(result[1].name).toBe("Beta");
  });

  it("ignores non-allowed fields", () => {
    // "enabled" with a boolean value on a non-disabled agent has no effect on field copy
    const mods: ReadonlyArray<Modification> = [
      { agentId: "a1", field: "enabled", value: true },
    ];
    const result = applyModifications(agents, mods);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("a1");
  });

  it("does not mutate the original agents array", () => {
    const mods: ReadonlyArray<Modification> = [
      { agentId: "a1", field: "name", value: "Changed" },
    ];
    applyModifications(agents, mods);
    expect(agents[0].name).toBe("Alpha");
  });
});

// ---------------------------------------------------------------------------
// generateAgentMd
// ---------------------------------------------------------------------------
describe("generateAgentMd", () => {
  it("produces markdown with agent metadata", () => {
    const agent = createAgent({
      id: "test",
      name: "Tester",
      role: "QA",
      description: "Runs tests",
      outputTemplate: "## Results",
    });
    const md = generateAgentMd(agent);
    expect(md).toContain("name: Tester");
    expect(md).toContain('description: "Runs tests"');
    expect(md).toContain("# Tester — QA");
    expect(md).toContain("## 산출물 포맷");
    expect(md).toContain("## Results");
  });
});

// ---------------------------------------------------------------------------
// generateClaudeMd
// ---------------------------------------------------------------------------
describe("generateClaudeMd", () => {
  it("produces markdown with harness name and agents", () => {
    const harness = createHarness({
      name: "My Harness",
      description: "Does things",
    });
    const md = generateClaudeMd(harness);
    expect(md).toContain("# My Harness");
    expect(md).toContain("Does things");
    expect(md).toContain("## 에이전트 구성");
    // Each agent line
    for (const a of harness.agents) {
      expect(md).toContain(`**${a.name}**`);
    }
  });
});

// ---------------------------------------------------------------------------
// generateSkillMd
// ---------------------------------------------------------------------------
describe("generateSkillMd", () => {
  it("produces markdown with skill tables", () => {
    const harness = createHarness();
    const md = generateSkillMd(harness);
    expect(md).toContain(`name: ${harness.skill.name}`);
    expect(md).toContain("## 에이전트 구성");
    expect(md).toContain("## 워크플로우");
    expect(md).toContain("## 작업 규모별 모드");
    // agents table
    for (const a of harness.agents) {
      expect(md).toContain(a.id);
    }
  });

  it("includes extension skills section when present", () => {
    const harness = createHarness({
      skill: {
        id: "sk",
        name: "Skill",
        triggerConditions: ["trigger"],
        executionOrder: [],
        modes: [],
        extensionSkills: [
          {
            name: "ext1",
            path: "path/ext1.md",
            targetAgent: "a1",
            description: "ext desc",
          },
        ],
      },
    });
    const md = generateSkillMd(harness);
    expect(md).toContain("## 에이전트별 확장 스킬");
    expect(md).toContain("ext1");
    expect(md).toContain("path/ext1.md");
  });

  it("omits extension skills section when empty", () => {
    const harness = createHarness();
    const md = generateSkillMd(harness);
    expect(md).not.toContain("## 에이전트별 확장 스킬");
  });
});

// ---------------------------------------------------------------------------
// buildZip
// ---------------------------------------------------------------------------
describe("buildZip", () => {
  it("produces a Blob from a harness", async () => {
    const harness = createHarness();
    const blob = await buildZip(harness);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });

  it("uses rawFiles when available and no modifications", async () => {
    const harness = createHarness({
      rawFiles: {
        claudeMd: "# Raw CLAUDE",
        agents: { "agent-1": "# Raw Agent 1" },
        skills: { "test-harness/skill.md": "# Raw Skill" },
      },
    });
    const blob = await buildZip(harness);
    expect(blob).toBeInstanceOf(Blob);
  });

  it("generates agent markdown when modifications exist", async () => {
    const agent = createAgent({ id: "a1" });
    const harness = createHarness({
      agents: [agent],
      rawFiles: {
        claudeMd: "# Raw",
        agents: { a1: "# Raw Agent" },
        skills: {},
      },
    });
    const mods: ReadonlyArray<Modification> = [
      { agentId: "a1", field: "name", value: "Modified Agent" },
    ];
    const blob = await buildZip(harness, mods);
    expect(blob).toBeInstanceOf(Blob);
  });

  it("filters disabled agents from ZIP", async () => {
    const a1 = createAgent({ id: "a1" });
    const a2 = createAgent({ id: "a2" });
    const harness = createHarness({ agents: [a1, a2] });
    const mods: ReadonlyArray<Modification> = [
      { agentId: "a1", field: "enabled", value: false },
    ];
    const blob = await buildZip(harness, mods);
    expect(blob).toBeInstanceOf(Blob);
  });

  it("falls back to generated skill when rawFiles.skills is empty", async () => {
    const harness = createHarness({
      rawFiles: {
        claudeMd: "# CLAUDE",
        agents: {},
        skills: {},
      },
    });
    const blob = await buildZip(harness);
    expect(blob).toBeInstanceOf(Blob);
  });

  it("skips invalid paths in rawFiles.skills", async () => {
    const harness = createHarness({
      rawFiles: {
        claudeMd: "# CLAUDE",
        agents: {},
        skills: {
          "../evil/path.md": "bad content",
          "valid-dir/file.md": "good content",
        },
      },
    });
    const blob = await buildZip(harness);
    expect(blob).toBeInstanceOf(Blob);
  });

  it("writes extension skill files when no rawFiles", async () => {
    const harness = createHarness({
      rawFiles: {
        claudeMd: "# CLAUDE",
        agents: {},
        skills: {},
      },
      skill: {
        id: "sk",
        name: "main-skill",
        triggerConditions: ["trigger"],
        executionOrder: [],
        modes: [],
        extensionSkills: [
          { name: "hook-writing", path: "hook-writing/skill.md", targetAgent: "agent-1", description: "Writes hooks" },
        ],
      },
    });
    const blob = await buildZip(harness, undefined, "ko", undefined, undefined);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });

  it("uses custom extension skill markdown when provided", async () => {
    const harness = createHarness({
      rawFiles: {
        claudeMd: "# CLAUDE",
        agents: {},
        skills: {},
      },
      skill: {
        id: "sk",
        name: "main-skill",
        triggerConditions: ["trigger"],
        executionOrder: [],
        modes: [],
        extensionSkills: [
          { name: "hook-writing", path: "hook-writing/skill.md", targetAgent: "agent-1", description: "Writes hooks" },
        ],
      },
    });
    const extMarkdowns = { "hook-writing": "# Custom Extension Skill Content" };
    const blob = await buildZip(harness, undefined, "ko", undefined, extMarkdowns);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// generateExtensionSkillMd
// ---------------------------------------------------------------------------
describe("generateExtensionSkillMd", () => {
  it("produces markdown with extension skill metadata", () => {
    const ext: ExtensionSkill = {
      name: "hook-writing",
      path: "hook-writing/skill.md",
      targetAgent: "agent-1",
      description: "Writes hooks",
    };
    const harness = createHarness();
    const md = generateExtensionSkillMd(ext, harness);
    expect(md).toContain("name: hook-writing");
    expect(md).toContain("# hook-writing");
    expect(md).toContain("Writes hooks");
  });

  it("includes target agent role when agent is found", () => {
    const ext: ExtensionSkill = {
      name: "hook-writing",
      path: "hook-writing/skill.md",
      targetAgent: "agent-1",
      description: "Writes hooks",
    };
    const agent = createAgent({ id: "agent-1", name: "Writer", role: "Content writer" });
    const harness = createHarness({ agents: [agent] });
    const md = generateExtensionSkillMd(ext, harness);
    expect(md).toContain("Writer");
    expect(md).toContain("Content writer");
  });

  it("generates English version", () => {
    const ext: ExtensionSkill = {
      name: "hook-writing",
      path: "hook-writing/skill.md",
      targetAgent: "agent-1",
      description: "Writes hooks",
    };
    const harness = createHarness();
    const md = generateExtensionSkillMd(ext, harness, "en");
    expect(md).toContain("Target Agent");
    expect(md).toContain("How It Works");
  });
});
