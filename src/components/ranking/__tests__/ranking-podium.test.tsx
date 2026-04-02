import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RankingPodium } from "../ranking-podium";
import { createHarnessMeta } from "@/test/mocks/harness-fixtures";

describe("RankingPodium", () => {
  const top3 = [
    createHarnessMeta({
      id: 16,
      name: "Fullstack Web App",
      description: "Full stack development",
      category: "development",
      agentCount: 5,
      popularityRank: 1,
    }),
    createHarnessMeta({
      id: 21,
      name: "Code Reviewer",
      description: "Automated code review",
      category: "development",
      agentCount: 4,
      popularityRank: 2,
    }),
    createHarnessMeta({
      id: 1,
      name: "YouTube Production",
      description: "YouTube content creation",
      category: "content",
      agentCount: 6,
      popularityRank: 3,
    }),
  ];

  it("renders 3 items with correct medals", () => {
    // Arrange & Act
    render(<RankingPodium items={top3} />);

    // Assert
    expect(screen.getAllByText("\u{1F947}")).toHaveLength(2); // gold appears in desktop + mobile
    expect(screen.getAllByText("\u{1F948}")).toHaveLength(2); // silver appears in desktop + mobile
    expect(screen.getAllByText("\u{1F949}")).toHaveLength(2); // bronze appears in desktop + mobile
  });

  it("links navigate to correct harness detail pages", () => {
    // Arrange & Act
    render(<RankingPodium items={top3} />);

    // Assert - each harness appears in desktop and mobile layout (6 links total)
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/harness/16");
    expect(hrefs).toContain("/harness/21");
    expect(hrefs).toContain("/harness/01");
  });

  it("shows category and agent count", () => {
    // Arrange & Act
    render(<RankingPodium items={top3} />);

    // Assert
    expect(screen.getAllByText("개발").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("콘텐츠").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/5명/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/4명/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/6명/).length).toBeGreaterThanOrEqual(1);
  });

  it("renders harness names", () => {
    // Arrange & Act
    render(<RankingPodium items={top3} />);

    // Assert
    expect(screen.getAllByText("Fullstack Web App").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Code Reviewer").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("YouTube Production").length).toBeGreaterThanOrEqual(1);
  });

  it("returns null if less than 3 items", () => {
    // Arrange
    const twoItems = top3.slice(0, 2);

    // Act
    const { container } = render(<RankingPodium items={twoItems} />);

    // Assert
    expect(container.innerHTML).toBe("");
  });

  it("returns null for empty items array", () => {
    // Arrange & Act
    const { container } = render(<RankingPodium items={[]} />);

    // Assert
    expect(container.innerHTML).toBe("");
  });

  it("shows rank number text", () => {
    // Arrange & Act
    render(<RankingPodium items={top3} />);

    // Assert
    expect(screen.getAllByText("1위").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("2위").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("3위").length).toBeGreaterThanOrEqual(1);
  });
});
