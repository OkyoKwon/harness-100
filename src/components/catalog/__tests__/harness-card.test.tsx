import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
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

// Mock QuickPreview to render a visible element
vi.mock("@/components/catalog/quick-preview", () => ({
  QuickPreview: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="quick-preview">
      <button onClick={onClose}>close-preview</button>
    </div>
  ),
}));

// Mock useHoverCapable - default to true for hover tests
const mockHoverCapable = vi.fn().mockReturnValue(true);
vi.mock("@/hooks/use-hover-capable", () => ({
  useHoverCapable: () => mockHoverCapable(),
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

  it("clears hover timer and hides preview on mouse leave", () => {
    // Arrange
    vi.useFakeTimers();
    render(
      <HarnessCard
        harness={defaultHarness}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
      />,
    );

    // Act - hover to start timer, then leave before 400ms
    const card = screen.getByRole("link").parentElement!;
    fireEvent.mouseEnter(card);
    fireEvent.mouseLeave(card);
    act(() => { vi.advanceTimersByTime(500); });

    // Assert - preview should not appear
    expect(screen.queryByTestId("quick-preview")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("shows quick preview after hover delay when hoverCapable", () => {
    // Arrange
    vi.useFakeTimers();
    render(
      <HarnessCard
        harness={defaultHarness}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
      />,
    );

    // Act - hover and wait for the 400ms delay
    const card = screen.getByRole("link").parentElement!;
    fireEvent.mouseEnter(card);
    act(() => { vi.advanceTimersByTime(500); });

    // Assert
    expect(screen.getByTestId("quick-preview")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("does not show quick preview when not hoverCapable", () => {
    // Arrange
    mockHoverCapable.mockReturnValue(false);
    vi.useFakeTimers();
    render(
      <HarnessCard
        harness={defaultHarness}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
      />,
    );

    // Act
    const card = screen.getByRole("link").parentElement!;
    fireEvent.mouseEnter(card);
    act(() => { vi.advanceTimersByTime(500); });

    // Assert
    expect(screen.queryByTestId("quick-preview")).not.toBeInTheDocument();
    mockHoverCapable.mockReturnValue(true);
    vi.useRealTimers();
  });

  it("navigates to setup action when setup button is clicked", () => {
    // Arrange
    render(
      <HarnessCard
        harness={defaultHarness}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
      />,
    );

    // Act
    const setupButton = screen.getByText("세팅");
    fireEvent.click(setupButton);

    // Assert
    expect(mockPush).toHaveBeenCalledWith("/harness/16?action=setup");
  });
});
