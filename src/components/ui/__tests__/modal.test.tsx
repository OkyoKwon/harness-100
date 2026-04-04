import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal, ModalBody } from "../modal";

describe("Modal", () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    title: "Test Modal",
    children: <div>Modal content</div>,
  };

  afterEach(() => {
    document.body.style.overflow = "";
  });

  it("renders null when open is false", () => {
    // Arrange & Act
    const { container } = render(
      <Modal open={false} onClose={vi.fn()} title="Hidden">
        Hidden
      </Modal>,
    );

    // Assert
    expect(container.innerHTML).toBe("");
  });

  it("renders dialog when open is true", () => {
    // Arrange & Act
    render(<Modal {...defaultProps} />);

    // Assert
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("has aria-modal attribute", () => {
    // Arrange & Act
    render(<Modal {...defaultProps} />);

    // Assert
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("has aria-labelledby pointing to title", () => {
    // Arrange & Act
    render(<Modal {...defaultProps} />);

    // Assert
    const dialog = screen.getByRole("dialog");
    const titleId = dialog.getAttribute("aria-labelledby");
    expect(titleId).toBeTruthy();
    expect(screen.getByText("Test Modal").id).toBe(titleId);
  });

  it("renders title text", () => {
    // Arrange & Act
    render(<Modal {...defaultProps} />);

    // Assert
    expect(screen.getByText("Test Modal")).toBeInTheDocument();
  });

  it("renders children content", () => {
    // Arrange & Act
    render(<Modal {...defaultProps} />);

    // Assert
    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  it("calls onClose when Escape key is pressed", async () => {
    // Arrange
    const handleClose = vi.fn();
    const user = userEvent.setup();
    render(<Modal {...defaultProps} onClose={handleClose} />);

    // Act
    await user.keyboard("{Escape}");

    // Assert
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("sets body overflow to hidden when open", () => {
    // Arrange & Act
    render(<Modal {...defaultProps} />);

    // Assert
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("applies custom className", () => {
    // Arrange & Act
    render(<Modal {...defaultProps} className="custom-modal" />);

    // Assert
    expect(screen.getByRole("dialog").className).toContain("custom-modal");
  });

  it("calls onClose when clicking on overlay backdrop", async () => {
    // Arrange
    const handleClose = vi.fn();
    const user = userEvent.setup();
    render(<Modal {...defaultProps} onClose={handleClose} />);

    // Act - click directly on the overlay (the fixed backdrop element)
    const overlay = screen.getByRole("dialog").parentElement!;
    await user.click(overlay);

    // Assert
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when clicking inside dialog content", async () => {
    // Arrange
    const handleClose = vi.fn();
    const user = userEvent.setup();
    render(<Modal {...defaultProps} onClose={handleClose} />);

    // Act - click inside the dialog
    await user.click(screen.getByText("Modal content"));

    // Assert
    expect(handleClose).not.toHaveBeenCalled();
  });

  it("traps focus with Tab key — wraps from last to first focusable", () => {
    // Arrange
    const handleClose = vi.fn();
    render(
      <Modal open={true} onClose={handleClose} title="Focus Trap">
        <button>First</button>
        <button>Last</button>
      </Modal>,
    );

    // Act - focus the last button, then dispatch Tab keydown
    const lastButton = screen.getByText("Last");
    lastButton.focus();
    const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true });
    document.dispatchEvent(event);

    // Assert - focus should wrap to the first focusable element
    const firstButton = screen.getByText("First");
    expect(document.activeElement).toBe(firstButton);
  });

  it("traps focus with Shift+Tab — wraps from first to last focusable", () => {
    // Arrange
    const handleClose = vi.fn();
    render(
      <Modal open={true} onClose={handleClose} title="Focus Trap">
        <button>First</button>
        <button>Last</button>
      </Modal>,
    );

    // Act - focus the first button, then dispatch Shift+Tab keydown
    const firstButton = screen.getByText("First");
    firstButton.focus();
    const event = new KeyboardEvent("keydown", {
      key: "Tab",
      shiftKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);

    // Assert
    const lastButton = screen.getByText("Last");
    expect(document.activeElement).toBe(lastButton);
  });

  it("restores body overflow when unmounted", () => {
    // Arrange
    const { unmount } = render(<Modal {...defaultProps} />);
    expect(document.body.style.overflow).toBe("hidden");

    // Act
    unmount();

    // Assert
    expect(document.body.style.overflow).toBe("");
  });

  it("renders without title when title is not provided", () => {
    // Arrange & Act
    render(
      <Modal open={true} onClose={vi.fn()}>
        <div>No title modal</div>
      </Modal>,
    );

    // Assert
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("No title modal")).toBeInTheDocument();
  });

  it("uses custom ariaLabelledBy when provided", () => {
    // Arrange & Act
    render(
      <Modal open={true} onClose={vi.fn()} ariaLabelledBy="custom-label-id">
        <div>Content</div>
      </Modal>,
    );

    // Assert
    expect(screen.getByRole("dialog")).toHaveAttribute(
      "aria-labelledby",
      "custom-label-id",
    );
  });
});

describe("ModalBody", () => {
  it("renders children", () => {
    // Arrange & Act
    render(<ModalBody>Body content</ModalBody>);

    // Assert
    expect(screen.getByText("Body content")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    // Arrange & Act
    render(<ModalBody className="custom-body">Content</ModalBody>);

    // Assert
    expect(screen.getByText("Content").className).toContain("custom-body");
  });
});
