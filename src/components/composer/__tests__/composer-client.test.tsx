import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComposerClient } from "../composer-client";
import {
  createCatalogFixture,
  resetFixtureCounter,
} from "@/test/mocks/harness-fixtures";

// --- Mocks ---

vi.mock("@/hooks/use-locale", () => ({
  useLocale: () => ({
    locale: "ko" as const,
    setLocale: vi.fn(),
    t: (key: string, params?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        "composer.title": "하네스 조합기",
        "composer.description": "여러 하네스를 조합하세요",
        "composer.reset": "초기화",
        "composer.searchPlaceholder": "검색...",
        "composer.catalogError": "카탈로그 로딩 실패",
        "composer.selected": `선택됨 (${params?.count ?? 0})`,
        "composer.selectedCount": `${params?.count ?? 0}개 선택`,
        "composer.clearAll": "전체 해제",
        "composer.agentCount": `${params?.count ?? 0}명`,
        "composer.previewTitle": "미리보기",
        "composer.selectPrompt": "하네스를 선택하세요",
        "composer.harnessCount": `${params?.count ?? 0}개 하네스`,
        "composer.totalAgents": `총 ${params?.count ?? 0}명`,
        "composer.frameworkCount": `${params?.count ?? 0}개 프레임워크`,
        "action.zip": "ZIP 다운로드",
        "composer.setupComposed": "조합 세팅",
      };
      return translations[key] ?? key;
    },
  }),
}));

const mockPush = vi.fn();
const mockReplace = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: vi.fn(),
    forward: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
}));

const mockLoadCatalog = vi.fn();
vi.mock("@/lib/harness-loader", () => ({
  loadCatalog: (...args: unknown[]) => mockLoadCatalog(...args),
  loadHarnessDetail: vi.fn().mockRejectedValue(new Error("not mocked")),
}));

vi.mock("@/hooks/use-composer", () => ({
  useComposer: () => ({
    selectedIds: [],
    loadedHarnesses: [],
    merged: null,
    loading: false,
    addHarness: vi.fn(),
    removeHarness: vi.fn(),
    clear: vi.fn(),
    setSelectedIds: vi.fn(),
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

describe("ComposerClient", () => {
  beforeEach(() => {
    resetFixtureCounter();
    mockPush.mockClear();
    mockReplace.mockClear();
    mockLoadCatalog.mockReset();
    mockSearchParams = new URLSearchParams();
  });

  it("renders page title and description", async () => {
    // Arrange
    mockLoadCatalog.mockResolvedValue(createCatalogFixture());

    // Act
    render(<ComposerClient />);

    // Assert
    expect(screen.getByText("하네스 조합기")).toBeInTheDocument();
    expect(screen.getByText("여러 하네스를 조합하세요")).toBeInTheDocument();
  });

  it("loads and renders catalog items", async () => {
    // Arrange
    const catalog = createCatalogFixture();
    mockLoadCatalog.mockResolvedValue(catalog);

    // Act
    render(<ComposerClient />);

    // Assert
    await waitFor(() => {
      expect(mockLoadCatalog).toHaveBeenCalledWith("ko");
    });
  });

  it("shows empty state when no harnesses are selected", () => {
    // Arrange
    mockLoadCatalog.mockResolvedValue([]);

    // Act
    render(<ComposerClient />);

    // Assert
    expect(screen.getByText("하네스를 선택하세요")).toBeInTheDocument();
  });

  it("shows error when catalog loading fails", async () => {
    // Arrange
    mockLoadCatalog.mockRejectedValue(new Error("Network error"));

    // Act
    render(<ComposerClient />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("카탈로그 로딩 실패")).toBeInTheDocument();
    });
  });

  it("renders search input in the selector", async () => {
    // Arrange
    mockLoadCatalog.mockResolvedValue(createCatalogFixture());

    // Act
    render(<ComposerClient />);

    // Assert
    expect(screen.getByPlaceholderText("검색...")).toBeInTheDocument();
  });

  it("shows selected count", () => {
    // Arrange
    mockLoadCatalog.mockResolvedValue([]);

    // Act
    render(<ComposerClient />);

    // Assert
    expect(screen.getByText("0개 선택")).toBeInTheDocument();
  });
});
