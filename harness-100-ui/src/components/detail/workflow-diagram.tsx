"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Agent } from "@/lib/types";

interface WorkflowDiagramProps {
  readonly agents: ReadonlyArray<Agent>;
}

const NODE_WIDTH = 180;
const NODE_HEIGHT = 60;
const COLUMN_GAP = 220;
const ROW_GAP = 100;

interface ColumnAssignment {
  readonly agentId: string;
  readonly column: number;
}

function computeColumnAssignments(
  agents: ReadonlyArray<Agent>,
): ReadonlyArray<ColumnAssignment> {
  const agentIds = new Set(agents.map((a) => a.id));
  const columnMap = new Map<string, number>();

  // Iteratively resolve columns using BFS-like approach
  let changed = true;
  while (changed) {
    changed = false;
    for (const agent of agents) {
      const validDeps = agent.dependencies.filter((d) => agentIds.has(d));
      if (validDeps.length === 0) {
        if (!columnMap.has(agent.id)) {
          columnMap.set(agent.id, 0);
          changed = true;
        }
      } else {
        const depColumns = validDeps.map((d) => columnMap.get(d));
        if (depColumns.every((c) => c !== undefined)) {
          const maxDepCol = Math.max(
            ...(depColumns as ReadonlyArray<number>),
          );
          const newCol = maxDepCol + 1;
          if (columnMap.get(agent.id) !== newCol) {
            columnMap.set(agent.id, newCol);
            changed = true;
          }
        }
      }
    }
  }

  // Assign column 0 to any unresolved agents (circular deps fallback)
  for (const agent of agents) {
    if (!columnMap.has(agent.id)) {
      columnMap.set(agent.id, 0);
    }
  }

  return agents.map((a) => ({
    agentId: a.id,
    column: columnMap.get(a.id) ?? 0,
  }));
}

function buildNodesAndEdges(agents: ReadonlyArray<Agent>): {
  readonly nodes: Node[];
  readonly edges: Edge[];
} {
  const assignments = computeColumnAssignments(agents);
  const agentIds = new Set(agents.map((a) => a.id));

  // Group agents by column to compute row positions
  const columnGroups = new Map<number, string[]>();
  for (const { agentId, column } of assignments) {
    const group = columnGroups.get(column) ?? [];
    columnGroups.set(column, [...group, agentId]);
  }

  const positionMap = new Map<string, { x: number; y: number }>();
  for (const [column, agentIdsInCol] of columnGroups) {
    agentIdsInCol.forEach((id, rowIndex) => {
      positionMap.set(id, {
        x: column * COLUMN_GAP,
        y: rowIndex * ROW_GAP,
      });
    });
  }

  const nodes: Node[] = agents.map((agent) => {
    const pos = positionMap.get(agent.id) ?? { x: 0, y: 0 };
    return {
      id: agent.id,
      position: pos,
      data: { label: `${agent.name}\n${agent.role}` },
      style: {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        textAlign: "center" as const,
        borderRadius: "8px",
        border: "1px solid #bfdbfe",
        background: "#eff6ff",
        color: "#1e3a5f",
        whiteSpace: "pre-line" as const,
        padding: "8px",
        lineHeight: "1.3",
      },
      draggable: false,
      connectable: false,
    };
  });

  const edges: Edge[] = [];
  for (const agent of agents) {
    for (const dep of agent.dependencies) {
      if (agentIds.has(dep)) {
        edges.push({
          id: `${dep}->${agent.id}`,
          source: dep,
          target: agent.id,
          animated: true,
          style: { stroke: "#93c5fd", strokeWidth: 2 },
        });
      }
    }
  }

  return { nodes, edges };
}

export function WorkflowDiagram({ agents }: WorkflowDiagramProps) {
  const { nodes, edges } = useMemo(() => buildNodesAndEdges(agents), [agents]);

  if (agents.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-500">
        에이전트가 없습니다.
      </div>
    );
  }

  return (
    <div className="h-[400px] min-h-[300px] overflow-hidden rounded-lg border border-gray-200 bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#e5e7eb" gap={16} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor="#bfdbfe"
          maskColor="rgba(255,255,255,0.8)"
          style={{ height: 80 }}
        />
      </ReactFlow>
    </div>
  );
}
