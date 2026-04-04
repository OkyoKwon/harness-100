import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toast } from "../toast";
import type { ToastItem } from "@/hooks/use-toast";

vi.mock("@/hooks/use-locale", () => ({
  useLocale: () => ({
    locale: "ko" as const,
    setLocale: vi.fn(),
    t: (key: string) => key,
  }),
}));

describe("Toast", () => {
  const createItem = (overrides?: Partial<ToastItem>): ToastItem => ({
    id: 1,
    message: "Test message",
    type: "success",
    ...overrides,
  });

  it("should_render_message_when_given_success_toast", () => {
    // Arrange
    const item = createItem({ type: "success", message: "Saved!" });

    // Act
    render(<Toast item={item} onDismiss={vi.fn()} />);

    // Assert
    expect(screen.getByText("Saved!")).toBeInTheDocument();
  });

  it("should_render_check_icon_when_type_is_success", () => {
    // Arrange & Act
    render(<Toast item={createItem({ type: "success" })} onDismiss={vi.fn()} />);

    // Assert
    expect(screen.getByText("\u2713")).toBeInTheDocument();
  });

  it("should_render_cross_icon_when_type_is_error", () => {
    // Arrange & Act
    render(<Toast item={createItem({ type: "error" })} onDismiss={vi.fn()} />);

    // Assert
    // The icon span with X mark
    const container = screen.getByRole("status");
    expect(container.querySelector("span")).toHaveTextContent("\u2715");
  });

  it("should_render_info_icon_when_type_is_info", () => {
    // Arrange & Act
    render(<Toast item={createItem({ type: "info" })} onDismiss={vi.fn()} />);

    // Assert
    const container = screen.getByRole("status");
    expect(container.querySelector("span")).toHaveTextContent("\u2139");
  });

  it("should_call_onDismiss_when_close_button_clicked", async () => {
    // Arrange
    const onDismiss = vi.fn();
    const user = userEvent.setup();
    render(<Toast item={createItem()} onDismiss={onDismiss} />);

    // Act
    const closeButton = screen.getByLabelText("a11y.close");
    await user.click(closeButton);

    // Assert
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("should_have_status_role_and_polite_aria_live", () => {
    // Arrange & Act
    render(<Toast item={createItem()} onDismiss={vi.fn()} />);

    // Assert
    const toast = screen.getByRole("status");
    expect(toast).toHaveAttribute("aria-live", "polite");
  });
});
