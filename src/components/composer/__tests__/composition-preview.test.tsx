import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CompositionPreview } from "../composition-preview";
import {
  createHarness,
  createAgent,
} from "@/test/mocks/harness-fixtures";

// --- Mocks ---

vi.mock("@/hooks/use-locale", () => ({
  useLocale: () => ({
    locale: "ko" as const,
    setLocale: vi.fn(),
    t: (key: string, params?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        "composer.previewTitle": "미리보기",
        "composer.selectPrompt": "하네스를 선택하세요",
        "composer.harnessCount": `${params?.count ?? 0}개 하네스`,
        "composer.totalAgents": `총 ${params?.count ?? 0}명`,
        "composer.frameworkCount": `${params?.count ?? 0}개 프레임워크`,
        "composer.agentCount": `${params?.count ?? 0}명`,
        "composer.setupComposed": "조합 세팅",
        "composer.next": "다음",
        "composer.skipToExport": "바로 내보내기",
        "action.zip": "ZIP 다운로드",
        "action.setupInProgress": "세팅 중...",
        "action.zipBuilding": "빌드 중...",
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

vi.mock("@/components/common/completion-banner", () => ({
  CompletionBanner: ({ type }: { type: string }) => (
    <div data-testid={`completion-banner-${type}`}>Banner: {type}</div>
  ),
}));

// --- Tests ---

describe("CompositionPreview", () => {
  it("shows empty state when no harnesses are selected", () => {
    // Act
    render(
      <CompositionPreview
        merged={null}
        loading={false}
        selectedCount={0}
        loadedHarnesses={[]}
      />,
    );

    // Assert
    expect(screen.getByText("미리보기")).toBeInTheDocument();
    expect(screen.getByText("하네스를 선택하세요")).toBeInTheDocument();
  });

  it("shows spinner when loading", () => {
    // Act
    render(
      <CompositionPreview
        merged={null}
        loading={true}
        selectedCount={1}
        loadedHarnesses={[]}
      />,
    );

    // Assert - spinner has animate-spin class
    expect(screen.queryByText("하네스를 선택하세요")).not.toBeInTheDocument();
  });

  it("renders merged harness summary", () => {
    // Arrange
    const agents = [
      createAgent({ id: "a1", name: "Agent A" }),
      createAgent({ id: "a2", name: "Agent B" }),
    ];
    const merged = createHarness({
      agents,
      agentCount: 2,
      frameworks: ["Next.js", "TypeScript"],
    });
    const loadedHarnesses = [merged];

    // Act
    render(
      <CompositionPreview
        merged={merged}
        loading={false}
        selectedCount={1}
        loadedHarnesses={loadedHarnesses}
      />,
    );

    // Assert
    expect(screen.getByText("1개 하네스")).toBeInTheDocument();
    expect(screen.getByText("총 2명")).toBeInTheDocument();
    expect(screen.getByText("2개 프레임워크")).toBeInTheDocument();
  });

  it("shows navigation buttons when onNext is provided", () => {
    // Arrange
    const merged = createHarness({ agentCount: 3, frameworks: [] });
    const loadedHarnesses = [merged];
    const onNext = vi.fn();
    const onSkipToExport = vi.fn();

    // Act
    render(
      <CompositionPreview
        merged={merged}
        loading={false}
        selectedCount={1}
        loadedHarnesses={loadedHarnesses}
        onNext={onNext}
        onSkipToExport={onSkipToExport}
      />,
    );

    // Assert
    expect(screen.getByText(/다음/)).toBeInTheDocument();
    expect(screen.getByText("바로 내보내기")).toBeInTheDocument();
  });

  it("does not show navigation buttons when no selection", () => {
    // Act
    render(
      <CompositionPreview
        merged={null}
        loading={false}
        selectedCount={0}
        loadedHarnesses={[]}
      />,
    );

    // Assert
    expect(screen.queryByText(/다음/)).not.toBeInTheDocument();
  });

  it("renders harness cards in grid", () => {
    // Arrange
    const h1 = createHarness({ id: 1, name: "Harness A", agentCount: 2, frameworks: [] });
    const h2 = createHarness({ id: 2, name: "Harness B", agentCount: 3, frameworks: [] });
    const merged = createHarness({ agentCount: 5, frameworks: [] });

    // Act
    render(
      <CompositionPreview
        merged={merged}
        loading={false}
        selectedCount={2}
        loadedHarnesses={[h1, h2]}
      />,
    );

    // Assert
    expect(screen.getByText("Harness A")).toBeInTheDocument();
    expect(screen.getByText("Harness B")).toBeInTheDocument();
  });
});
