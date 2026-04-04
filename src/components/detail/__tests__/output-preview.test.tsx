import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { OutputPreview } from "../output-preview";
import {
  createHarness,
  createAgent,
  createSkillMode,
} from "@/test/mocks/harness-fixtures";

// --- Mocks ---

vi.mock("@/hooks/use-locale", () => ({
  useLocale: () => ({
    locale: "ko" as const,
    setLocale: vi.fn(),
    t: (key: string, params?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        "detail.outputs": "산출물",
        "detail.outputsFallback": "출력 없음",
        "detail.frameworks": "프레임워크",
        "detail.requestAndModes": "요청 및 모드",
        "detail.modeAgents": `에이전트 ${params?.count ?? 0}명`,
      };
      return translations[key] ?? key;
    },
  }),
}));

// --- Tests ---

describe("OutputPreview", () => {
  it("renders output titles for each agent", () => {
    // Arrange
    const harness = createHarness({
      agents: [
        createAgent({ name: "Planner", outputTemplate: "# Planning Document\nSome content" }),
        createAgent({ name: "Coder", outputTemplate: "# Code Output\nMore content" }),
      ],
    });

    // Act
    render(<OutputPreview harness={harness} />);

    // Assert
    expect(screen.getByText("산출물")).toBeInTheDocument();
    expect(screen.getByText(/Planner/)).toBeInTheDocument();
    expect(screen.getByText(/Planning Document/)).toBeInTheDocument();
    expect(screen.getByText(/Coder/)).toBeInTheDocument();
    expect(screen.getByText(/Code Output/)).toBeInTheDocument();
  });

  it("shows fallback text when outputTemplate is empty", () => {
    // Arrange
    const harness = createHarness({
      agents: [createAgent({ name: "Empty Agent", outputTemplate: "" })],
    });

    // Act
    render(<OutputPreview harness={harness} />);

    // Assert
    expect(screen.getByText(/출력 없음/)).toBeInTheDocument();
  });

  it("renders frameworks as badges", () => {
    // Arrange
    const harness = createHarness({
      frameworks: ["Next.js", "TypeScript", "Vitest"],
    });

    // Act
    render(<OutputPreview harness={harness} />);

    // Assert
    expect(screen.getByText("프레임워크")).toBeInTheDocument();
    expect(screen.getByText("Next.js")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Vitest")).toBeInTheDocument();
  });

  it("does not render frameworks section when empty", () => {
    // Arrange
    const harness = createHarness({ frameworks: [] });

    // Act
    render(<OutputPreview harness={harness} />);

    // Assert
    expect(screen.queryByText("프레임워크")).not.toBeInTheDocument();
  });

  it("renders execution modes when multiple modes exist", () => {
    // Arrange
    const agents = [
      createAgent({ id: "a1", name: "Agent A" }),
      createAgent({ id: "a2", name: "Agent B" }),
    ];
    const harness = createHarness({
      agents,
      skill: {
        id: "test-skill",
        name: "Test Skill",
        triggerConditions: [],
        executionOrder: [],
        modes: [
          createSkillMode({ name: "Full Mode", triggerPattern: "run all", agents: ["a1", "a2"] }),
          createSkillMode({ name: "Light Mode", triggerPattern: "run light", agents: ["a1"] }),
        ],
        extensionSkills: [],
      },
    });

    // Act
    render(<OutputPreview harness={harness} />);

    // Assert
    expect(screen.getByText("요청 및 모드")).toBeInTheDocument();
    expect(screen.getByText("Full Mode")).toBeInTheDocument();
    expect(screen.getByText("Light Mode")).toBeInTheDocument();
  });

  it("does not show modes section when only one mode", () => {
    // Arrange
    const harness = createHarness(); // default has 1 mode

    // Act
    render(<OutputPreview harness={harness} />);

    // Assert
    expect(screen.queryByText("요청 및 모드")).not.toBeInTheDocument();
  });
});
