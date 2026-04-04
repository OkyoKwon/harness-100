import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileMenu } from "../mobile-menu";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
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

describe("MobileMenu", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
  });

  it("should_render_hamburger_button_when_closed", () => {
    // Arrange & Act
    render(<MobileMenu />);

    // Assert
    const button = screen.getByLabelText("nav.menu");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("should_open_menu_when_hamburger_clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<MobileMenu />);

    // Act
    await user.click(screen.getByLabelText("nav.menu"));

    // Assert
    expect(screen.getByLabelText("nav.closeMenu")).toBeInTheDocument();
    expect(screen.getByLabelText("nav.closeMenu")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("should_render_nav_links_when_open", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<MobileMenu />);

    // Act
    await user.click(screen.getByLabelText("nav.menu"));

    // Assert
    expect(screen.getByText("nav.ranking")).toBeInTheDocument();
    expect(screen.getByText("nav.composer")).toBeInTheDocument();
    expect(screen.getByText("nav.guide")).toBeInTheDocument();
  });

  it("should_have_correct_hrefs_on_nav_links", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<MobileMenu />);
    await user.click(screen.getByLabelText("nav.menu"));

    // Assert
    const rankingLink = screen.getByText("nav.ranking").closest("a");
    expect(rankingLink).toHaveAttribute("href", "/ranking");

    const composerLink = screen.getByText("nav.composer").closest("a");
    expect(composerLink).toHaveAttribute("href", "/composer");

    const guideLink = screen.getByText("nav.guide").closest("a");
    expect(guideLink).toHaveAttribute("href", "/guide");
  });

  it("should_close_menu_when_close_button_clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<MobileMenu />);
    await user.click(screen.getByLabelText("nav.menu"));

    // Act
    await user.click(screen.getByLabelText("nav.closeMenu"));

    // Assert
    expect(screen.getByLabelText("nav.menu")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("should_close_menu_when_escape_pressed", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<MobileMenu />);
    await user.click(screen.getByLabelText("nav.menu"));

    // Act
    await user.keyboard("{Escape}");

    // Assert
    expect(screen.getByLabelText("nav.menu")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("should_set_aria_controls_to_mobile_nav", () => {
    // Arrange & Act
    render(<MobileMenu />);

    // Assert
    const button = screen.getByLabelText("nav.menu");
    expect(button).toHaveAttribute("aria-controls", "mobile-nav");
  });

  it("should_render_mobile_nav_with_correct_id_when_open", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<MobileMenu />);
    await user.click(screen.getByLabelText("nav.menu"));

    // Assert
    expect(document.getElementById("mobile-nav")).toBeInTheDocument();
  });
});
