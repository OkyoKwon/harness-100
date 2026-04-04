import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "../header";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

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
    toggle: vi.fn(),
    theme: "system",
    setTheme: vi.fn(),
  }),
}));

describe("Header", () => {
  it("should_render_logo_link_when_mounted", () => {
    // Arrange & Act
    render(<Header />);

    // Assert
    const logo = screen.getByText("Harness 100");
    expect(logo).toBeInTheDocument();
    expect(logo.closest("a")).toHaveAttribute("href", "/");
  });

  it("should_render_skip_to_content_link_for_accessibility", () => {
    // Arrange & Act
    render(<Header />);

    // Assert
    expect(screen.getByText("a11y.skipToContent")).toBeInTheDocument();
  });

  it("should_render_desktop_navigation_links", () => {
    // Arrange & Act
    render(<Header />);

    // Assert
    const rankingLink = screen.getByText("nav.ranking");
    expect(rankingLink.closest("a")).toHaveAttribute("href", "/ranking");

    const composerLink = screen.getByText("nav.composer");
    expect(composerLink.closest("a")).toHaveAttribute("href", "/composer");

    const guideLink = screen.getByText("nav.guide");
    expect(guideLink.closest("a")).toHaveAttribute("href", "/guide");
  });

  it("should_render_header_element", () => {
    // Arrange & Act
    const { container } = render(<Header />);

    // Assert
    expect(container.querySelector("header")).toBeInTheDocument();
  });
});
