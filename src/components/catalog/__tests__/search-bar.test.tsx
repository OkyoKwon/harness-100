import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBar } from "../search-bar";

vi.mock("@/hooks/use-locale", () => ({
  useLocale: () => ({
    locale: "ko" as const,
    setLocale: vi.fn(),
    t: (key: string) => key,
  }),
}));

describe("SearchBar", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it("should_render_input_with_placeholder", () => {
    // Arrange & Act
    render(<SearchBar onSearch={vi.fn()} />);

    // Assert
    expect(
      screen.getByPlaceholderText("search.placeholder"),
    ).toBeInTheDocument();
  });

  it("should_render_text_input", () => {
    // Arrange & Act
    render(<SearchBar onSearch={vi.fn()} />);

    // Assert
    const input = screen.getByPlaceholderText("search.placeholder");
    expect(input).toHaveAttribute("type", "text");
  });

  it("should_call_onSearch_after_debounce_delay", async () => {
    // Arrange
    const onSearch = vi.fn();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<SearchBar onSearch={onSearch} />);

    // Act
    const input = screen.getByPlaceholderText("search.placeholder");
    await user.type(input, "test");

    // Wait for debounce (300ms)
    vi.advanceTimersByTime(300);

    // Assert
    expect(onSearch).toHaveBeenCalledWith("test");
  });

  it("should_not_call_onSearch_before_debounce_completes", async () => {
    // Arrange
    const onSearch = vi.fn();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<SearchBar onSearch={onSearch} />);

    // Act
    const input = screen.getByPlaceholderText("search.placeholder");
    await user.type(input, "t");
    vi.advanceTimersByTime(100);

    // Assert
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("should_render_keyboard_shortcut_hint", () => {
    // Arrange & Act
    render(<SearchBar onSearch={vi.fn()} />);

    // Assert
    expect(screen.getByText("/")).toBeInTheDocument();
  });

  afterEach(() => {
    vi.useRealTimers();
  });
});
