import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { WorkflowDiagram } from "../workflow-diagram";
import { createAgent } from "@/test/mocks/harness-fixtures";

// Mock @xyflow/react completely
vi.mock("@xyflow/react", () => ({
  ReactFlow: ({ children, nodes, edges }: any) => (
    <div
      data-testid="react-flow"
      data-nodes={JSON.stringify(nodes)}
      data-edges={JSON.stringify(edges)}
    >
      {children}
    </div>
  ),
  Background: () => <div data-testid="background" />,
  Controls: () => <div data-testid="controls" />,
  MiniMap: () => <div data-testid="minimap" />,
  Handle: ({ type }: any) => <div data-testid={`handle-${type}`} />,
  Position: { Top: "top", Bottom: "bottom", Left: "left", Right: "right" },
  MarkerType: { ArrowClosed: "arrowclosed" },
  useNodesState: (initial: any) => [initial, vi.fn(), vi.fn()],
  useEdgesState: (initial: any) => [initial, vi.fn(), vi.fn()],
}));

vi.mock("@/hooks/use-locale", () => ({
  useLocale: () => ({
    locale: "ko" as const,
    setLocale: vi.fn(),
    t: (key: string) => {
      const translations: Record<string, string> = {
        "detail.noAgents": "에이전트가 없습니다",
      };
      return translations[key] ?? key;
    },
  }),
}));

