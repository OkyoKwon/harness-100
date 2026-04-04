import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IconButton } from "../icon-button";

describe("IconButton", () => {
  it("renders with aria-label", () => {
    // Arrange & Act
    render(<IconButton ariaLabel="Close">X</IconButton>);

    // Assert
    expect(screen.getByLabelText("Close")).toBeInTheDocument();
  });

  it("renders children", () => {
    // Arrange & Act
    render(<IconButton ariaLabel="Menu">☰</IconButton>);

    // Assert
    expect(screen.getByText("☰")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    // Arrange
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(
      <IconButton ariaLabel="Action" onClick={handleClick}>
        +
      </IconButton>,
    );

    // Act
    await user.click(screen.getByRole("button"));

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("has type=button", () => {
    // Arrange & Act
    render(<IconButton ariaLabel="Test">T</IconButton>);

    // Assert
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("has minimum touch target size", () => {
    // Arrange & Act
    render(<IconButton ariaLabel="Touch">T</IconButton>);

    // Assert
    const button = screen.getByRole("button");
    expect(button.className).toContain("min-w-[44px]");
    expect(button.className).toContain("min-h-[44px]");
  });
});
