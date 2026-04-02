import { describe, it, expect, beforeEach } from "vitest";
import { mergeHarnesses } from "../merge-harnesses";
import {
  createHarness,
  createAgent,
  resetFixtureCounter,
} from "@/test/mocks/harness-fixtures";

describe("mergeHarnesses", () => {
  beforeEach(() => {
    resetFixtureCounter();
  });

  it("throws when given an empty array", () => {
    expect(() => mergeHarnesses([])).toThrow(
      "At least one harness is required for merging",
    );
  });

  it("returns the same harness when given a single harness", () => {
    const harness = createHarness({ id: 1, name: "Solo" });
    const result = mergeHarnesses([harness]);
    expect(result).toBe(harness);
  });

  it("merges agents from two harnesses with prefixed IDs", () => {
    const h1 = createHarness({
      id: 1,
      name: "H1",
      agents: [createAgent({ id: "alpha" })],
    });
    const h2 = createHarness({
      id: 2,
      name: "H2",
      agents: [createAgent({ id: "beta" })],
    });

    const result = mergeHarnesses([h1, h2]);
    const agentIds = result.agents.map((a) => a.id);

    expect(agentIds).toContain("h0_alpha");
    expect(agentIds).toContain("h1_beta");
  });

  it("remaps agent dependencies with correct prefix", () => {
    const agent = createAgent({ id: "worker", dependencies: ["manager"] });
    const h1 = createHarness({
      id: 1,
      name: "H1",
      agents: [createAgent({ id: "manager" }), agent],
    });
    const h2 = createHarness({
      id: 2,
      name: "H2",
      agents: [createAgent({ id: "solo" })],
    });

    const result = mergeHarnesses([h1, h2]);
    const worker = result.agents.find((a) => a.id === "h0_worker");

    expect(worker?.dependencies).toEqual(["h0_manager"]);
  });

  it("remaps execution steps with prefixed agentId and dependsOn", () => {
    const h1 = createHarness({
      id: 1,
      name: "H1",
      agents: [createAgent({ id: "a1" })],
    });
    const h2 = createHarness({
      id: 2,
      name: "H2",
      agents: [createAgent({ id: "b1" })],
    });

    const result = mergeHarnesses([h1, h2]);
    const stepAgentIds = result.skill.executionOrder.map((s) => s.agentId);

    expect(stepAgentIds).toContain("h0_a1");
    expect(stepAgentIds).toContain("h1_b1");
  });

  it("deduplicates frameworks", () => {
    const h1 = createHarness({
      id: 1,
      name: "H1",
      frameworks: ["vitest", "react"],
      agents: [createAgent({ id: "a" })],
    });
    const h2 = createHarness({
      id: 2,
      name: "H2",
      frameworks: ["vitest", "next"],
      agents: [createAgent({ id: "b" })],
    });

    const result = mergeHarnesses([h1, h2]);

    expect(result.frameworks).toEqual(["vitest", "react", "next"]);
  });

  it("prefixes mode names with harness name", () => {
    const h1 = createHarness({
      id: 1,
      name: "Alpha",
      agents: [createAgent({ id: "a" })],
    });
    const h2 = createHarness({
      id: 2,
      name: "Beta",
      agents: [createAgent({ id: "b" })],
    });

    const result = mergeHarnesses([h1, h2]);
    const modeNames = result.skill.modes.map((m) => m.name);

    // First mode is the "full pipeline" mode
    expect(modeNames[0]).toBe("풀 파이프라인");
    // Subsequent modes are prefixed with harness names
    expect(modeNames).toContain("[Alpha] Full");
    expect(modeNames).toContain("[Beta] Full");
  });

  it("creates a full pipeline mode containing all agent IDs", () => {
    const h1 = createHarness({
      id: 1,
      name: "H1",
      agents: [createAgent({ id: "a1" })],
    });
    const h2 = createHarness({
      id: 2,
      name: "H2",
      agents: [createAgent({ id: "b1" })],
    });

    const result = mergeHarnesses([h1, h2]);
    const fullPipeline = result.skill.modes[0];

    expect(fullPipeline.agents).toContain("h0_a1");
    expect(fullPipeline.agents).toContain("h1_b1");
  });

  it("merges three harnesses with h0_, h1_, h2_ prefixes", () => {
    const h1 = createHarness({
      id: 1,
      name: "H1",
      agents: [createAgent({ id: "x" })],
    });
    const h2 = createHarness({
      id: 2,
      name: "H2",
      agents: [createAgent({ id: "y" })],
    });
    const h3 = createHarness({
      id: 3,
      name: "H3",
      agents: [createAgent({ id: "z" })],
    });

    const result = mergeHarnesses([h1, h2, h3]);
    const agentIds = result.agents.map((a) => a.id);

    expect(agentIds).toEqual(["h0_x", "h1_y", "h2_z"]);
  });

  it("sets correct metadata on merged result", () => {
    const h1 = createHarness({
      id: 1,
      name: "Alpha",
      category: "development",
      agents: [createAgent({ id: "a" })],
    });
    const h2 = createHarness({
      id: 2,
      name: "Beta",
      agents: [createAgent({ id: "b" })],
    });

    const result = mergeHarnesses([h1, h2]);

    expect(result.id).toBe(0);
    expect(result.slug).toBe("merged-harness");
    expect(result.name).toBe("2개 하네스 조합");
    expect(result.description).toBe("Alpha, Beta");
    expect(result.category).toBe("development");
    expect(result.agentCount).toBe(2);
    expect(result.popularityRank).toBe(0);
  });

  it("does not mutate the original harnesses", () => {
    const agent1 = createAgent({ id: "a1", dependencies: ["dep1"] });
    const h1 = createHarness({
      id: 1,
      name: "H1",
      agents: [agent1],
    });
    const h2 = createHarness({
      id: 2,
      name: "H2",
      agents: [createAgent({ id: "b1" })],
    });

    const originalAgentId = h1.agents[0].id;
    const originalDeps = [...h1.agents[0].dependencies];

    mergeHarnesses([h1, h2]);

    expect(h1.agents[0].id).toBe(originalAgentId);
    expect([...h1.agents[0].dependencies]).toEqual(originalDeps);
  });
});
