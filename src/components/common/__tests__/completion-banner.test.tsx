import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CompletionBanner } from "../completion-banner";

vi.mock("@/hooks/use-locale", () => ({
  useLocale: () => ({
    locale: "ko" as const,
    setLocale: vi.fn(),
    t: (key: string, params?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        "a11y.close": "Close",
        "completion.setupDone": `Setup done at ${params?.path ?? ""}`,
        "completion.zipDone": `Zip created for ${params?.slug ?? ""}`,
        "completion.unzipHint": "Unzip and run",
        "completion.tipText": "Tip text",
        "completion.filesCreated": `${params?.count ?? 0} files created`,
        "completion.breakdown": `w:${params?.written ?? 0} m:${params?.merged ?? 0} s:${params?.skipped ?? 0}`,
      };
      return translations[key] ?? key;
    },
  }),
}));

vi.mock("@/lib/cli", () => ({
  buildCliCommand: (slug: string) => `claude "/${slug}"`,
}));

vi.mock("@/components/actions/copy-cli-button", () => ({
  CopyCliButton: ({ text }: { text: string }) => (
    <button data-testid="copy-btn">{text}</button>
  ),
}));

describe("CompletionBanner", () => {
  it("should_render_setup_message_when_type_is_setup", () => {
    // Arrange & Act
    render(
      <CompletionBanner
        type="setup"
        path="/my/project"
        slug="test-harness"
      />,
    );

    // Assert
    expect(screen.getByText("Setup done at /my/project")).toBeInTheDocument();
  });

  it("should_render_zip_message_when_type_is_zip", () => {
    // Arrange & Act
    render(<CompletionBanner type="zip" slug="test-harness" />);

    // Assert
    expect(
      screen.getByText("Zip created for test-harness"),
    ).toBeInTheDocument();
    expect(screen.getByText("Unzip and run")).toBeInTheDocument();
  });

  it("should_render_files_created_count_when_provided", () => {
    // Arrange & Act
    render(
      <CompletionBanner
        type="setup"
        path="/project"
        slug="test-harness"
        filesWritten={5}
      />,
    );

    // Assert
    expect(screen.getByText("5 files created")).toBeInTheDocument();
  });

  it("should_render_breakdown_when_merged_or_skipped_present", () => {
    // Arrange & Act
    render(
      <CompletionBanner
        type="setup"
        path="/project"
        slug="test-harness"
        filesWritten={3}
        filesMerged={2}
        filesSkipped={1}
      />,
    );

    // Assert
    expect(screen.getByText("w:3 m:2 s:1")).toBeInTheDocument();
  });

  it("should_render_cli_command_for_setup_type", () => {
    // Arrange & Act
    render(
      <CompletionBanner
        type="setup"
        path="/project"
        slug="test-harness"
      />,
    );

    // Assert
    const code = screen.getAllByText(
      'cd /project && claude "/test-harness"',
    );
    expect(code.length).toBeGreaterThanOrEqual(1);
  });

  it("should_render_unzip_command_for_zip_type", () => {
    // Arrange & Act
    render(<CompletionBanner type="zip" slug="test-harness" />);

    // Assert
    const code = screen.getAllByText(
      'unzip test-harness.zip && claude "/test-harness"',
    );
    expect(code.length).toBeGreaterThanOrEqual(1);
  });

  it("should_dismiss_banner_when_close_button_clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <CompletionBanner
        type="setup"
        path="/project"
        slug="test-harness"
      />,
    );
    expect(screen.getByText("Setup done at /project")).toBeInTheDocument();

    // Act
    await user.click(screen.getByLabelText("Close"));

    // Assert
    expect(
      screen.queryByText("Setup done at /project"),
    ).not.toBeInTheDocument();
  });

  it("should_render_tip_text", () => {
    // Arrange & Act
    render(
      <CompletionBanner type="setup" path="/project" slug="test-harness" />,
    );

    // Assert
    expect(screen.getByText("Tip text")).toBeInTheDocument();
  });
});
