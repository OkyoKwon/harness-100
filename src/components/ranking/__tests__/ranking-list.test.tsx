import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RankingList } from "../ranking-list";
import {
  createHarnessMeta,
  createRankingFixture,
} from "@/test/mocks/harness-fixtures";

vi.mock("@/hooks/use-locale", () => ({
  useLocale: () => ({
    locale: "ko" as const,
    setLocale: vi.fn(),
    t: (key: string, params?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        "card.agents": `${params?.count ?? 0}명`,
      };
      return translations[key] ?? key;
    },
  }),
}));

describe("RankingList", () => {
  it("should_render_null_when_items_is_empty", () => {
    // Arrange & Act
    const { container } = render(<RankingList items={[]} />);

    // Assert
    expect(container.innerHTML).toBe("");
  });

  it("should_render_all_items", () => {
    // Arrange
    const items = [
      createHarnessMeta({ id: 1, name: "First", popularityRank: 1 }),
      createHarnessMeta({ id: 2, name: "Second", popularityRank: 2 }),
      createHarnessMeta({ id: 3, name: "Third", popularityRank: 3 }),
    ];

    // Act
    render(<RankingList items={items} />);

    // Assert
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
    expect(screen.getByText("Third")).toBeInTheDocument();
  });

  it("should_display_popularity_rank_number", () => {
    // Arrange
    const items = [
      createHarnessMeta({ id: 5, name: "Ranked", popularityRank: 7 }),
    ];

    // Act
    render(<RankingList items={items} />);

    // Assert
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("should_display_description", () => {
    // Arrange
    const items = [
      createHarnessMeta({
        id: 1,
        name: "Test",
        description: "A test description",
        popularityRank: 1,
      }),
    ];

    // Act
    render(<RankingList items={items} />);

    // Assert
    expect(screen.getByText("A test description")).toBeInTheDocument();
  });

  it("should_display_agent_count", () => {
    // Arrange
    const items = [
      createHarnessMeta({ id: 1, name: "Test", agentCount: 5, popularityRank: 1 }),
    ];

    // Act
    render(<RankingList items={items} />);

    // Assert
    expect(screen.getByText("5명")).toBeInTheDocument();
  });

  it("should_link_to_correct_harness_detail_page_with_padded_id", () => {
    // Arrange
    const items = [
      createHarnessMeta({ id: 3, name: "Test", popularityRank: 1 }),
    ];

    // Act
    render(<RankingList items={items} />);

    // Assert
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/harness/03");
  });

  it("should_display_category_badge_for_known_category", () => {
    // Arrange
    const items = [
      createHarnessMeta({
        id: 1,
        name: "Dev Tool",
        category: "development",
        popularityRank: 1,
      }),
    ];

    // Act
    render(<RankingList items={items} />);

    // Assert - Korean locale shows "개발" for development
    expect(screen.getByText("개발")).toBeInTheDocument();
  });

  it("should_render_many_items", () => {
    // Arrange
    const items = createRankingFixture().slice(0, 10);

    // Act
    render(<RankingList items={items} />);

    // Assert
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(10);
  });
});
