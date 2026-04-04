import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HarnessDetailClient } from "../harness-detail-client";
import {
  createHarness,
  createAgent,
  resetFixtureCounter,
} from "@/test/mocks/harness-fixtures";
import type { Harness } from "@/lib/types";

// --- Mocks ---

vi.mock("@/hooks/use-locale", () => ({
  useLocale: () => ({
    locale: "ko" as const,
    setLocale: vi.fn(),
    t: (key: string, params?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        "detail.invalidId": "잘못된 ID입니다",
        "detail.loadError": "로딩 실패",
        "detail.backToList": "목록으로",
        "detail.cannotLoad": "불러올 수 없습니다",
        "detail.agentCount": `에이전트 ${params?.count ?? 0}명`,
        "detail.agents": `에이전트 (${params?.count ?? 0})`,
        "detail.workflow": "워크플로우",
        "detail.outputs": "산출물",
        "detail.tools": "도구",
        "detail.viewSkillMd": "스킬 마크다운 보기",
        "action.setup": "세팅",
        "action.setupInProgress": "세팅 중...",
        "action.zip": "ZIP 다운로드",
        "action.zipBuilding": "빌드 중...",
        "favorite.add": "즐겨찾기 추가",
        "favorite.remove": "즐겨찾기 제거",
        "toast.setupComplete": `${params?.count ?? 0}개 파일 완료`,
        "toast.zipComplete": "ZIP 완료",
        "setup.guideTitle": "세팅 가이드",
        "setup.step1": "1단계",
        "setup.step2": "2단계",
        "setup.step3prefix": "3단계:",
        "setup.step3suffix": "실행",
        "setup.tip": "팁",
      };
      return translations[key] ?? key;
    },
  }),
}));

const mockToggleFavorite = vi.fn();
const mockIsFavorite = vi.fn().mockReturnValue(false);
vi.mock("@/hooks/use-favorites", () => ({
  useFavorites: () => ({
    toggle: mockToggleFavorite,
    isFavorite: mockIsFavorite,
  }),
}));

const mockDownloadZip = vi.fn();
let mockZipStatus = "idle";
vi.mock("@/hooks/use-zip-download", () => ({
  useZipDownload: () => ({
    status: mockZipStatus,
    download: mockDownloadZip,
  }),
}));

const mockRunSetup = vi.fn();
let mockSetupStatus = "idle";
let mockSetupResult: null | { filesWritten: number; filesSkipped: number; filesMerged: number; path: string } = null;
let mockSetupSupported = true;
let mockConflictReport: null | { conflicts: readonly [] } = null;
vi.mock("@/hooks/use-local-setup", () => ({
  useLocalSetup: () => ({
    status: mockSetupStatus,
    result: mockSetupResult,
    supported: mockSetupSupported,
    setup: mockRunSetup,
    conflictReport: mockConflictReport,
    resolveConflicts: vi.fn(),
    cancelConflicts: vi.fn(),
  }),
}));

const mockAddToast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

// Mock sub-components that are complex to render in isolation
vi.mock("@/components/detail/workflow-diagram", () => ({
  WorkflowDiagram: ({ agents }: { agents: readonly unknown[] }) => (
    <div data-testid="workflow-diagram">Workflow ({agents.length})</div>
  ),
}));

vi.mock("@/components/common/completion-banner", () => ({
  CompletionBanner: ({ type }: { type: string }) => (
    <div data-testid={`completion-banner-${type}`}>Banner: {type}</div>
  ),
}));

vi.mock("@/components/setup/conflict-modal", () => ({
  ConflictModal: () => <div data-testid="conflict-modal">ConflictModal</div>,
}));

vi.mock("@/components/common/markdown-viewer", () => ({
  MarkdownViewer: () => null,
}));

// Mock harness-loader
const mockLoadHarnessDetail = vi.fn();
vi.mock("@/lib/harness-loader", () => ({
  loadHarnessDetail: (...args: unknown[]) => mockLoadHarnessDetail(...args),
}));

// --- Helpers ---

function buildHarness(overrides?: Partial<Harness>): Harness {
  return createHarness({
    id: 16,
    slug: "fullstack-web-app",
    name: "Fullstack Web App",
    description: "Full stack web app development",
    category: "development",
    frameworks: ["Next.js", "TypeScript"],
    agents: [
      createAgent({ id: "planner", name: "Planner", role: "Planning", tools: ["Read"] }),
      createAgent({ id: "coder", name: "Coder", role: "Coding", tools: ["Write", "Bash"] }),
    ],
    ...overrides,
  });
}

// --- Tests ---

