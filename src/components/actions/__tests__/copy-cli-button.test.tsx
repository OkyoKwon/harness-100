import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CopyCliButton } from "../copy-cli-button";

vi.mock("@/hooks/use-locale", () => ({
  useLocale: () => ({
    locale: "ko" as const,
    setLocale: vi.fn(),
    t: (key: string) => {
      const translations: Record<string, string> = {
        "action.copy": "복사",
        "action.copied": "복사됨 ✓",
      };
      return translations[key] ?? key;
    },
  }),
}));

describe("CopyCliButton", () => {
  it("renders copy text initially", () => {
    render(<CopyCliButton text="claude install" />);
    expect(screen.getByText("복사")).toBeInTheDocument();
  });

  it("shows copied state after successful copy", async () => {
    const user = userEvent.setup();
    render(<CopyCliButton text="claude install" />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("복사됨 ✓")).toBeInTheDocument();
    });
  });

  it("renders as a button element with type=button", () => {
    render(<CopyCliButton text="test" />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "button");
  });

  it("applies correct CSS classes", () => {
    render(<CopyCliButton text="test" />);
    const button = screen.getByRole("button");
    expect(button.className).toContain("inline-flex");
    expect(button.className).toContain("items-center");
  });

  it("renders different text prop", () => {
    render(<CopyCliButton text="different command" />);
    // Component should still show "복사" regardless of text prop
    expect(screen.getByText("복사")).toBeInTheDocument();
  });
});
