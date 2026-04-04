import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "../input";

describe("Input", () => {
  it("renders an input element", () => {
    // Arrange & Act
    render(<Input placeholder="Search..." />);

    // Assert
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    // Arrange & Act
    render(<Input className="custom-input" placeholder="test" />);

    // Assert
    expect(screen.getByPlaceholderText("test").className).toContain("custom-input");
  });

  it("renders icon when provided", () => {
    // Arrange & Act
    render(<Input icon={<span data-testid="icon">🔍</span>} placeholder="Search" />);

    // Assert
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("accepts user input", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);

    // Act
    const input = screen.getByPlaceholderText("Type here");
    await user.type(input, "hello");

    // Assert
    expect(input).toHaveValue("hello");
  });

  it("forwards ref", () => {
    // Arrange
    const ref = { current: null } as React.RefObject<HTMLInputElement | null>;

    // Act
    render(<Input ref={ref} placeholder="ref test" />);

    // Assert
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("calls onChange when typing", async () => {
    // Arrange
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Input onChange={handleChange} placeholder="test" />);

    // Act
    await user.type(screen.getByPlaceholderText("test"), "a");

    // Assert
    expect(handleChange).toHaveBeenCalled();
  });
});
