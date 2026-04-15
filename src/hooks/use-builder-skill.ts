"use client";

import { useState, useCallback, useMemo } from "react";
import type { ExtensionSkill, Skill, ExecutionStep, SkillMode } from "@/lib/types";
import type { CustomAgent } from "@/lib/custom-harness-types";
import { validateSkill } from "@/lib/builder-validation";

const INITIAL_SKILL: Skill = {
  id: "main-skill",
  name: "",
  triggerConditions: [],
  executionOrder: [],
  modes: [],
  extensionSkills: [],
};

export function useBuilderSkill(
  initial?: Skill,
  initialMarkdown?: string,
  initialExtMarkdowns?: Readonly<Record<string, string>>,
) {
  const [skill, setSkill] = useState<Skill>(initial ?? INITIAL_SKILL);
  const [skillMarkdown, setSkillMarkdown] = useState(initialMarkdown ?? "");
  const [extensionSkillMarkdowns, setExtensionSkillMarkdowns] = useState<Readonly<Record<string, string>>>(
    initialExtMarkdowns ?? {},
  );

  const updateName = useCallback((name: string) => {
    setSkill((prev) => ({ ...prev, name }));
  }, []);

  const addTrigger = useCallback((condition: string) => {
    if (!condition.trim()) return;
    setSkill((prev) => ({
      ...prev,
      triggerConditions: [...prev.triggerConditions, condition.trim()],
    }));
  }, []);

  const removeTrigger = useCallback((index: number) => {
    setSkill((prev) => ({
      ...prev,
      triggerConditions: prev.triggerConditions.filter((_, i) => i !== index),
    }));
  }, []);

  /** Rebuild execution order from agent list. Each agent gets a step. */
  const syncExecutionOrder = useCallback((agents: ReadonlyArray<CustomAgent>) => {
    setSkill((prev) => {
      const enabledAgents = agents.filter((a) => a.enabled);
      // Preserve existing parallel flags
      const existingMap = new Map(prev.executionOrder.map((s) => [s.agentId, s]));

      const newOrder: ExecutionStep[] = enabledAgents.map((agent) => {
        const existing = existingMap.get(agent.id);
        return {
          agentId: agent.id,
          parallel: existing?.parallel ?? false,
          dependsOn: agent.dependencies.filter((d) =>
            enabledAgents.some((a) => a.id === d),
          ),
        };
      });

      return { ...prev, executionOrder: newOrder };
    });
  }, []);

  const toggleParallel = useCallback((agentId: string) => {
    setSkill((prev) => ({
      ...prev,
      executionOrder: prev.executionOrder.map((s) =>
        s.agentId === agentId ? { ...s, parallel: !s.parallel } : s,
      ),
    }));
  }, []);

  const reorderExecution = useCallback((fromIndex: number, toIndex: number) => {
    setSkill((prev) => {
      const arr = [...prev.executionOrder];
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return { ...prev, executionOrder: arr };
    });
  }, []);

  const addMode = useCallback((mode: SkillMode) => {
    setSkill((prev) => ({
      ...prev,
      modes: [...prev.modes, mode],
    }));
  }, []);

  const removeMode = useCallback((index: number) => {
    setSkill((prev) => ({
      ...prev,
      modes: prev.modes.filter((_, i) => i !== index),
    }));
  }, []);

  // ── Extension skills ──

  const addExtensionSkill = useCallback((ext: ExtensionSkill) => {
    setSkill((prev) => ({
      ...prev,
      extensionSkills: [...prev.extensionSkills, ext],
    }));
  }, []);

  const removeExtensionSkill = useCallback((index: number) => {
    setSkill((prev) => {
      const removed = prev.extensionSkills[index];
      if (removed) {
        // Clean up markdown for the removed skill
        setExtensionSkillMarkdowns((mds) => {
          const { [removed.name]: _, ...rest } = mds as Record<string, string>;
          return rest;
        });
      }
      return {
        ...prev,
        extensionSkills: prev.extensionSkills.filter((_, i) => i !== index),
      };
    });
  }, []);

  const updateExtensionSkill = useCallback((index: number, ext: ExtensionSkill) => {
    setSkill((prev) => {
      const oldName = prev.extensionSkills[index]?.name;
      const newSkills = prev.extensionSkills.map((s, i) => (i === index ? ext : s));

      // Sync markdown key if name changed
      if (oldName && oldName !== ext.name) {
        setExtensionSkillMarkdowns((mds) => {
          const record = mds as Record<string, string>;
          if (!(oldName in record)) return mds;
          const { [oldName]: content, ...rest } = record;
          return { ...rest, [ext.name]: content };
        });
      }

      return { ...prev, extensionSkills: newSkills };
    });
  }, []);

  const updateExtensionSkillMarkdown = useCallback((name: string, md: string) => {
    setExtensionSkillMarkdowns((prev) => ({ ...prev, [name]: md }));
  }, []);

  const clearExtensionSkillMarkdown = useCallback((name: string) => {
    setExtensionSkillMarkdowns((prev) => {
      const { [name]: _, ...rest } = prev as Record<string, string>;
      return rest;
    });
  }, []);

  const errors = useMemo(() => validateSkill(skill), [skill]);
  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const updateSkillMarkdown = useCallback((md: string) => {
    setSkillMarkdown(md);
  }, []);

  const reset = useCallback((initial?: Skill) => {
    setSkill(initial ?? INITIAL_SKILL);
    setSkillMarkdown("");
    setExtensionSkillMarkdowns({});
  }, []);

  return {
    skill,
    skillMarkdown,
    extensionSkillMarkdowns,
    errors,
    isValid,
    updateName,
    addTrigger,
    removeTrigger,
    syncExecutionOrder,
    toggleParallel,
    reorderExecution,
    addMode,
    removeMode,
    addExtensionSkill,
    removeExtensionSkill,
    updateExtensionSkill,
    updateExtensionSkillMarkdown,
    clearExtensionSkillMarkdown,
    updateSkillMarkdown,
    reset,
  } as const;
}
