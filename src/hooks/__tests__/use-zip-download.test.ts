import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useZipDownload } from "../use-zip-download";
import { createHarness, resetFixtureCounter } from "@/test/mocks/harness-fixtures";

vi.mock("@/lib/zip-builder", () => ({
  buildZip: vi.fn(),
}));

import { buildZip } from "@/lib/zip-builder";
const mockBuildZip = vi.mocked(buildZip);

beforeEach(() => {
  resetFixtureCounter();
  mockBuildZip.mockReset();

  // Mock URL methods (keep existing URL object)
  global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
  global.URL.revokeObjectURL = vi.fn();
});

describe("useZipDownload", () => {
  it("starts with idle status", () => {
    const { result } = renderHook(() => useZipDownload());
    expect(result.current.status).toBe("idle");
  });

  it("downloads a zip successfully", async () => {
    const mockBlob = new Blob(["test"], { type: "application/zip" });
    mockBuildZip.mockResolvedValue(mockBlob);

    const mockClick = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      if (tag === "a") {
        const el = originalCreateElement("a");
        el.click = mockClick;
        return el;
      }
      return originalCreateElement(tag);
    });

    const harness = createHarness({ slug: "test-dl" });
    const { result } = renderHook(() => useZipDownload());

    await act(async () => {
      await result.current.download(harness);
    });

    expect(result.current.status).toBe("complete");
    expect(mockBuildZip).toHaveBeenCalledWith(harness, undefined, "ko");
    expect(mockClick).toHaveBeenCalled();
  });

  it("sets error status when build fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockBuildZip.mockRejectedValue(new Error("Build failed"));

    const harness = createHarness();
    const { result } = renderHook(() => useZipDownload());

    await act(async () => {
      await result.current.download(harness);
    });

    expect(result.current.status).toBe("error");
    consoleSpy.mockRestore();
  });
});
