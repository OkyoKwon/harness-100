import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FavoriteToggle } from "../favorite-toggle";

vi.mock("@/hooks/use-locale", () => ({
  useLocale: () => ({
    locale: "ko" as const,
    setLocale: vi.fn(),
    t: (key: string) => {
      const translations: Record<string, string> = {
        "favorite.add": "즐겨찾기 추가",
        "favorite.remove": "즐겨찾기 해제",
      };
      return translations[key] ?? key;
    },
  }),
}));

describe("FavoriteToggle", () => {
  it("renders inactive state with empty star", () => {
    // Arrange & Act
    render(<FavoriteToggle active={false} onClick={vi.fn()} />);

    // Assert
    expect(screen.getByText("☆")).toBeInTheDocument();
  });

  it("renders active state with filled star", () => {
    // Arrange & Act
    render(<FavoriteToggle active={true} onClick={vi.fn()} />);

    // Assert
    expect(screen.getByText("★")).toBeInTheDocument();
  });

  it("has correct aria-label when inactive", () => {
    // Arrange & Act
    render(<FavoriteToggle active={false} onClick={vi.fn()} />);

    // Assert
    expect(screen.getByLabelText("즐겨찾기 추가")).toBeInTheDocument();
  });

  it("has correct aria-label when active", () => {
    // Arrange & Act
    render(<FavoriteToggle active={true} onClick={vi.fn()} />);

    // Assert
    expect(screen.getByLabelText("즐겨찾기 해제")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    // Arrange
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<FavoriteToggle active={false} onClick={handleClick} />);

    // Act
    await user.click(screen.getByRole("button"));

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
