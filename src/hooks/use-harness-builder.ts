"use client";

import { useMemo, useCallback, useEffect, useRef } from "react";
import { nanoid } from "nanoid";
import type { Harness } from "@/lib/types";
import type { CustomHarness } from "@/lib/custom-harness-types";
import { toSlug } from "@/lib/custom-harness-converter";
import { hasErrors, validateAll } from "@/lib/builder-validation";
import { STORAGE_KEYS } from "@/lib/constants";
import { useBuilderNavigation } from "./use-builder-navigation";
import { useBuilderMeta } from "./use-builder-meta";
import { useBuilderAgents } from "./use-builder-agents";
import { useBuilderSkill } from "./use-builder-skill";

export function useHarnessBuilder(editingHarness?: CustomHarness) {
  const navigation = useBuilderNavigation();
  const metaHook = useBuilderMeta(
    editingHarness
      ? {
          name: editingHarness.name,
          description: editingHarness.description,
          category: editingHarness.category,
          frameworks: editingHarness.frameworks,
        }
      : undefined,
  );
  const agentsHook = useBuilderAgents(editingHarness?.agents);
  const skillHook = useBuilderSkill(editingHarness?.skill);

  const editingId = useRef(editingHarness?.id ?? null);

  // Auto-sync execution order when agents change
  useEffect(() => {
    skillHook.syncExecutionOrder(agentsHook.agents);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentsHook.agents]);

  // Auto-save draft to sessionStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const draft = {
          meta: metaHook.meta,
          agents: agentsHook.agents,
          skill: skillHook.skill,
          step: navigation.currentStep,
          editingId: editingId.current,
        };
        sessionStorage.setItem(STORAGE_KEYS.builderDraft, JSON.stringify(draft));
      } catch {
        // sessionStorage unavailable
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [metaHook.meta, agentsHook.agents, skillHook.skill, navigation.currentStep]);

  const isDirty = useMemo(() => {
    return (
      metaHook.meta.name !== "" ||
      agentsHook.agents.length > 0
    );
  }, [metaHook.meta.name, agentsHook.agents.length]);

  const validationErrors = useMemo(
    () => validateAll(metaHook.meta, agentsHook.agents, skillHook.skill),
    [metaHook.meta, agentsHook.agents, skillHook.skill],
  );

  const isAllValid = useMemo(() => !hasErrors(validationErrors), [validationErrors]);

  const build = useCallback((): CustomHarness => {
    const now = new Date().toISOString();
    const category = metaHook.meta.category || "development";

    return {
      id: editingId.current ?? nanoid(),
      slug: toSlug(metaHook.meta.name),
      name: metaHook.meta.name.trim(),
      description: metaHook.meta.description.trim(),
      category,
      agents: agentsHook.agents,
      skill: {
        ...skillHook.skill,
        id: skillHook.skill.id || "main-skill",
        name: skillHook.skill.name || metaHook.meta.name,
      },
      frameworks: metaHook.meta.frameworks,
      createdAt: editingHarness?.createdAt ?? now,
      updatedAt: now,
      version: 1,
      baseHarnessId: editingHarness?.baseHarnessId,
    };
  }, [metaHook.meta, agentsHook.agents, skillHook.skill, editingHarness]);

  const loadFromExisting = useCallback(
    (harness: Harness | CustomHarness) => {
      const isCustom = typeof harness.id === "string";

      metaHook.reset({
        name: harness.name,
        description: harness.description,
        category: harness.category,
        frameworks: [...harness.frameworks],
      });

      if (isCustom) {
        const custom = harness as CustomHarness;
        agentsHook.reset(custom.agents);
        skillHook.reset(custom.skill);
        editingId.current = custom.id;
      } else {
        const catalog = harness as Harness;
        agentsHook.reset(catalog.agents.map((a) => ({ ...a, enabled: true })));
        skillHook.reset(catalog.skill);
        editingId.current = null;
      }

      navigation.goTo(1);
    },
    [metaHook, agentsHook, skillHook, navigation],
  );

  const resetAll = useCallback(() => {
    metaHook.reset();
    agentsHook.reset();
    skillHook.reset();
    editingId.current = null;
    navigation.goTo(1);
    try {
      sessionStorage.removeItem(STORAGE_KEYS.builderDraft);
    } catch {
      // ignore
    }
  }, [metaHook, agentsHook, skillHook, navigation]);

  const clearDraft = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.builderDraft);
    } catch {
      // ignore
    }
  }, []);

  return {
    navigation,
    meta: metaHook,
    agents: agentsHook,
    skill: skillHook,
    isDirty,
    validationErrors,
    isAllValid,
    build,
    loadFromExisting,
    resetAll,
    clearDraft,
  } as const;
}