describe("WorkflowDiagram", () => {
  it("should_render_empty_state_when_agents_is_empty", () => {
    // Arrange & Act
    render(<WorkflowDiagram agents={[]} />);

    // Assert
    expect(screen.getByText("에이전트가 없습니다")).toBeInTheDocument();
    expect(screen.queryByTestId("react-flow")).not.toBeInTheDocument();
  });

  it("should_render_react_flow_when_agents_provided", () => {
    // Arrange
    const agents = [
      createAgent({ id: "a1", name: "Agent A", dependencies: [] }),
    ];

    // Act
    render(<WorkflowDiagram agents={agents} />);

    // Assert
    expect(screen.getByTestId("react-flow")).toBeInTheDocument();
    expect(screen.getByTestId("background")).toBeInTheDocument();
    expect(screen.getByTestId("controls")).toBeInTheDocument();
  });

  it("should_create_nodes_for_each_agent", () => {
    // Arrange
    const agents = [
      createAgent({ id: "a1", name: "Planner", dependencies: [] }),
      createAgent({ id: "a2", name: "Coder", dependencies: ["a1"] }),
    ];

    // Act
    render(<WorkflowDiagram agents={agents} />);

    // Assert
    const flowEl = screen.getByTestId("react-flow");
    const nodes = JSON.parse(flowEl.getAttribute("data-nodes") ?? "[]");
    expect(nodes).toHaveLength(2);
    expect(nodes[0].id).toBe("a1");
    expect(nodes[1].id).toBe("a2");
  });

  it("should_create_edges_for_dependencies", () => {
    // Arrange
    const agents = [
      createAgent({ id: "a1", name: "Planner", dependencies: [] }),
      createAgent({ id: "a2", name: "Coder", dependencies: ["a1"] }),
    ];

    // Act
    render(<WorkflowDiagram agents={agents} />);

    // Assert
    const flowEl = screen.getByTestId("react-flow");
    const edges = JSON.parse(flowEl.getAttribute("data-edges") ?? "[]");
    expect(edges).toHaveLength(1);
    expect(edges[0].source).toBe("a1");
    expect(edges[0].target).toBe("a2");
    expect(edges[0].id).toBe("a1->a2");
  });

  it("should_position_nodes_in_columns_by_dependency_depth", () => {
    // Arrange - a1 has no deps (col 0), a2 depends on a1 (col 1), a3 depends on a2 (col 2)
    const agents = [
      createAgent({ id: "a1", name: "Step 1", dependencies: [] }),
      createAgent({ id: "a2", name: "Step 2", dependencies: ["a1"] }),
      createAgent({ id: "a3", name: "Step 3", dependencies: ["a2"] }),
    ];

    // Act
    render(<WorkflowDiagram agents={agents} />);

    // Assert
    const flowEl = screen.getByTestId("react-flow");
    const nodes = JSON.parse(flowEl.getAttribute("data-nodes") ?? "[]");
    // Each subsequent node should have a greater x position
    expect(nodes[0].position.x).toBeLessThan(nodes[1].position.x);
    expect(nodes[1].position.x).toBeLessThan(nodes[2].position.x);
  });

  it("should_place_parallel_agents_in_same_column", () => {
    // Arrange - a2 and a3 both depend only on a1 so they share column 1
    const agents = [
      createAgent({ id: "a1", name: "Root", dependencies: [] }),
      createAgent({ id: "a2", name: "Branch A", dependencies: ["a1"] }),
      createAgent({ id: "a3", name: "Branch B", dependencies: ["a1"] }),
    ];

    // Act
    render(<WorkflowDiagram agents={agents} />);

    // Assert
    const flowEl = screen.getByTestId("react-flow");
    const nodes = JSON.parse(flowEl.getAttribute("data-nodes") ?? "[]");
    const nodeA2 = nodes.find((n: any) => n.id === "a2");
    const nodeA3 = nodes.find((n: any) => n.id === "a3");
    expect(nodeA2.position.x).toBe(nodeA3.position.x);
    expect(nodeA2.position.y).not.toBe(nodeA3.position.y);
  });

  it("should_style_first_column_nodes_with_primary_border", () => {
    // Arrange
    const agents = [
      createAgent({ id: "a1", name: "First", dependencies: [] }),
      createAgent({ id: "a2", name: "Second", dependencies: ["a1"] }),
    ];

    // Act
    render(<WorkflowDiagram agents={agents} />);

    // Assert
    const flowEl = screen.getByTestId("react-flow");
    const nodes = JSON.parse(flowEl.getAttribute("data-nodes") ?? "[]");
    const firstNode = nodes.find((n: any) => n.id === "a1");
    const lastNode = nodes.find((n: any) => n.id === "a2");
    expect(firstNode.style.border).toContain("var(--primary)");
    expect(lastNode.style.border).toContain("var(--success)");
  });

  it("should_create_multiple_edges_when_agent_has_multiple_dependencies", () => {
    // Arrange
    const agents = [
      createAgent({ id: "a1", name: "A", dependencies: [] }),
      createAgent({ id: "a2", name: "B", dependencies: [] }),
      createAgent({ id: "a3", name: "C", dependencies: ["a1", "a2"] }),
    ];

    // Act
    render(<WorkflowDiagram agents={agents} />);

    // Assert
    const flowEl = screen.getByTestId("react-flow");
    const edges = JSON.parse(flowEl.getAttribute("data-edges") ?? "[]");
    expect(edges).toHaveLength(2);
    expect(edges.map((e: any) => e.source).sort()).toEqual(["a1", "a2"]);
  });

  it("should_ignore_dependencies_not_in_agent_list", () => {
    // Arrange - a2 depends on "external" which is not in the agents list
    const agents = [
      createAgent({ id: "a1", name: "A", dependencies: [] }),
      createAgent({ id: "a2", name: "B", dependencies: ["external"] }),
    ];

    // Act
    render(<WorkflowDiagram agents={agents} />);

    // Assert
    const flowEl = screen.getByTestId("react-flow");
    const edges = JSON.parse(flowEl.getAttribute("data-edges") ?? "[]");
    expect(edges).toHaveLength(0);
  });

  it("should_use_short_label_when_name_is_long", () => {
    // Arrange - name longer than 16 chars should use role (first 3 words) instead
    const agents = [
      createAgent({
        id: "a1",
        name: "Very Long Agent Name That Exceeds Limit",
        role: "Data Processing Expert",
        dependencies: [],
      }),
    ];

    // Act
    render(<WorkflowDiagram agents={agents} />);

    // Assert
    const flowEl = screen.getByTestId("react-flow");
    const nodes = JSON.parse(flowEl.getAttribute("data-nodes") ?? "[]");
    expect(nodes[0].data.label).toBe("Data Processing Expert");
  });

  it("should_use_name_as_label_when_name_is_short", () => {
    // Arrange
    const agents = [
      createAgent({
        id: "a1",
        name: "Short Name",
        role: "Long Role Description",
        dependencies: [],
      }),
    ];

    // Act
    render(<WorkflowDiagram agents={agents} />);

    // Assert
    const flowEl = screen.getByTestId("react-flow");
    const nodes = JSON.parse(flowEl.getAttribute("data-nodes") ?? "[]");
    expect(nodes[0].data.label).toBe("Short Name");
  });

  it("should_handle_single_agent_with_no_dependencies", () => {
    // Arrange
    const agents = [
      createAgent({ id: "a1", name: "Solo", dependencies: [] }),
    ];

    // Act
    render(<WorkflowDiagram agents={agents} />);

    // Assert
    const flowEl = screen.getByTestId("react-flow");
    const nodes = JSON.parse(flowEl.getAttribute("data-nodes") ?? "[]");
    const edges = JSON.parse(flowEl.getAttribute("data-edges") ?? "[]");
    expect(nodes).toHaveLength(1);
    expect(edges).toHaveLength(0);
    // Single agent is both first and last, should get primary border (first wins)
    expect(nodes[0].style.border).toContain("var(--primary)");
  });
});
