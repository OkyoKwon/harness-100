import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SortFilterBar, type SortKey } from "../sort-filter-bar";

// Mock useLocale to return translation keys as-is with param interpolation
vi.mock("@/hooks/use-locale", () => ({
  useLocale: () => ({
    locale: "ko" as const,
    setLocale: vi.fn(),
    t: (key: string, params?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        "sort.byId": "번호순",
        "sort.byPopularity": "인기순",
        "sort.byName": "이름순",
        "sort.byAgentCount": "에이전트 수",
        "sort.label": "정렬",
        "catalog.resultCount": `${params?.count ?? 0}개 결과`,
        "catalog.harnessCount": `${params?.count ?? 0}개 하네스`,
      };
      return translations[key] ?? key;
    },
  }),
}));

describe("SortFilterBar", () => {
  const defaultProps = {
    sortKey: "id" as SortKey,
    onSortChange: vi.fn(),
    resultCount: 42,
    hasQuery: false,
  };

  it("renders all 4 sort options", () => {
    // Arrange & Act
    render(<SortFilterBar {...defaultProps} />);

    // Assert
    const select = screen.getByRole("combobox");
    const options = select.querySelectorAll("option");
    expect(options).toHaveLength(4);
    expect(options[0]).toHaveTextContent("번호순");
    expect(options[1]).toHaveTextContent("인기순");
    expect(options[2]).toHaveTextContent("이름순");
    expect(options[3]).toHaveTextContent("에이전트 수");
  });

  it("calls onSortChange when selection changes", async () => {
    // Arrange
    const onSortChange = vi.fn();
    const user = userEvent.setup();
    render(<SortFilterBar {...defaultProps} onSortChange={onSortChange} />);

    // Act
    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "popularity");

    // Assert
    expect(onSortChange).toHaveBeenCalledWith("popularity");
  });

  it("displays default harness count text when hasQuery is false", () => {
    // Arrange & Act
    render(<SortFilterBar {...defaultProps} hasQuery={false} resultCount={100} />);

    // Assert
    expect(screen.getByText("100개 하네스")).toBeInTheDocument();
  });

  it("displays search result count text when hasQuery is true", () => {
    // Arrange & Act
    render(<SortFilterBar {...defaultProps} hasQuery={true} resultCount={7} />);

    // Assert
    expect(screen.getByText("7개 결과")).toBeInTheDocument();
  });

  it("reflects the current sortKey as selected value", () => {
    // Arrange & Act
    render(<SortFilterBar {...defaultProps} sortKey="name" />);

    // Assert
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("name");
  });

  it("renders the sort label", () => {
    // Arrange & Act
    render(<SortFilterBar {...defaultProps} />);

    // Assert
    expect(screen.getByText("정렬")).toBeInTheDocument();
  });
});
