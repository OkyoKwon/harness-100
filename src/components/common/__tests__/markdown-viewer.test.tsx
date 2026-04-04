import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MarkdownViewer } from "../markdown-viewer";

vi.mock("@/hooks/use-locale", () => ({
  useLocale: () => ({
    locale: "ko" as const,
    setLocale: vi.fn(),
    t: (key: string) => key,
  }),
}));

vi.mock("react-markdown", () => ({
  default: ({ children }: any) => <div data-testid="markdown">{children}</div>,
}));

vi.mock("remark-gfm", () => ({
  default: () => {},
}));

describe("MarkdownViewer", () => {
  const defaultProps = {
    title: "Test Document",
    content: "# Hello World\n\nSome content here.",
    open: true,
    onClose: vi.fn(),
  };

  it("should_render_title_when_open", () => {
    // Arrange & Act
    render(<MarkdownViewer {...defaultProps} />);

    // Assert
    expect(screen.getByText("Test Document")).toBeInTheDocument();
  });

  it("should_render_markdown_content_when_open", () => {
    // Arrange & Act
    render(<MarkdownViewer {...defaultProps} />);

    // Assert
    expect(screen.getByTestId("markdown")).toHaveTextContent(
      /Hello World.*Some content here/,
    );
  });

  it("should_not_render_anything_when_closed", () => {
    // Arrange & Act
    render(<MarkdownViewer {...defaultProps} open={false} />);

    // Assert
    expect(screen.queryByText("Test Document")).not.toBeInTheDocument();
  });

  it("should_call_onClose_when_close_button_clicked", async () => {
    // Arrange
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<MarkdownViewer {...defaultProps} onClose={onClose} />);

    // Act
    await user.click(screen.getByLabelText("a11y.close"));

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should_render_frontmatter_table_when_content_has_frontmatter", () => {
    // Arrange
    const content = "---\ntitle: My Doc\nauthor: Test\n---\n\nBody text";

    // Act
    render(
      <MarkdownViewer {...defaultProps} content={content} />,
    );

    // Assert
    expect(screen.getByText("title")).toBeInTheDocument();
    expect(screen.getByText("My Doc")).toBeInTheDocument();
    expect(screen.getByText("author")).toBeInTheDocument();
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("should_render_array_frontmatter_values_as_comma_separated", () => {
    // Arrange
    const content = "---\ntags:\n  - react\n  - typescript\n---\n\nBody";

    // Act
    render(
      <MarkdownViewer {...defaultProps} content={content} />,
    );

    // Assert
    expect(screen.getByText("react, typescript")).toBeInTheDocument();
  });

  it("should_render_dialog_with_aria_labelledby", () => {
    // Arrange & Act
    render(<MarkdownViewer {...defaultProps} />);

    // Assert
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-labelledby", "md-viewer-title");
  });
});