describe("HarnessDetailClient", () => {
  beforeEach(() => {
    resetFixtureCounter();
    mockToggleFavorite.mockClear();
    mockIsFavorite.mockReturnValue(false);
    mockDownloadZip.mockClear();
    mockRunSetup.mockClear();
    mockAddToast.mockClear();
    mockLoadHarnessDetail.mockReset();
    mockZipStatus = "idle";
    mockSetupStatus = "idle";
    mockSetupResult = null;
    mockSetupSupported = true;
    mockConflictReport = null;
  });

  it("shows loading skeleton initially", () => {
    // Arrange
    mockLoadHarnessDetail.mockReturnValue(new Promise(() => {}));

    // Act
    const { container } = render(<HarnessDetailClient idParam="16" />);

    // Assert - skeleton has animate-pulse class
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    expect(screen.queryByText("Fullstack Web App")).not.toBeInTheDocument();
  });

  it("shows error for invalid id (NaN)", async () => {
    // Act
    render(<HarnessDetailClient idParam="abc" />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("잘못된 ID입니다")).toBeInTheDocument();
    });
  });

  it("shows error for invalid id (0)", async () => {
    // Act
    render(<HarnessDetailClient idParam="0" />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("잘못된 ID입니다")).toBeInTheDocument();
    });
  });

  it("renders harness name, description, and category after loading", async () => {
    // Arrange
    const harness = buildHarness();
    mockLoadHarnessDetail.mockResolvedValue(harness);

    // Act
    render(<HarnessDetailClient idParam="16" />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Fullstack Web App")).toBeInTheDocument();
    });
    expect(screen.getByText("Full stack web app development")).toBeInTheDocument();
    expect(screen.getByText("개발")).toBeInTheDocument();
  });

  it("renders agent list and workflow diagram", async () => {
    // Arrange
    const harness = buildHarness();
    mockLoadHarnessDetail.mockResolvedValue(harness);

    // Act
    render(<HarnessDetailClient idParam="16" />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Planner")).toBeInTheDocument();
    });
    expect(screen.getByText("Coder")).toBeInTheDocument();
    expect(screen.getByTestId("workflow-diagram")).toBeInTheDocument();
  });

  it("renders frameworks", async () => {
    // Arrange
    const harness = buildHarness();
    mockLoadHarnessDetail.mockResolvedValue(harness);

    // Act
    render(<HarnessDetailClient idParam="16" />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Fullstack Web App")).toBeInTheDocument();
    });
    expect(screen.getByText(/Next\.js, TypeScript/)).toBeInTheDocument();
  });

  it("toggles favorite when favorite button is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    const harness = buildHarness();
    mockLoadHarnessDetail.mockResolvedValue(harness);

    // Act
    render(<HarnessDetailClient idParam="16" />);

    await waitFor(() => {
      expect(screen.getByText("Fullstack Web App")).toBeInTheDocument();
    });

    const favoriteBtn = screen.getByLabelText("즐겨찾기 추가");
    await user.click(favoriteBtn);

    // Assert
    expect(mockToggleFavorite).toHaveBeenCalledWith(16);
  });

  it("calls setup when setup button is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    const harness = buildHarness();
    mockLoadHarnessDetail.mockResolvedValue(harness);

    // Act
    render(<HarnessDetailClient idParam="16" />);

    await waitFor(() => {
      expect(screen.getByText("Fullstack Web App")).toBeInTheDocument();
    });

    const setupBtn = screen.getByText("세팅");
    await user.click(setupBtn);

    // Assert
    expect(mockRunSetup).toHaveBeenCalledTimes(1);
  });

  it("calls downloadZip when zip button is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    const harness = buildHarness();
    mockLoadHarnessDetail.mockResolvedValue(harness);

    // Act
    render(<HarnessDetailClient idParam="16" />);

    await waitFor(() => {
      expect(screen.getByText("Fullstack Web App")).toBeInTheDocument();
    });

    const zipBtn = screen.getByText("ZIP 다운로드");
    await user.click(zipBtn);

    // Assert
    expect(mockDownloadZip).toHaveBeenCalledTimes(1);
  });

  it("disables setup button when not supported", async () => {
    // Arrange
    mockSetupSupported = false;
    const harness = buildHarness();
    mockLoadHarnessDetail.mockResolvedValue(harness);

    // Act
    render(<HarnessDetailClient idParam="16" />);

    await waitFor(() => {
      expect(screen.getByText("Fullstack Web App")).toBeInTheDocument();
    });

    // Assert
    const setupBtn = screen.getByText("세팅");
    expect(setupBtn).toBeDisabled();
  });

  it("shows error message when data loading fails", async () => {
    // Arrange
    mockLoadHarnessDetail.mockRejectedValue(new Error("Network error"));

    // Act
    render(<HarnessDetailClient idParam="16" />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("renders setup guide with CLI command", async () => {
    // Arrange
    const harness = buildHarness();
    mockLoadHarnessDetail.mockResolvedValue(harness);

    // Act
    render(<HarnessDetailClient idParam="16" />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("세팅 가이드")).toBeInTheDocument();
    });
    expect(screen.getByText('claude "/fullstack-web-app"')).toBeInTheDocument();
  });

  it("shows back-to-list link", async () => {
    // Arrange
    const harness = buildHarness();
    mockLoadHarnessDetail.mockResolvedValue(harness);

    // Act
    render(<HarnessDetailClient idParam="16" />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Fullstack Web App")).toBeInTheDocument();
    });
    // The back link contains an arrow character + text
    const backLinks = screen.getAllByRole("link");
    const backLink = backLinks.find((el) => el.textContent?.includes("목록으로"));
    expect(backLink).toHaveAttribute("href", "/");
  });
});
