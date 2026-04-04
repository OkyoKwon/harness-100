import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider } from "../toast-provider";
import { useToast } from "@/hooks/use-toast";

vi.mock("@/hooks/use-locale", () => ({
  useLocale: () => ({
    locale: "ko" as const,
    setLocale: vi.fn(),
    t: (key: string) => key,
  }),
}));

function TestConsumer() {
  const { addToast } = useToast();
  return (
    <button onClick={() => addToast("Test toast", "success")}>
      Add Toast
    </button>
  );
}

describe("ToastProvider", () => {
  it("should_render_children_when_mounted", () => {
    // Arrange & Act
    render(
      <ToastProvider>
        <div>Child content</div>
      </ToastProvider>,
    );

    // Assert
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("should_show_toast_when_addToast_is_called", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );

    // Act
    await user.click(screen.getByText("Add Toast"));

    // Assert
    expect(screen.getByText("Test toast")).toBeInTheDocument();
  });

  it("should_dismiss_toast_when_close_button_clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );
    await user.click(screen.getByText("Add Toast"));
    expect(screen.getByText("Test toast")).toBeInTheDocument();

    // Act
    await user.click(screen.getByLabelText("a11y.close"));

    // Assert
    expect(screen.queryByText("Test toast")).not.toBeInTheDocument();
  });

  it("should_not_show_toast_container_when_no_toasts", () => {
    // Arrange & Act
    const { container } = render(
      <ToastProvider>
        <div>Child</div>
      </ToastProvider>,
    );

    // Assert - no toast container should be rendered
    expect(container.querySelector("[role='status']")).not.toBeInTheDocument();
  });
});
