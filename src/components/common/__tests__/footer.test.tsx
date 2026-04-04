import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "../footer";

describe("Footer", () => {
  it("should_render_community_text_when_mounted", () => {
    // Arrange & Act
    render(<Footer />);

    // Assert
    expect(screen.getByText("Curated by the community")).toBeInTheDocument();
  });

  it("should_render_github_link_with_correct_href", () => {
    // Arrange & Act
    render(<Footer />);

    // Assert
    const link = screen.getByLabelText("GitHub Repository");
    expect(link).toHaveAttribute(
      "href",
      "https://github.com/OkyoKwon/harness-100",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("should_render_footer_element", () => {
    // Arrange & Act
    const { container } = render(<Footer />);

    // Assert
    expect(container.querySelector("footer")).toBeInTheDocument();
  });
});
