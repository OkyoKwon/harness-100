"use client";

import { useState, useCallback, useMemo } from "react";
import type { Agent, Modification } from "@/lib/types";

export function useModifications(agents: ReadonlyArray<Agent>) {
  const [modifications, setModifications] = useState<ReadonlyArray<Modification>>([]);

  const updateAgent = useCallback(
    (agentId: string, field: Modification["field"], value: string | boolean) => {
      setModifications((prev) => {
        const filtered = prev.filter(
          (m) => !(m.agentId === agentId && m.field === field),
        );
        return [...filtered, { agentId, field, value }];
      });
    },
    [],
  );

  const toggleAgent = useCallback((agentId: string) => {
    setModifications((prev) => {
      const existing = prev.find(
        (m) => m.agentId === agentId && m.field === "enabled",
      );
      const filtered = prev.filter(
        (m) => !(m.agentId === agentId && m.field === "enabled"),
      );
      const currentlyEnabled = existing ? existing.value !== false : true;
      return [...filtered, { agentId, field: "enabled" as const, value: !currentlyEnabled }];
    });
  }, []);

  const isAgentEnabled = useCallback(
    (agentId: string): boolean => {
      const mod = modifications.find(
        (m) => m.agentId === agentId && m.field === "enabled",
      );
      return mod ? mod.value !== false : true;
    },
    [modifications],
  );

  const getModifiedValue = useCallback(
    (agentId: string, field: Modification["field"]): string | boolean => {
      const mod = modifications.find(
        (m) => m.agentId === agentId && m.field === field,
      );
      if (mod) return mod.value;
      if (field === "enabled") return true;
      const agent = agents.find((a) => a.id === agentId);
      if (!agent) return "";
      return agent[field as keyof Agent] as string;
    },
    [modifications, agents],
  );

  const reset = useCallback(() => {
    setModifications([]);
  }, []);

  const hasChanges = useMemo(() => modifications.length > 0, [modifications]);

  return {
    modifications,
    updateAgent,
    toggleAgent,
    isAgentEnabled,
    getModifiedValue,
    reset,
    hasChanges,
  } as const;
}
