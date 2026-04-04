import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ZipButton } from "../zip-button";

describe("ZipButton", () => {
  it("renders ZIP text", () => {
    // Arrange & Act
    render(<ZipButton onClick={vi.fn()} />);

    // Assert
    expect(screen.getByText("ZIP ↓")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    // Arrange
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<ZipButton onClick={handleClick} />);

    // Act
    await user.click(screen.getByRole("button"));

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders disabled state", () => {
    // Arrange & Act
    render(<ZipButton onClick={vi.fn()} disabled />);

    // Assert
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
