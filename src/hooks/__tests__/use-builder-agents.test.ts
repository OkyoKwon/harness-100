import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBuilderAgents } from "../use-builder-agents";

describe("useBuilderAgents", () => {
  it("starts with empty agents", () => {
    const { result } = renderHook(() => useBuilderAgents());
    expect(result.current.agents).toEqual([]);
    expect(result.current.selectedAgentId).toBeNull();
  });

  it("adds a blank agent", () => {
    const { result } = renderHook(() => useBuilderAgents());

    act(() => {
      result.current.addAgent();
    });

    expect(result.current.agents).toHaveLength(1);
    expect(result.current.agents[0].enabled).toBe(true);
    expect(result.current.selectedAgentId).toBe(result.current.agents[0].id);
  });

  it("adds agent from template", () => {
    const { result } = renderHook(() => useBuilderAgents());

    act(() => {
      result.current.addAgent({
        name: "tpl-agent",
        role: "tpl role",
        description: "tpl desc",
        tools: ["Read"],
        outputTemplate: "",
      });
    });

    expect(result.current.agents[0].name).toBe("tpl-agent");
    expect(result.current.agents[0].role).toBe("tpl role");
  });

  it("updates agent field", () => {
    const { result } = renderHook(() => useBuilderAgents());

    act(() => result.current.addAgent());
    const id = result.current.agents[0].id;

    act(() => result.current.updateAgent(id, "name", "updated-name"));

    expect(result.current.agents[0].name).toBe("updated-name");
  });

  it("removes agent and cleans up dependencies", () => {
    const { result } = renderHook(() => useBuilderAgents());

    act(() => {
      result.current.addAgent();
      result.current.addAgent();
    });

    const id1 = result.current.agents[0].id;
    const id2 = result.current.agents[1].id;

    // Add dependency
    act(() => result.current.updateAgent(id2, "dependencies", [id1]));
    expect(result.current.agents[1].dependencies).toContain(id1);

    // Remove agent 1 - should clean up dependency
    act(() => result.current.removeAgent(id1));
    expect(result.current.agents).toHaveLength(1);
    expect(result.current.agents[0].dependencies).toEqual([]);
  });

  it("toggles agent enabled state", () => {
    const { result } = renderHook(() => useBuilderAgents());

    act(() => result.current.addAgent());
    const id = result.current.agents[0].id;
    expect(result.current.agents[0].enabled).toBe(true);

    act(() => result.current.toggleAgent(id));
    expect(result.current.agents[0].enabled).toBe(false);

    act(() => result.current.toggleAgent(id));
    expect(result.current.agents[0].enabled).toBe(true);
  });

  it("reorders agents", () => {
    const { result } = renderHook(() => useBuilderAgents());

    act(() => {
      result.current.addAgent({ name: "first", role: "r", description: "d", tools: [], outputTemplate: "" });
      result.current.addAgent({ name: "second", role: "r", description: "d", tools: [], outputTemplate: "" });
    });

    expect(result.current.agents[0].name).toBe("first");
    expect(result.current.agents[1].name).toBe("second");

    act(() => result.current.reorderAgent(0, 1));

    expect(result.current.agents[0].name).toBe("second");
    expect(result.current.agents[1].name).toBe("first");
  });

  it("validates: returns error when no agents", () => {
    const { result } = renderHook(() => useBuilderAgents());
    expect(result.current.isValid).toBe(false);
    expect(result.current.errors._global).toBeDefined();
  });

  it("validates: returns no errors for valid agent", () => {
    const { result } = renderHook(() => useBuilderAgents());

    act(() => {
      result.current.addAgent();
    });

    const id = result.current.agents[0].id;

    act(() => {
      result.current.updateAgent(id, "name", "valid-agent");
      result.current.updateAgent(id, "role", "valid role");
    });

    expect(result.current.isValid).toBe(true);
  });

  it("resets to initial state", () => {
    const { result } = renderHook(() => useBuilderAgents());

    act(() => {
      result.current.addAgent();
      result.current.addAgent();
    });
    expect(result.current.agents).toHaveLength(2);

    act(() => result.current.reset());
    expect(result.current.agents).toEqual([]);
    expect(result.current.selectedAgentId).toBeNull();
  });
});
