import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RankingTable } from "../ranking-table";
import { createHarnessMeta } from "@/test/mocks/harness-fixtures";
import { LanguageProvider } from "@/hooks/use-locale";

function renderWithLocale(ui: React.ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe("RankingTable", () => {
  const items = [
    createHarnessMeta({
      id: 32,
      name: "Data Analysis",
      description: "Data analysis pipeline",
      category: "data-ai",
      agentCount: 3,
      popularityRank: 11,
    }),
    createHarnessMeta({
      id: 43,
      name: "Startup Launcher",
      description: "Startup planning toolkit",
      category: "business",
      agentCount: 7,
      popularityRank: 12,
    }),
    createHarnessMeta({
      id: 16,
      name: "Fullstack Web App",
      description: "Full stack development",
      category: "development",
      agentCount: 5,
      popularityRank: 13,
    }),
  ];

  it("renders all items in the table", () => {
    // Arrange & Act
    renderWithLocale(<RankingTable items={items} />);

    // Assert
    expect(screen.getByText("Data Analysis")).toBeInTheDocument();
    expect(screen.getByText("Startup Launcher")).toBeInTheDocument();
    expect(screen.getByText("Fullstack Web App")).toBeInTheDocument();
  });

  it("shows harness descriptions", () => {
    // Arrange & Act
    renderWithLocale(<RankingTable items={items} />);

    // Assert
    expect(screen.getByText("Data analysis pipeline")).toBeInTheDocument();
    expect(screen.getByText("Startup planning toolkit")).toBeInTheDocument();
  });

  it("shows popularity rank numbers", () => {
    // Arrange & Act
    renderWithLocale(<RankingTable items={items} />);

    // Assert
    expect(screen.getByText("11")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("13")).toBeInTheDocument();
  });

  it("filters rows when category is changed", async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithLocale(<RankingTable items={items} />);

    // Act - select "business" category
    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "business");

    // Assert
    expect(screen.getByText("Startup Launcher")).toBeInTheDocument();
    expect(screen.queryByText("Data Analysis")).not.toBeInTheDocument();
    expect(screen.queryByText("Fullstack Web App")).not.toBeInTheDocument();
  });

  it("shows 'no results' message when filter matches nothing", async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithLocale(<RankingTable items={items} />);

    // Act - select a category with no items
    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "education");

    // Assert
    expect(screen.getByText("해당 카테고리에 하네스가 없습니다")).toBeInTheDocument();
  });

  it("shows all items when filter is reset to 'all'", async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithLocale(<RankingTable items={items} />);
    const select = screen.getByRole("combobox");

    // Act - filter then reset
    await user.selectOptions(select, "business");
    await user.selectOptions(select, "all");

    // Assert
    expect(screen.getByText("Data Analysis")).toBeInTheDocument();
    expect(screen.getByText("Startup Launcher")).toBeInTheDocument();
    expect(screen.getByText("Fullstack Web App")).toBeInTheDocument();
  });

  it("links to detail pages with padded IDs", () => {
    // Arrange & Act
    renderWithLocale(<RankingTable items={items} />);

    // Assert
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/harness/32");
    expect(hrefs).toContain("/harness/43");
    expect(hrefs).toContain("/harness/16");
  });

  it("renders table headers", () => {
    // Arrange & Act
    renderWithLocale(<RankingTable items={items} />);

    // Assert
    expect(screen.getByText("순위")).toBeInTheDocument();
    expect(screen.getByText("하네스")).toBeInTheDocument();
    expect(screen.getByText("전체 순위")).toBeInTheDocument();
  });
});
