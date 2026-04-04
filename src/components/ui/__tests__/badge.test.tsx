import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "../badge";

describe("Badge", () => {
  it("renders children text", () => {
    // Arrange & Act
    render(<Badge>Default</Badge>);

    // Assert
    expect(screen.getByText("Default")).toBeInTheDocument();
  });

  it("applies default variant classes", () => {
    // Arrange & Act
    render(<Badge>Default</Badge>);

    // Assert
    expect(screen.getByText("Default").className).toContain("bg-[var(--badge-default-bg)]");
  });

  it("applies tool variant classes", () => {
    // Arrange & Act
    render(<Badge variant="tool">Tool</Badge>);

    // Assert
    expect(screen.getByText("Tool").className).toContain("bg-[var(--badge-tool-bg)]");
  });

  it("applies framework variant classes", () => {
    // Arrange & Act
    render(<Badge variant="framework">Framework</Badge>);

    // Assert
    expect(screen.getByText("Framework").className).toContain("bg-[var(--badge-framework-bg)]");
  });

  it("applies category variant with inline color style", () => {
    // Arrange & Act
    render(
      <Badge variant="category" color="#ff0000">
        Category
      </Badge>,
    );

    // Assert
    const badge = screen.getByText("Category");
    expect(badge).toHaveStyle({ backgroundColor: "#ff000015", color: "#ff0000" });
  });

  it("applies custom className", () => {
    // Arrange & Act
    render(<Badge className="extra-class">Custom</Badge>);

    // Assert
    expect(screen.getByText("Custom").className).toContain("extra-class");
  });
});
