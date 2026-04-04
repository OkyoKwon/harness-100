import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroSection } from "../hero-section";

vi.mock("@/hooks/use-locale", () => ({
  useLocale: () => ({
    locale: "ko" as const,
    setLocale: vi.fn(),
    t: (key: string) => key,
  }),
}));

describe("HeroSection", () => {
  it("should_render_title_when_mounted", () => {
    // Arrange & Act
    render(<HeroSection />);

    // Assert
    expect(screen.getByText("hero.title")).toBeInTheDocument();
  });

  it("should_render_subtitle_when_mounted", () => {
    // Arrange & Act
    render(<HeroSection />);

    // Assert
    expect(screen.getByText("hero.subtitle")).toBeInTheDocument();
  });

  it("should_render_github_link_with_correct_href", () => {
    // Arrange & Act
    render(<HeroSection />);

    // Assert
    const link = screen.getByText("revfactory/harness-100");
    expect(link).toHaveAttribute(
      "href",
      "https://github.com/revfactory/harness-100",
    );
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("should_render_h1_element", () => {
    // Arrange & Act
    render(<HeroSection />);

    // Assert
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});
