import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select } from "../select";

describe("Select", () => {
  it("renders options", () => {
    // Arrange & Act
    render(
      <Select>
        <option value="a">Option A</option>
        <option value="b">Option B</option>
      </Select>,
    );

    // Assert
    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("Option B")).toBeInTheDocument();
  });

  it("renders as a combobox", () => {
    // Arrange & Act
    render(
      <Select>
        <option value="a">A</option>
      </Select>,
    );

    // Assert
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("calls onChange when selection changes", async () => {
    // Arrange
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Select onChange={handleChange}>
        <option value="a">A</option>
        <option value="b">B</option>
      </Select>,
    );

    // Act
    await user.selectOptions(screen.getByRole("combobox"), "b");

    // Assert
    expect(handleChange).toHaveBeenCalled();
  });

  it("applies custom className", () => {
    // Arrange & Act
    render(
      <Select className="custom-select">
        <option value="a">A</option>
      </Select>,
    );

    // Assert
    expect(screen.getByRole("combobox").className).toContain("custom-select");
  });
});
