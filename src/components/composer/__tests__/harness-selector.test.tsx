import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HarnessSelector } from "../harness-selector";
import {
  createCatalogFixture,
  createHarnessMeta,
  resetFixtureCounter,
} from "@/test/mocks/harness-fixtures";

// --- Mocks ---

vi.mock("@/hooks/use-locale", () => ({
  useLocale: () => ({
    locale: "ko" as const,
    setLocale: vi.fn(),
    t: (key: string, params?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        "composer.searchPlaceholder": "검색...",
        "composer.selected": `선택됨 (${params?.count ?? 0})`,
        "composer.selectedCount": `${params?.count ?? 0}개 선택`,
        "composer.clearAll": "전체 해제",
        "composer.noResults": "검색 결과 없음",
        "composer.agentCount": `${params?.count ?? 0}명`,
      };
      return translations[key] ?? key;
    },
  }),
}));

// --- Tests ---

describe("HarnessSelector", () => {
  const catalog = createCatalogFixture();
  const onAdd = vi.fn();
  const onRemove = vi.fn();

  beforeEach(() => {
    resetFixtureCounter();
    onAdd.mockClear();
    onRemove.mockClear();
  });

  it("renders all catalog items grouped by category", () => {
    // Act
    render(
      <HarnessSelector
        catalog={catalog}
        selectedIds={[]}
        onAdd={onAdd}
        onRemove={onRemove}
      />,
    );

    // Assert
    expect(screen.getByText("Fullstack Web App")).toBeInTheDocument();
    expect(screen.getByText("Code Reviewer")).toBeInTheDocument();
    expect(screen.getByText("YouTube Production")).toBeInTheDocument();
  });

  it("renders search input", () => {
    // Act
    render(
      <HarnessSelector
        catalog={catalog}
        selectedIds={[]}
        onAdd={onAdd}
        onRemove={onRemove}
      />,
    );

    // Assert
    expect(screen.getByPlaceholderText("검색...")).toBeInTheDocument();
  });

  it("calls onAdd when an unselected item is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <HarnessSelector
        catalog={catalog}
        selectedIds={[]}
        onAdd={onAdd}
        onRemove={onRemove}
      />,
    );

    // Act
    await user.click(screen.getByText("Fullstack Web App"));

    // Assert
    expect(onAdd).toHaveBeenCalledWith(16);
  });

  it("renders selected items in a separate section", () => {
    // Act
    render(
      <HarnessSelector
        catalog={catalog}
        selectedIds={[16]}
        onAdd={onAdd}
        onRemove={onRemove}
      />,
    );

    // Assert
    expect(screen.getByText("선택됨 (1)")).toBeInTheDocument();
  });

  it("calls onRemove when a selected item is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <HarnessSelector
        catalog={catalog}
        selectedIds={[16]}
        onAdd={onAdd}
        onRemove={onRemove}
      />,
    );

    // Act - click the selected "Fullstack Web App" to remove it
    const selectedItem = screen.getAllByText("Fullstack Web App")[0];
    await user.click(selectedItem);

    // Assert
    expect(onRemove).toHaveBeenCalledWith(16);
  });

  it("shows selected count in footer", () => {
    // Act
    render(
      <HarnessSelector
        catalog={catalog}
        selectedIds={[16, 21]}
        onAdd={onAdd}
        onRemove={onRemove}
      />,
    );

    // Assert
    expect(screen.getByText("2개 선택")).toBeInTheDocument();
  });

  it("shows clear all button when items are selected", () => {
    // Act
    render(
      <HarnessSelector
        catalog={catalog}
        selectedIds={[16]}
        onAdd={onAdd}
        onRemove={onRemove}
      />,
    );

    // Assert
    expect(screen.getByText("전체 해제")).toBeInTheDocument();
  });

  it("does not show clear all button when nothing is selected", () => {
    // Act
    render(
      <HarnessSelector
        catalog={catalog}
        selectedIds={[]}
        onAdd={onAdd}
        onRemove={onRemove}
      />,
    );

    // Assert
    expect(screen.queryByText("전체 해제")).not.toBeInTheDocument();
  });
});
