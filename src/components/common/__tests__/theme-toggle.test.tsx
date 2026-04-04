import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "../theme-toggle";

const mockToggle = vi.fn();

vi.mock("@/hooks/use-locale", () => ({
  useLocale: () => ({
    locale: "ko" as const,
    setLocale: vi.fn(),
    t: (key: string) => key,
  }),
}));

vi.mock("@/hooks/use-theme", () => ({
  useTheme: () => ({
    effective: "light" as const,
    toggle: mockToggle,
    theme: "system",
    setTheme: vi.fn(),
  }),
}));

describe("ThemeToggle", () => {
  it("should_show_dark_mode_label_when_theme_is_light", () => {
    // Arrange & Act
    render(<ThemeToggle />);

    // Assert
    expect(screen.getByLabelText("a11y.darkMode")).toBeInTheDocument();
  });

  it("should_call_toggle_when_clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ThemeToggle />);

    // Act
    await user.click(screen.getByLabelText("a11y.darkMode"));

    // Assert
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it("should_render_button_element", () => {
    // Arrange & Act
    render(<ThemeToggle />);

    // Assert
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
