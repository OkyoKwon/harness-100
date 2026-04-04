import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CustomizePanel } from "../customize-panel";
import {
  createHarness,
  createAgent,
  resetFixtureCounter,
} from "@/test/mocks/harness-fixtures";

// --- Mocks ---

vi.mock("@/hooks/use-locale", () => ({
  useLocale: () => ({
    locale: "ko" as const,
    setLocale: vi.fn(),
    t: (key: string, params?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        "customizer.editMode": "편집 모드",
        "customizer.restore": "복원",
        "customizer.agentList": "에이전트 목록",
        "customizer.editArea": "편집 영역",
        "customizer.name": "이름",
        "customizer.role": "역할",
        "customizer.outputTemplate": "출력 템플릿",
        "customizer.disabledAgent": "비활성 에이전트",
        "customizer.selectAgent": "에이전트를 선택하세요",
        "customizer.changeCount": `${params?.count ?? 0}개 변경`,
        "customizer.setupModified": "수정본 세팅",
        "customizer.zipModified": "수정본 ZIP",
        "a11y.close": "닫기",
        "action.setupInProgress": "세팅 중...",
        "action.zipBuilding": "빌드 중...",
        "customizer.disableAgent": `${params?.name} 비활성화`,
        "customizer.enableAgent": `${params?.name} 활성화`,
      };
      return translations[key] ?? key;
    },
  }),
}));

vi.mock("@/hooks/use-zip-download", () => ({
  useZipDownload: () => ({
    status: "idle",
    download: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-local-setup", () => ({
  useLocalSetup: () => ({
    status: "idle",
    result: null,
    setup: vi.fn(),
    conflictReport: null,
    resolveConflicts: vi.fn(),
    cancelConflicts: vi.fn(),
  }),
}));

vi.mock("@/components/setup/conflict-modal", () => ({
  ConflictModal: () => <div data-testid="conflict-modal">ConflictModal</div>,
}));

// --- Tests ---

describe("CustomizePanel", () => {
  const agents = [
    createAgent({ id: "planner", name: "Planner", role: "Planning", outputTemplate: "# Plan" }),
    createAgent({ id: "coder", name: "Coder", role: "Coding", outputTemplate: "# Code" }),
  ];

  const harness = createHarness({
    name: "Test Harness",
    agents,
  });

  const onClose = vi.fn();

  beforeEach(() => {
    resetFixtureCounter();
    onClose.mockClear();
  });

  it("renders header with harness name and edit mode label", () => {
    // Act
    render(<CustomizePanel harness={harness} onClose={onClose} />);

    // Assert
    expect(screen.getByText(/편집 모드/)).toBeInTheDocument();
    expect(screen.getByText(/Test Harness/)).toBeInTheDocument();
  });

  it("renders agent sidebar with all agents", () => {
    // Act
    render(<CustomizePanel harness={harness} onClose={onClose} />);

    // Assert
    expect(screen.getByText("에이전트 목록")).toBeInTheDocument();
    expect(screen.getByText("Planner")).toBeInTheDocument();
    expect(screen.getByText("Coder")).toBeInTheDocument();
  });

  it("shows edit form for the first agent by default", () => {
    // Act
    render(<CustomizePanel harness={harness} onClose={onClose} />);

    // Assert
    expect(screen.getByText("편집 영역")).toBeInTheDocument();
    expect(screen.getByLabelText("이름")).toHaveValue("Planner");
  });

  it("switches agent when another is selected from sidebar", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<CustomizePanel harness={harness} onClose={onClose} />);

    // Act
    await user.click(screen.getByText("Coder"));

    // Assert
    expect(screen.getByLabelText("이름")).toHaveValue("Coder");
  });

  it("updates agent name in edit form", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<CustomizePanel harness={harness} onClose={onClose} />);

    // Act
    const nameInput = screen.getByLabelText("이름");
    await user.clear(nameInput);
    await user.type(nameInput, "New Planner");

    // Assert
    expect(nameInput).toHaveValue("New Planner");
    expect(screen.getByText(/1개 변경/)).toBeInTheDocument();
  });

  it("shows disabled agent message when agent is toggled off", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<CustomizePanel harness={harness} onClose={onClose} />);

    // Act - toggle Planner off
    const toggleBtn = screen.getByLabelText("Planner 비활성화");
    await user.click(toggleBtn);

    // Assert
    expect(screen.getByText("비활성 에이전트")).toBeInTheDocument();
  });

  it("resets changes when restore button is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<CustomizePanel harness={harness} onClose={onClose} />);

    // Make a change first
    const nameInput = screen.getByLabelText("이름");
    await user.clear(nameInput);
    await user.type(nameInput, "Changed");
    expect(screen.getByText(/1개 변경/)).toBeInTheDocument();

    // Act - click restore
    const restoreBtns = screen.getAllByText("복원");
    await user.click(restoreBtns[0]);

    // Assert
    expect(screen.getByText(/0개 변경/)).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<CustomizePanel harness={harness} onClose={onClose} />);

    // Act
    await user.click(screen.getByLabelText("닫기"));

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows change count in footer", () => {
    // Act
    render(<CustomizePanel harness={harness} onClose={onClose} />);

    // Assert
    expect(screen.getByText("0개 변경")).toBeInTheDocument();
  });
});
