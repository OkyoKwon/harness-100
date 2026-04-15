import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBuilderSkill } from "../use-builder-skill";
import type { ExtensionSkill } from "@/lib/types";

function makeExt(overrides: Partial<ExtensionSkill> = {}): ExtensionSkill {
  return {
    name: "hook-writing",
    path: "hook-writing/skill.md",
    targetAgent: "a1",
    description: "Writes hooks",
    ...overrides,
  };
}

describe("useBuilderSkill — extension skills", () => {
  it("starts with empty extension skills", () => {
    const { result } = renderHook(() => useBuilderSkill());
    expect(result.current.skill.extensionSkills).toEqual([]);
    expect(result.current.extensionSkillMarkdowns).toEqual({});
  });

  it("adds an extension skill", () => {
    const { result } = renderHook(() => useBuilderSkill());

    act(() => {
      result.current.addExtensionSkill(makeExt());
    });

    expect(result.current.skill.extensionSkills).toHaveLength(1);
    expect(result.current.skill.extensionSkills[0].name).toBe("hook-writing");
  });

  it("removes an extension skill and cleans up markdown", () => {
    const { result } = renderHook(() => useBuilderSkill());

    act(() => {
      result.current.addExtensionSkill(makeExt());
      result.current.updateExtensionSkillMarkdown("hook-writing", "# Custom MD");
    });

    expect(result.current.extensionSkillMarkdowns["hook-writing"]).toBe("# Custom MD");

    act(() => {
      result.current.removeExtensionSkill(0);
    });

    expect(result.current.skill.extensionSkills).toHaveLength(0);
    expect(result.current.extensionSkillMarkdowns["hook-writing"]).toBeUndefined();
  });

  it("updates an extension skill", () => {
    const { result } = renderHook(() => useBuilderSkill());

    act(() => {
      result.current.addExtensionSkill(makeExt());
    });

    act(() => {
      result.current.updateExtensionSkill(0, makeExt({ description: "Updated desc" }));
    });

    expect(result.current.skill.extensionSkills[0].description).toBe("Updated desc");
  });

  it("syncs markdown key when extension skill name changes", () => {
    const { result } = renderHook(() => useBuilderSkill());

    act(() => {
      result.current.addExtensionSkill(makeExt());
      result.current.updateExtensionSkillMarkdown("hook-writing", "# Content");
    });

    act(() => {
      result.current.updateExtensionSkill(0, makeExt({ name: "new-name" }));
    });

    expect(result.current.extensionSkillMarkdowns["hook-writing"]).toBeUndefined();
    expect(result.current.extensionSkillMarkdowns["new-name"]).toBe("# Content");
  });

  it("clears extension skill markdown", () => {
    const { result } = renderHook(() => useBuilderSkill());

    act(() => {
      result.current.addExtensionSkill(makeExt());
      result.current.updateExtensionSkillMarkdown("hook-writing", "# Content");
    });

    act(() => {
      result.current.clearExtensionSkillMarkdown("hook-writing");
    });

    expect(result.current.extensionSkillMarkdowns["hook-writing"]).toBeUndefined();
  });

  it("reset clears extension skills and markdowns", () => {
    const { result } = renderHook(() => useBuilderSkill());

    act(() => {
      result.current.addExtensionSkill(makeExt());
      result.current.updateExtensionSkillMarkdown("hook-writing", "# Content");
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.skill.extensionSkills).toEqual([]);
    expect(result.current.extensionSkillMarkdowns).toEqual({});
  });

  it("initializes with provided extension skill markdowns", () => {
    const initialSkill = {
      id: "sk",
      name: "test",
      triggerConditions: ["go"],
      executionOrder: [],
      modes: [],
      extensionSkills: [makeExt()],
    };
    const initialMds = { "hook-writing": "# Initial" };

    const { result } = renderHook(() => useBuilderSkill(initialSkill, "", initialMds));

    expect(result.current.skill.extensionSkills).toHaveLength(1);
    expect(result.current.extensionSkillMarkdowns["hook-writing"]).toBe("# Initial");
  });
});
