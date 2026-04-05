"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Agent } from "@/lib/types";
import { useLocale } from "@/hooks/use-locale";

interface WorkflowDiagramProps {
  readonly agents: ReadonlyArray<Agent>;
  readonly activeAgentId?: string | null;
}

const NODE_W = 160;
const NODE_H = 52;
const GAP_X = 60;
const GAP_Y = 28;

function computeDepth(
  agents: ReadonlyArray<Agent>,
): Map<string, number> {
  const ids = new Set(agents.map((a) => a.id));
  const depth = new Map<string, number>();

  let changed = true;
  while (changed) {
    changed = false;
    for (const agent of agents) {
      const deps = agent.dependencies.filter((d) => ids.has(d));
      if (deps.length === 0) {
        if (!depth.has(agent.id)) {
          depth.set(agent.id, 0);
          changed = true;
        }
      } else {
        const depDepths = deps.map((d) => depth.get(d));
        if (depDepths.every((d) => d !== undefined)) {
          const col = Math.max(...(depDepths as number[])) + 1;
          if (depth.get(agent.id) !== col) {
            depth.set(agent.id, col);
            changed = true;
          }
        }
      }
    }
  }

  for (const a of agents) {
    if (!depth.has(a.id)) depth.set(a.id, 0);
  }
  return depth;
}

function buildGraph(
  agents: ReadonlyArray<Agent>,
  activeAgentId?: string | null,
): {
  readonly nodes: Node[];
  readonly edges: Edge[];
} {
  const depthMap = computeDepth(agents);
  const ids = new Set(agents.map((a) => a.id));

  // Group by column
  const columns = new Map<number, string[]>();
  for (const a of agents) {
    const col = depthMap.get(a.id) ?? 0;
    columns.set(col, [...(columns.get(col) ?? []), a.id]);
  }

  const maxCol = Math.max(...Array.from(columns.keys()), 0);
  const maxRows = Math.max(
    ...Array.from(columns.values()).map((arr) => arr.length),
    1,
  );

  // Center each column vertically
  const totalH = maxRows * (NODE_H + GAP_Y) - GAP_Y;
  const pos = new Map<string, { x: number; y: number }>();
  for (const [col, agentIds] of columns) {
    const colH = agentIds.length * (NODE_H + GAP_Y) - GAP_Y;
    const offsetY = (totalH - colH) / 2;
    agentIds.forEach((id, row) => {
      pos.set(id, {
        x: col * (NODE_W + GAP_X),
        y: offsetY + row * (NODE_H + GAP_Y),
      });
    });
  }

  const nodes: Node[] = agents.map((agent) => {
    const p = pos.get(agent.id) ?? { x: 0, y: 0 };
    const col = depthMap.get(agent.id) ?? 0;
    const isFirst = col === 0;
    const isLast = col === maxCol;
    const isActive = activeAgentId === agent.id;

    // Use short label: if name is long (merged agents), use role instead
    const shortLabel = agent.name.length > 16 ? agent.role.split(" ").slice(0, 3).join(" ") : agent.name;

    return {
      id: agent.id,
      position: p,
      data: { label: shortLabel },
      style: {
        width: NODE_W,
        height: NODE_H,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: isActive ? 700 : 500,
        textAlign: "center" as const,
        overflow: "hidden",
        textOverflow: "ellipsis",
        borderRadius: "10px",
        border: isActive
          ? "2.5px solid var(--primary)"
          : isFirst
            ? "2px solid var(--primary)"
            : isLast
              ? "2px solid var(--success)"
              : "1.5px solid var(--node-border)",
        background: isActive
          ? "var(--info-bg)"
          : isFirst
            ? "var(--info-bg)"
            : isLast
              ? "var(--success-bg)"
              : "var(--node-bg)",
        color: "var(--foreground)",
        padding: "6px 10px",
        boxShadow: isActive
          ? "0 0 12px var(--primary)"
          : "var(--shadow-sm)",
        transition: "all 0.3s ease",
        transform: isActive ? "scale(1.08)" : "scale(1)",
      },
      draggable: false,
      connectable: false,
    };
  });

  const edges: Edge[] = [];
  for (const agent of agents) {
    for (const dep of agent.dependencies) {
      if (ids.has(dep)) {
        edges.push({
          id: `${dep}->${agent.id}`,
          source: dep,
          target: agent.id,
          type: "smoothstep",
          animated: true,
          style: { stroke: "var(--primary)", strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "var(--primary)",
            width: 16,
            height: 16,
          },
        });
      }
    }
  }

  return { nodes, edges };
}

export function WorkflowDiagram({ agents, activeAgentId }: WorkflowDiagramProps) {
  const { t } = useLocale();
  const { nodes, edges } = useMemo(() => buildGraph(agents, activeAgentId), [agents, activeAgentId]);

  if (agents.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--muted)] text-sm text-[var(--muted-foreground)]">
        {t("detail.noAgents")}
      </div>
    );
  }

  return (
    <div className="workflow-diagram h-[180px] sm:h-[200px] lg:h-[220px] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.15, maxZoom: 1 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
        minZoom={0.5}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="var(--border)" gap={20} size={1} />
        <Controls
          showInteractive={false}
          position="bottom-right"
        />
      </ReactFlow>
    </div>
  );
}
