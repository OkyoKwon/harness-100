import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import RankingPage from "../ranking/page";
import { createRankingFixture } from "@/test/mocks/harness-fixtures";
import { LanguageProvider } from "@/hooks/use-locale";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock the harness-loader module
const mockLoadCatalog = vi.fn();
vi.mock("@/lib/harness-loader", () => ({
  loadCatalog: (...args: unknown[]) => mockLoadCatalog(...args),
}));

// Mock child components to isolate ranking page logic
vi.mock("@/components/ranking/ranking-podium", () => ({
  RankingPodium: ({ items }: { items: ReadonlyArray<{ name: string }> }) => (
    <div data-testid="ranking-podium">
      {items.map((item) => (
        <span key={item.name}>{item.name}</span>
      ))}
    </div>
  ),
}));

vi.mock("@/components/ranking/ranking-list", () => ({
  RankingList: ({ items }: { items: ReadonlyArray<{ name: string }> }) => (
    <div data-testid="ranking-list">
      {items.map((item) => (
        <span key={item.name}>{item.name}</span>
      ))}
    </div>
  ),
}));

vi.mock("@/components/ranking/ranking-table", () => ({
  RankingTable: ({ items }: { items: ReadonlyArray<{ name: string }> }) => (
    <div data-testid="ranking-table">
      {items.map((item) => (
        <span key={item.name}>{item.name}</span>
      ))}
    </div>
  ),
}));

function renderWithLocale(ui: React.ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe("RankingPage", () => {
  const rankingData = createRankingFixture();

  beforeEach(() => {
    mockLoadCatalog.mockReset();
  });

  it("renders loading skeleton initially", () => {
    // Arrange - loadCatalog never resolves
    mockLoadCatalog.mockReturnValue(new Promise(() => {}));

    // Act
    renderWithLocale(<RankingPage />);

    // Assert - skeleton has animate-pulse class
    const main = document.querySelector(".animate-pulse");
    expect(main).not.toBeNull();
  });

  it("loads and displays ranking data", async () => {
    // Arrange
    mockLoadCatalog.mockResolvedValue(rankingData);

    // Act
    renderWithLocale(<RankingPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId("ranking-podium")).toBeInTheDocument();
    });
    expect(screen.getByText("인기 랭킹")).toBeInTheDocument();
  });

  it("passes top 3 items to RankingPodium", async () => {
    // Arrange
    mockLoadCatalog.mockResolvedValue(rankingData);

    // Act
    renderWithLocale(<RankingPage />);

    // Assert
    await waitFor(() => {
      const podium = screen.getByTestId("ranking-podium");
      expect(podium).toHaveTextContent("Harness Rank 1");
      expect(podium).toHaveTextContent("Harness Rank 2");
      expect(podium).toHaveTextContent("Harness Rank 3");
    });
  });

  it("passes items 4-10 to RankingList", async () => {
    // Arrange
    mockLoadCatalog.mockResolvedValue(rankingData);

    // Act
    renderWithLocale(<RankingPage />);

    // Assert
    await waitFor(() => {
      const list = screen.getByTestId("ranking-list");
      expect(list).toHaveTextContent("Harness Rank 4");
      expect(list).toHaveTextContent("Harness Rank 10");
    });
  });

  it("passes items 11+ to RankingTable", async () => {
    // Arrange
    mockLoadCatalog.mockResolvedValue(rankingData);

    // Act
    renderWithLocale(<RankingPage />);

    // Assert
    await waitFor(() => {
      const table = screen.getByTestId("ranking-table");
      expect(table).toHaveTextContent("Harness Rank 11");
      expect(table).toHaveTextContent("Harness Rank 15");
    });
  });

  it("shows error state with retry button on fetch failure", async () => {
    // Arrange
    mockLoadCatalog.mockRejectedValue(new Error("Network error"));

    // Act
    renderWithLocale(<RankingPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
    expect(screen.getByText("다시 시도")).toBeInTheDocument();
  });

  it("shows generic error message for non-Error exceptions", async () => {
    // Arrange
    mockLoadCatalog.mockRejectedValue("unknown failure");

    // Act
    renderWithLocale(<RankingPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("데이터를 불러오는 데 실패했습니다.")).toBeInTheDocument();
    });
  });

  it("does not show RankingTable when there are fewer than 11 items", async () => {
    // Arrange - only 5 items
    const smallData = rankingData.slice(0, 5);
    mockLoadCatalog.mockResolvedValue(smallData);

    // Act
    renderWithLocale(<RankingPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId("ranking-podium")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("ranking-table")).not.toBeInTheDocument();
  });

  it("does not show RankingList when there are only 3 items", async () => {
    // Arrange - only 3 items (top 3 only)
    const top3Only = rankingData.slice(0, 3);
    mockLoadCatalog.mockResolvedValue(top3Only);

    // Act
    renderWithLocale(<RankingPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId("ranking-podium")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("ranking-list")).not.toBeInTheDocument();
  });

  it("has a link back to catalog", async () => {
    // Arrange
    mockLoadCatalog.mockResolvedValue(rankingData);

    // Act
    renderWithLocale(<RankingPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("인기 랭킹")).toBeInTheDocument();
    });
    const catalogLink = screen.getByText("← 카탈로그");
    expect(catalogLink).toHaveAttribute("href", "/");
  });
});
