import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useModifications } from "../use-modifications";
import type { Agent } from "@/lib/types";
import { createAgent, resetFixtureCounter } from "@/test/mocks/harness-fixtures";

beforeEach(() => {
  resetFixtureCounter();
});

function makeAgents(): ReadonlyArray<Agent> {
  return [
    createAgent({ id: "a1", name: "Alpha", role: "writer" }),
    createAgent({ id: "a2", name: "Beta", role: "reviewer" }),
  ];
}

describe("useModifications", () => {
  // ── Initial state ──
  it("starts with empty modifications and hasChanges false", () => {
    const { result } = renderHook(() => useModifications(makeAgents()));
    expect(result.current.modifications).toEqual([]);
    expect(result.current.hasChanges).toBe(false);
  });

  // ── updateAgent ──
  it("adds a modification via updateAgent", () => {
    const { result } = renderHook(() => useModifications(makeAgents()));
    act(() => {
      result.current.updateAgent("a1", "name", "Alpha v2");
    });
    expect(result.current.modifications).toHaveLength(1);
    expect(result.current.modifications[0]).toEqual({
      agentId: "a1",
      field: "name",
      value: "Alpha v2",
    });
    expect(result.current.hasChanges).toBe(true);
  });

  it("replaces existing modification for same agentId and field", () => {
    const { result } = renderHook(() => useModifications(makeAgents()));
    act(() => {
      result.current.updateAgent("a1", "name", "First");
    });
    act(() => {
      result.current.updateAgent("a1", "name", "Second");
    });
    expect(result.current.modifications).toHaveLength(1);
    expect(result.current.modifications[0].value).toBe("Second");
  });

  it("keeps modifications for different fields separate", () => {
    const { result } = renderHook(() => useModifications(makeAgents()));
    act(() => {
      result.current.updateAgent("a1", "name", "New Name");
      result.current.updateAgent("a1", "role", "New Role");
    });
    expect(result.current.modifications).toHaveLength(2);
  });

  // ── toggleAgent ──
  it("toggleAgent disables an agent on first call", () => {
    const { result } = renderHook(() => useModifications(makeAgents()));
    act(() => {
      result.current.toggleAgent("a1");
    });
    expect(result.current.isAgentEnabled("a1")).toBe(false);
  });

  it("toggleAgent re-enables agent on second call", () => {
    const { result } = renderHook(() => useModifications(makeAgents()));
    act(() => {
      result.current.toggleAgent("a1");
    });
    act(() => {
      result.current.toggleAgent("a1");
    });
    expect(result.current.isAgentEnabled("a1")).toBe(true);
  });

  // ── isAgentEnabled ──
  it("reports all agents enabled by default", () => {
    const { result } = renderHook(() => useModifications(makeAgents()));
    expect(result.current.isAgentEnabled("a1")).toBe(true);
    expect(result.current.isAgentEnabled("a2")).toBe(true);
  });

  // ── getModifiedValue ──
  it("returns original agent field when no modification", () => {
    const agents = makeAgents();
    const { result } = renderHook(() => useModifications(agents));
    expect(result.current.getModifiedValue("a1", "name")).toBe("Alpha");
    expect(result.current.getModifiedValue("a2", "role")).toBe("reviewer");
  });

  it("returns modified value after updateAgent", () => {
    const { result } = renderHook(() => useModifications(makeAgents()));
    act(() => {
      result.current.updateAgent("a1", "name", "Changed");
    });
    expect(result.current.getModifiedValue("a1", "name")).toBe("Changed");
  });

  it("returns true for enabled field when no modification", () => {
    const { result } = renderHook(() => useModifications(makeAgents()));
    expect(result.current.getModifiedValue("a1", "enabled")).toBe(true);
  });

  it("returns empty string for unknown agent", () => {
    const { result } = renderHook(() => useModifications(makeAgents()));
    expect(result.current.getModifiedValue("unknown", "name")).toBe("");
  });

  // ── reset ──
  it("clears all modifications on reset", () => {
    const { result } = renderHook(() => useModifications(makeAgents()));
    act(() => {
      result.current.updateAgent("a1", "name", "Changed");
      result.current.toggleAgent("a2");
    });
    expect(result.current.hasChanges).toBe(true);
    act(() => {
      result.current.reset();
    });
    expect(result.current.modifications).toEqual([]);
    expect(result.current.hasChanges).toBe(false);
  });
});
