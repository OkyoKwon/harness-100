import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QuickPreview } from "../quick-preview";
import { createHarness, createAgent } from "@/test/mocks/harness-fixtures";
import type { Harness } from "@/lib/types";
import { createRef } from "react";

const mockHarness = createHarness({
  id: 16,
  slug: "fullstack-web-app",
  name: "Fullstack Web App",
  description: "Full stack web application development harness",
  agents: [
    createAgent({ id: "agent-1", name: "Planner" }),
    createAgent({ id: "agent-2", name: "Coder" }),
  ],
  frameworks: ["Next.js", "TypeScript"],
});

let mockLoadResult: Promise<Harness | null> = Promise.resolve(mockHarness);

vi.mock("@/lib/harness-loader", () => ({
  loadHarnessDetail: () => mockLoadResult,
}));

vi.mock("@/hooks/use-locale", () => ({
  useLocale: () => ({
    locale: "ko" as const,
    setLocale: vi.fn(),
    t: (key: string, params?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        "preview.loading": "Loading...",
        "preview.error": "Error loading preview",
        "detail.agents": `Agents: ${params?.count ?? 0}`,
      };
      return translations[key] ?? key;
    },
  }),
}));

describe("QuickPreview", () => {
  const anchorRef = createRef<HTMLElement>();

  beforeEach(() => {
    mockLoadResult = Promise.resolve(mockHarness);
  });

  it("should_show_loading_state_initially", () => {
    // Arrange - make the promise never resolve during this test
    mockLoadResult = new Promise(() => {});

    // Act
    render(
      <QuickPreview harnessId={16} anchorRef={anchorRef} onClose={vi.fn()} />,
    );

    // Assert
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should_show_harness_description_after_loading", async () => {
    // Arrange & Act
    render(
      <QuickPreview harnessId={16} anchorRef={anchorRef} onClose={vi.fn()} />,
    );

    // Assert
    await waitFor(() => {
      expect(
        screen.getByText("Full stack web application development harness"),
      ).toBeInTheDocument();
    });
  });

  it("should_show_agent_names_after_loading", async () => {
    // Arrange & Act
    render(
      <QuickPreview harnessId={16} anchorRef={anchorRef} onClose={vi.fn()} />,
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Planner")).toBeInTheDocument();
      expect(screen.getByText("Coder")).toBeInTheDocument();
    });
  });

  it("should_show_frameworks_after_loading", async () => {
    // Arrange & Act
    render(
      <QuickPreview harnessId={16} anchorRef={anchorRef} onClose={vi.fn()} />,
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Next.js")).toBeInTheDocument();
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
    });
  });

  it("should_show_error_message_when_load_fails", async () => {
    // Arrange
    mockLoadResult = Promise.reject(new Error("Network error"));

    // Act
    render(
      <QuickPreview harnessId={99} anchorRef={anchorRef} onClose={vi.fn()} />,
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Error loading preview")).toBeInTheDocument();
    });
  });

  it("should_show_agent_count_label", async () => {
    // Arrange & Act
    render(
      <QuickPreview harnessId={16} anchorRef={anchorRef} onClose={vi.fn()} />,
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Agents: 2")).toBeInTheDocument();
    });
  });
});
