import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HarnessGrid } from "../harness-grid";

describe("HarnessGrid", () => {
  it("should_render_children_when_given", () => {
    // Arrange & Act
    render(
      <HarnessGrid>
        <div>Card 1</div>
        <div>Card 2</div>
        <div>Card 3</div>
      </HarnessGrid>,
    );

    // Assert
    expect(screen.getByText("Card 1")).toBeInTheDocument();
    expect(screen.getByText("Card 2")).toBeInTheDocument();
    expect(screen.getByText("Card 3")).toBeInTheDocument();
  });

  it("should_render_grid_container_with_correct_classes", () => {
    // Arrange & Act
    const { container } = render(
      <HarnessGrid>
        <div>Item</div>
      </HarnessGrid>,
    );

    // Assert
    const grid = container.firstElementChild;
    expect(grid).toHaveClass("grid");
  });

  it("should_render_empty_grid_when_no_children", () => {
    // Arrange & Act
    const { container } = render(
      <HarnessGrid>{null}</HarnessGrid>,
    );

    // Assert
    expect(container.firstElementChild).toBeInTheDocument();
  });
});
