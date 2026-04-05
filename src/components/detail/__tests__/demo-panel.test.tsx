import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DemoPanel } from "../demo-panel";
import { createAgent, createDemoScenario } from "@/test/mocks/harness-fixtures";

// Mock the hooks
vi.mock("@/hooks/use-locale", () => ({
  useLocale: () => ({
    locale: "en",
    t: (key: string, params?: Record<string, string | number>) => {
      if (key === "demo.stepOf") return `Step ${params?.current} of ${params?.total}`;
      const labels: Record<string, string> = {
        "demo.seeItInAction": "See it in action",
        "demo.title": "Demo Scenario",
        "demo.loading": "Loading demo...",
        "demo.error": "Could not load demo",
        "demo.prev": "Prev",
        "demo.next": "Next",
        "demo.autoPlay": "Auto-play",
        "demo.pause": "Pause",
        "demo.restart": "Restart",
        "demo.userPrompt": "User prompt",
        "demo.toolsUsed": "Tools",
        "demo.outputPreview": "Output preview",
      };
      return labels[key] ?? key;
    },
  }),
}));

vi.mock("@/lib/demo-loader", () => ({
  loadDemoScenario: vi.fn(),
}));

import { loadDemoScenario } from "@/lib/demo-loader";

const mockLoad = vi.mocked(loadDemoScenario);

const agents = [
  createAgent({ id: "agent-1", name: "Strategist", role: "Content Strategist" }),
  createAgent({ id: "agent-2", name: "Writer", role: "Scriptwriter" }),
  createAgent({ id: "agent-3", name: "Reviewer", role: "Production Reviewer" }),
];

describe("DemoPanel", () => {
  beforeEach(() => {
    mockLoad.mockReset();
  });

  it("renders idle state with trigger button", () => {
    render(<DemoPanel harnessId={1} agents={agents} />);
    expect(screen.getByText(/See it in action/)).toBeInTheDocument();
  });

  it("loads and shows demo on button click", async () => {
    const demo = createDemoScenario();
    mockLoad.mockResolvedValue(demo);

    render(<DemoPanel harnessId={1} agents={agents} />);

    fireEvent.click(screen.getByText(/See it in action/));

    await waitFor(() => {
      expect(screen.getByText("Demo Scenario")).toBeInTheDocument();
    });

    expect(screen.getByText(/Run the test harness/)).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
  });

  it("shows error state when demo cannot be loaded", async () => {
    mockLoad.mockResolvedValue(null);

    render(<DemoPanel harnessId={1} agents={agents} />);

    fireEvent.click(screen.getByText(/See it in action/));

    await waitFor(() => {
      expect(screen.getByText("Could not load demo")).toBeInTheDocument();
    });
  });

  it("navigates between steps", async () => {
    const demo = createDemoScenario();
    mockLoad.mockResolvedValue(demo);

    render(<DemoPanel harnessId={1} agents={agents} />);

    fireEvent.click(screen.getByText(/See it in action/));

    await waitFor(() => {
      expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Next/));
    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Prev/));
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
  });

  it("calls onActiveAgentChange when step changes", async () => {
    const demo = createDemoScenario();
    mockLoad.mockResolvedValue(demo);
    const onChange = vi.fn();

    render(
      <DemoPanel harnessId={1} agents={agents} onActiveAgentChange={onChange} />,
    );

    fireEvent.click(screen.getByText(/See it in action/));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith("agent-1");
    });

    fireEvent.click(screen.getByText(/Next/));

    expect(onChange).toHaveBeenCalledWith("agent-2");
  });
});
