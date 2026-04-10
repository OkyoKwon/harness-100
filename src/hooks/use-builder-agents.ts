"use client";

import { useState, useCallback, useMemo } from "react";
import type { Agent } from "@/lib/types";
import type { AgentSourceRef, CustomAgent, AgentTemplate } from "@/lib/custom-harness-types";
import { createBlankAgent, createAgentFromTemplate, createAgentFromReuse } from "@/lib/custom-harness-converter";
import { validateAgents } from "@/lib/builder-validation";

export function useBuilderAgents(initial?: ReadonlyArray<CustomAgent>) {
  const [agents, setAgents] = useState<ReadonlyArray<CustomAgent>>(initial ?? []);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const addAgent = useCallback((template?: AgentTemplate) => {
    const agent = template ? createAgentFromTemplate(template) : createBlankAgent();
    setAgents((prev) => [...prev, agent]);
    setSelectedAgentId(agent.id);
  }, []);

  const addReusedAgent = useCallback((source: Agent, sourceRef: AgentSourceRef) => {
    const agent = createAgentFromReuse(source, sourceRef);
    setAgents((prev) => [...prev, agent]);
    setSelectedAgentId(agent.id);
  }, []);

  const updateAgent = useCallback(
    (id: string, field: keyof CustomAgent, value: string | boolean | ReadonlyArray<string>) => {
      setAgents((prev) =>
        prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)),
      );
    },
    [],
  );

  const removeAgent = useCallback((id: string) => {
    setAgents((prev) => {
      const next = prev
        .filter((a) => a.id !== id)
        // Also remove from dependencies
        .map((a) => ({
          ...a,
          dependencies: a.dependencies.filter((d) => d !== id),
        }));
      return next;
    });
    setSelectedAgentId((prev) => (prev === id ? null : prev));
  }, []);

  const toggleAgent = useCallback((id: string) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
    );
  }, []);

  const reorderAgent = useCallback((fromIndex: number, toIndex: number) => {
    setAgents((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return arr;
    });
  }, []);

  const selectAgent = useCallback((id: string | null) => {
    setSelectedAgentId(id);
  }, []);

  const selectedAgent = useMemo(
    () => agents.find((a) => a.id === selectedAgentId) ?? null,
    [agents, selectedAgentId],
  );

  const errors = useMemo(() => validateAgents(agents), [agents]);

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const reset = useCallback((initial?: ReadonlyArray<CustomAgent>) => {
    setAgents(initial ?? []);
    setSelectedAgentId(null);
  }, []);

  return {
    agents,
    selectedAgentId,
    selectedAgent,
    errors,
    isValid,
    addAgent,
    addReusedAgent,
    updateAgent,
    removeAgent,
    toggleAgent,
    reorderAgent,
    selectAgent,
    reset,
  } as const;
}
