import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SetupButton } from "../setup-button";

vi.mock("@/hooks/use-locale", () => ({
  useLocale: () => ({
    locale: "ko" as const,
    setLocale: vi.fn(),
    t: (key: string) => {
      const translations: Record<string, string> = {
        "action.setup": "세팅 →",
      };
      return translations[key] ?? key;
    },
  }),
}));

describe("SetupButton", () => {
  it("renders setup text", () => {
    // Arrange & Act
    render(<SetupButton onClick={vi.fn()} />);

    // Assert
    expect(screen.getByText("세팅 →")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    // Arrange
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<SetupButton onClick={handleClick} />);

    // Act
    await user.click(screen.getByRole("button"));

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders disabled state", () => {
    // Arrange & Act
    render(<SetupButton onClick={vi.fn()} disabled />);

    // Assert
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
