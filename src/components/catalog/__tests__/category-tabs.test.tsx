import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategoryTabs } from "../category-tabs";

// Mock ResizeObserver for jsdom
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
});

vi.mock("@/hooks/use-locale", () => ({
  useLocale: () => ({
    locale: "ko" as const,
    setLocale: vi.fn(),
    t: (key: string) => {
      const translations: Record<string, string> = {
        "category.all": "전체",
        "category.favorites": "즐겨찾기",
        "a11y.prevCategory": "이전 카테고리",
        "a11y.nextCategory": "다음 카테고리",
      };
      return translations[key] ?? key;
    },
  }),
}));

describe("CategoryTabs", () => {
  const defaultProps = {
    active: "all",
    onSelect: vi.fn(),
    favoriteCount: 0,
  };

  it("should_render_all_tab_with_total_count", () => {
    // Arrange & Act
    render(<CategoryTabs {...defaultProps} />);

    // Assert
    expect(screen.getByText(/전체/)).toBeInTheDocument();
  });

  it("should_render_favorites_tab", () => {
    // Arrange & Act
    render(<CategoryTabs {...defaultProps} />);

    // Assert
    expect(screen.getByText(/즐겨찾기/)).toBeInTheDocument();
  });

  it("should_show_favorite_count_when_greater_than_zero", () => {
    // Arrange & Act
    render(<CategoryTabs {...defaultProps} favoriteCount={5} />);

    // Assert
    expect(screen.getByText(/즐겨찾기.*5/)).toBeInTheDocument();
  });

  it("should_render_all_category_buttons", () => {
    // Arrange & Act
    render(<CategoryTabs {...defaultProps} />);

    // Assert - check some Korean category labels
    expect(screen.getByText(/콘텐츠/)).toBeInTheDocument();
    expect(screen.getByText(/개발/)).toBeInTheDocument();
    expect(screen.getByText(/데이터/)).toBeInTheDocument();
    expect(screen.getByText(/비즈니스/)).toBeInTheDocument();
  });

  it("should_call_onSelect_with_all_when_all_tab_clicked", async () => {
    // Arrange
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<CategoryTabs {...defaultProps} onSelect={onSelect} active="favorites" />);

    // Act
    await user.click(screen.getByText(/전체/));

    // Assert
    expect(onSelect).toHaveBeenCalledWith("all");
  });

  it("should_call_onSelect_with_favorites_when_favorites_tab_clicked", async () => {
    // Arrange
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<CategoryTabs {...defaultProps} onSelect={onSelect} />);

    // Act
    await user.click(screen.getByText(/즐겨찾기/));

    // Assert
    expect(onSelect).toHaveBeenCalledWith("favorites");
  });

  it("should_call_onSelect_with_category_slug_when_category_clicked", async () => {
    // Arrange
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<CategoryTabs {...defaultProps} onSelect={onSelect} />);

    // Act
    await user.click(screen.getByText(/콘텐츠/));

    // Assert
    expect(onSelect).toHaveBeenCalledWith("content");
  });

  it("should_render_category_count_next_to_label", () => {
    // Arrange & Act
    render(<CategoryTabs {...defaultProps} />);

    // Assert - "콘텐츠 15"
    expect(screen.getByText(/콘텐츠.*15/)).toBeInTheDocument();
  });
});
