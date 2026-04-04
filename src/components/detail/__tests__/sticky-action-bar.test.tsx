import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StickyActionBar } from "../sticky-action-bar";

// --- Mocks ---

vi.mock("@/hooks/use-locale", () => ({
  useLocale: () => ({
    locale: "ko" as const,
    setLocale: vi.fn(),
    t: (key: string) => {
      const translations: Record<string, string> = {
        "favorite.add": "즐겨찾기 추가",
        "favorite.remove": "즐겨찾기 제거",
      };
      return translations[key] ?? key;
    },
  }),
}));

// Mock IntersectionObserver
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
let intersectionCallback: (entries: Array<{ isIntersecting: boolean }>) => void;

beforeEach(() => {
  mockObserve.mockClear();
  mockDisconnect.mockClear();

  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(cb: (entries: Array<{ isIntersecting: boolean }>) => void) {
        intersectionCallback = cb;
      }
      observe = mockObserve;
      disconnect = mockDisconnect;
      unobserve = vi.fn();
    },
  );
});

// --- Helpers ---

function createTriggerRef(): React.RefObject<HTMLElement | null> {
  const el = document.createElement("div");
  return { current: el };
}

function triggerIntersection(isIntersecting: boolean): void {
  act(() => {
    intersectionCallback([{ isIntersecting }]);
  });
}

const defaultProps = {
  name: "Test Harness",
  favorited: false,
  onToggleFavorite: vi.fn(),
  onSetup: vi.fn(),
  onDownloadZip: vi.fn(),
  setupDisabled: false,
  zipDisabled: false,
  setupLabel: "세팅",
  zipLabel: "ZIP",
  triggerRef: createTriggerRef(),
};

// --- Tests ---

describe("StickyActionBar", () => {
  it("is not visible when trigger element is intersecting", () => {
    // Act
    render(<StickyActionBar {...defaultProps} />);
    triggerIntersection(true);

    // Assert
    expect(screen.queryByText("Test Harness")).not.toBeInTheDocument();
  });

  it("becomes visible when trigger element is not intersecting", () => {
    // Act
    render(<StickyActionBar {...defaultProps} />);
    triggerIntersection(false);

    // Assert
    expect(screen.getByText("Test Harness")).toBeInTheDocument();
  });

  it("renders action buttons when visible", () => {
    // Act
    render(<StickyActionBar {...defaultProps} />);
    triggerIntersection(false);

    // Assert
    expect(screen.getByText("세팅")).toBeInTheDocument();
    expect(screen.getByText("ZIP")).toBeInTheDocument();
  });

  it("calls onToggleFavorite when favorite button is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    const onToggleFavorite = vi.fn();
    render(
      <StickyActionBar {...defaultProps} onToggleFavorite={onToggleFavorite} />,
    );
    triggerIntersection(false);

    // Act
    await user.click(screen.getByLabelText("즐겨찾기 추가"));

    // Assert
    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
  });

  it("calls onSetup when setup button is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    const onSetup = vi.fn();
    render(<StickyActionBar {...defaultProps} onSetup={onSetup} />);
    triggerIntersection(false);

    // Act
    await user.click(screen.getByText("세팅"));

    // Assert
    expect(onSetup).toHaveBeenCalledTimes(1);
  });

  it("disables setup button when setupDisabled is true", () => {
    // Act
    render(<StickyActionBar {...defaultProps} setupDisabled={true} />);
    triggerIntersection(false);

    // Assert
    expect(screen.getByText("세팅")).toBeDisabled();
  });

  it("shows filled star when favorited", () => {
    // Act
    render(<StickyActionBar {...defaultProps} favorited={true} />);
    triggerIntersection(false);

    // Assert
    expect(screen.getByLabelText("즐겨찾기 제거")).toBeInTheDocument();
  });

  it("observes the trigger ref element", () => {
    // Act
    render(<StickyActionBar {...defaultProps} />);

    // Assert
    expect(mockObserve).toHaveBeenCalledWith(defaultProps.triggerRef.current);
  });
});
