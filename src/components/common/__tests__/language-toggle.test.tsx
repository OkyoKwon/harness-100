import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageToggle } from "../language-toggle";

const mockSetLocale = vi.fn();

vi.mock("@/hooks/use-locale", () => ({
  useLocale: () => ({
    locale: "ko" as const,
    setLocale: mockSetLocale,
    t: (key: string) => key,
  }),
}));

describe("LanguageToggle", () => {
  it("should_show_한_text_when_locale_is_ko", () => {
    // Arrange & Act
    render(<LanguageToggle />);

    // Assert — button shows current language, not target
    expect(screen.getByText("한")).toBeInTheDocument();
  });

  it("should_have_correct_aria_label_when_locale_is_ko", () => {
    // Arrange & Act
    render(<LanguageToggle />);

    // Assert
    expect(screen.getByLabelText("Switch to English")).toBeInTheDocument();
  });

  it("should_call_setLocale_with_en_when_clicked_in_ko_mode", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<LanguageToggle />);

    // Act
    await user.click(screen.getByLabelText("Switch to English"));

    // Assert
    expect(mockSetLocale).toHaveBeenCalledWith("en");
  });

  it("should_render_button_element", () => {
    // Arrange & Act
    render(<LanguageToggle />);

    // Assert
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
