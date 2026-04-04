import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../button";

describe("Button", () => {
  it("renders children text", () => {
    // Arrange & Act
    render(<Button>Click me</Button>);

    // Assert
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("applies primary variant by default", () => {
    // Arrange & Act
    render(<Button>Primary</Button>);

    // Assert
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-[var(--button-primary-bg)]");
  });

  it("applies outline variant classes", () => {
    // Arrange & Act
    render(<Button variant="outline">Outline</Button>);

    // Assert
    const button = screen.getByRole("button");
    expect(button.className).toContain("border");
  });

  it("applies ghost variant classes", () => {
    // Arrange & Act
    render(<Button variant="ghost">Ghost</Button>);

    // Assert
    const button = screen.getByRole("button");
    expect(button.className).toContain("text-[var(--button-ghost-fg)]");
  });

  it("applies sm size classes", () => {
    // Arrange & Act
    render(<Button size="sm">Small</Button>);

    // Assert
    const button = screen.getByRole("button");
    expect(button.className).toContain("px-3 py-1 text-xs");
  });

  it("applies md size classes by default", () => {
    // Arrange & Act
    render(<Button>Medium</Button>);

    // Assert
    const button = screen.getByRole("button");
    expect(button.className).toContain("px-4 py-2 text-sm");
  });

  it("applies lg size classes", () => {
    // Arrange & Act
    render(<Button size="lg">Large</Button>);

    // Assert
    const button = screen.getByRole("button");
    expect(button.className).toContain("px-5 py-2.5 text-base");
  });

  it("renders disabled state", () => {
    // Arrange & Act
    render(<Button disabled>Disabled</Button>);

    // Assert
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("disables button when loading", () => {
    // Arrange & Act
    render(<Button loading>Loading</Button>);

    // Assert
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows spinner when loading", () => {
    // Arrange & Act
    render(<Button loading>Loading</Button>);

    // Assert
    const button = screen.getByRole("button");
    expect(button.querySelector(".animate-spin")).not.toBeNull();
  });

  it("calls onClick when clicked", async () => {
    // Arrange
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Click</Button>);

    // Act
    await user.click(screen.getByRole("button"));

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies custom className", () => {
    // Arrange & Act
    render(<Button className="custom-class">Custom</Button>);

    // Assert
    expect(screen.getByRole("button").className).toContain("custom-class");
  });

  it("has type=button by default", () => {
    // Arrange & Act
    render(<Button>Test</Button>);

    // Assert
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });
});
