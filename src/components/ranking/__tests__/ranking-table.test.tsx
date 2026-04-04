import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RankingTable } from "../ranking-table";
import { createHarnessMeta } from "@/test/mocks/harness-fixtures";
import { LanguageProvider } from "@/hooks/use-locale";

// Mock fetch for detectLocaleByIP → return "KR" so locale becomes "ko"
beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: true,
    text: () => Promise.resolve("KR"),
  }));
});

async function renderWithLocale(ui: React.ReactElement) {
  let result: ReturnType<typeof render>;
  await act(async () => {
    result = render(<LanguageProvider>{ui}</LanguageProvider>);
  });
  return result!;
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

  it("renders all items in the table", async () => {
    // Arrange & Act
    await renderWithLocale(<RankingTable items={items} />);

    // Assert
    expect(screen.getByText("Data Analysis")).toBeInTheDocument();
    expect(screen.getByText("Startup Launcher")).toBeInTheDocument();
    expect(screen.getByText("Fullstack Web App")).toBeInTheDocument();
  });

  it("shows harness descriptions", async () => {
    // Arrange & Act
    await renderWithLocale(<RankingTable items={items} />);

    // Assert
    expect(screen.getByText("Data analysis pipeline")).toBeInTheDocument();
    expect(screen.getByText("Startup planning toolkit")).toBeInTheDocument();
  });

  it("shows popularity rank numbers", async () => {
    // Arrange & Act
    await renderWithLocale(<RankingTable items={items} />);

    // Assert
    expect(screen.getByText("11")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("13")).toBeInTheDocument();
  });

  it("filters rows when category is changed", async () => {
    // Arrange
    const user = userEvent.setup();
    await renderWithLocale(<RankingTable items={items} />);

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
    await renderWithLocale(<RankingTable items={items} />);

    // Act - select a category with no items
    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "education");

    // Assert
    expect(screen.getByText("해당 카테고리에 하네스가 없습니다")).toBeInTheDocument();
  });

  it("shows all items when filter is reset to 'all'", async () => {
    // Arrange
    const user = userEvent.setup();
    await renderWithLocale(<RankingTable items={items} />);
    const select = screen.getByRole("combobox");

    // Act - filter then reset
    await user.selectOptions(select, "business");
    await user.selectOptions(select, "all");

    // Assert
    expect(screen.getByText("Data Analysis")).toBeInTheDocument();
    expect(screen.getByText("Startup Launcher")).toBeInTheDocument();
    expect(screen.getByText("Fullstack Web App")).toBeInTheDocument();
  });

  it("links to detail pages with padded IDs", async () => {
    // Arrange & Act
    await renderWithLocale(<RankingTable items={items} />);

    // Assert
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/harness/32");
    expect(hrefs).toContain("/harness/43");
    expect(hrefs).toContain("/harness/16");
  });

  it("renders table headers", async () => {
    // Arrange & Act
    await renderWithLocale(<RankingTable items={items} />);

    // Assert
    expect(screen.getByText("순위")).toBeInTheDocument();
    expect(screen.getByText("하네스")).toBeInTheDocument();
    expect(screen.getByText("전체 순위")).toBeInTheDocument();
  });
});
