import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HarnessCard } from "../harness-card";
import { createHarnessMeta } from "@/test/mocks/harness-fixtures";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, back: vi.fn(), forward: vi.fn() }),
}));

// Mock useLocale
vi.mock("@/hooks/use-locale", () => ({
  useLocale: () => ({
    locale: "ko" as const,
    setLocale: vi.fn(),
    t: (key: string, params?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        "card.agents": `\u{1F465} ${params?.count ?? 0}명`,
        "action.setup": "세팅",
        "favorite.add": "즐겨찾기 추가",
        "favorite.remove": "즐겨찾기 제거",
      };
      return translations[key] ?? key;
    },
  }),
}));

// Mock QuickPreview to avoid loading harness detail
vi.mock("@/components/catalog/quick-preview", () => ({
  QuickPreview: () => null,
}));

describe("HarnessCard", () => {
  const defaultHarness = createHarnessMeta({
    id: 16,
    slug: "fullstack-web-app",
    name: "Fullstack Web App",
    description: "Full stack web app development",
    category: "development",
    agentCount: 5,
    popularityRank: 1,
  });

  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders harness name, description, and agent count", () => {
    // Arrange & Act
    render(
      <HarnessCard
        harness={defaultHarness}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByText("Fullstack Web App")).toBeInTheDocument();
    expect(screen.getByText("Full stack web app development")).toBeInTheDocument();
    expect(screen.getByText(/5명/)).toBeInTheDocument();
  });

  it("shows category label", () => {
    // Arrange & Act
    render(
      <HarnessCard
        harness={defaultHarness}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
      />,
    );

    // Assert - "개발" is the Korean label for "development" category
    expect(screen.getByText("개발")).toBeInTheDocument();
  });

  it("calls onToggleFavorite when favorite button is clicked", async () => {
    // Arrange
    const onToggleFavorite = vi.fn();
    const user = userEvent.setup();
    render(
      <HarnessCard
        harness={defaultHarness}
        isFavorite={false}
        onToggleFavorite={onToggleFavorite}
      />,
    );

    // Act
    const favoriteButton = screen.getByLabelText("즐겨찾기 추가");
    await user.click(favoriteButton);

    // Assert
    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
  });

  it("shows rank badge with medal emoji when showRank=true and rank <= 3", () => {
    // Arrange - rank 1 should show gold medal
    const harness = createHarnessMeta({ ...defaultHarness, popularityRank: 1 });

    // Act
    render(
      <HarnessCard
        harness={harness}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
        showRank={true}
      />,
    );

    // Assert
    expect(screen.getByText("\u{1F947}")).toBeInTheDocument(); // gold medal
  });

  it("shows rank badge with silver medal for rank 2", () => {
    // Arrange
    const harness = createHarnessMeta({ ...defaultHarness, popularityRank: 2 });

    // Act
    render(
      <HarnessCard
        harness={harness}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
        showRank={true}
      />,
    );

    // Assert
    expect(screen.getByText("\u{1F948}")).toBeInTheDocument(); // silver medal
  });

  it("shows rank badge with bronze medal for rank 3", () => {
    // Arrange
    const harness = createHarnessMeta({ ...defaultHarness, popularityRank: 3 });

    // Act
    render(
      <HarnessCard
        harness={harness}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
        showRank={true}
      />,
    );

    // Assert
    expect(screen.getByText("\u{1F949}")).toBeInTheDocument(); // bronze medal
  });

  it("shows number badge for ranks 4-10", () => {
    // Arrange
    const harness = createHarnessMeta({ ...defaultHarness, popularityRank: 7 });

    // Act
    render(
      <HarnessCard
        harness={harness}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
        showRank={true}
      />,
    );

    // Assert - Korean locale shows "7위"
    expect(screen.getByText("7위")).toBeInTheDocument();
  });

  it("does not show rank badge when showRank is false", () => {
    // Arrange
    const harness = createHarnessMeta({ ...defaultHarness, popularityRank: 1 });

    // Act
    render(
      <HarnessCard
        harness={harness}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
        showRank={false}
      />,
    );

    // Assert
    expect(screen.queryByText("\u{1F947}")).not.toBeInTheDocument();
    expect(screen.queryByText("1위")).not.toBeInTheDocument();
  });

  it("does not show rank badge when rank > 10", () => {
    // Arrange
    const harness = createHarnessMeta({ ...defaultHarness, popularityRank: 15 });

    // Act
    render(
      <HarnessCard
        harness={harness}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
        showRank={true}
      />,
    );

    // Assert
    expect(screen.queryByText("15위")).not.toBeInTheDocument();
  });

  it("links to the correct harness detail page with padded ID", () => {
    // Arrange
    const harness = createHarnessMeta({ ...defaultHarness, id: 5 });

    // Act
    render(
      <HarnessCard
        harness={harness}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
      />,
    );

    // Assert
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/harness/05");
  });

  it("shows filled star when isFavorite is true", () => {
    // Arrange & Act
    render(
      <HarnessCard
        harness={defaultHarness}
        isFavorite={true}
        onToggleFavorite={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByLabelText("즐겨찾기 제거")).toBeInTheDocument();
  });
});
