import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalSetup } from "../use-local-setup";
import { createHarness, resetFixtureCounter } from "@/test/mocks/harness-fixtures";

const mockDirHandle = {} as FileSystemDirectoryHandle;

vi.mock("@/lib/local-writer", () => ({
  openProjectDir: vi.fn(),
  detectConflicts: vi.fn(),
  writeWithResolutions: vi.fn(),
  isFileSystemAccessSupported: vi.fn(),
}));

import {
  openProjectDir,
  detectConflicts,
  writeWithResolutions,
  isFileSystemAccessSupported,
} from "@/lib/local-writer";

const mockOpenDir = vi.mocked(openProjectDir);
const mockDetect = vi.mocked(detectConflicts);
const mockWrite = vi.mocked(writeWithResolutions);
const mockIsSupported = vi.mocked(isFileSystemAccessSupported);

beforeEach(() => {
  resetFixtureCounter();
  mockOpenDir.mockReset();
  mockDetect.mockReset();
  mockWrite.mockReset();
  mockIsSupported.mockReset();
});

describe("useLocalSetup", () => {
  it("starts with idle status and null result", () => {
    mockIsSupported.mockReturnValue(true);
    const { result } = renderHook(() => useLocalSetup());
    expect(result.current.status).toBe("idle");
    expect(result.current.result).toBeNull();
    expect(result.current.supported).toBe(true);
  });

  it("reports unsupported when File System Access API is not available", () => {
    mockIsSupported.mockReturnValue(false);
    const { result } = renderHook(() => useLocalSetup());
    expect(result.current.supported).toBe(false);
  });

  it("sets unsupported status when setup called without support", async () => {
    mockIsSupported.mockReturnValue(false);
    const harness = createHarness();
    const { result } = renderHook(() => useLocalSetup());

    await act(async () => {
      await result.current.setup(harness);
    });

    expect(result.current.status).toBe("unsupported");
  });

  it("completes setup successfully when no conflicts", async () => {
    mockIsSupported.mockReturnValue(true);
    mockOpenDir.mockResolvedValue(mockDirHandle);
    mockDetect.mockResolvedValue({ conflicts: [], dirHandle: mockDirHandle });
    const setupResult = {
      success: true,
      filesWritten: 5,
      filesSkipped: 0,
      filesMerged: 0,
      path: "/project",
    };
    mockWrite.mockResolvedValue(setupResult);

    const harness = createHarness();
    const { result } = renderHook(() => useLocalSetup());

    await act(async () => {
      await result.current.setup(harness);
    });

    expect(result.current.status).toBe("complete");
    expect(result.current.result).toEqual(setupResult);
    expect(mockWrite).toHaveBeenCalledWith(mockDirHandle, harness, undefined, undefined, "ko");
  });

  it("passes modifications through the pipeline", async () => {
    mockIsSupported.mockReturnValue(true);
    mockOpenDir.mockResolvedValue(mockDirHandle);
    mockDetect.mockResolvedValue({ conflicts: [], dirHandle: mockDirHandle });
    mockWrite.mockResolvedValue({
      success: true,
      filesWritten: 3,
      filesSkipped: 0,
      filesMerged: 0,
      path: "/p",
    });

    const harness = createHarness();
    const mods = [{ agentId: "a1", field: "name" as const, value: "New" }];
    const { result } = renderHook(() => useLocalSetup());

    await act(async () => {
      await result.current.setup(harness, mods);
    });

    expect(mockDetect).toHaveBeenCalledWith(mockDirHandle, harness, mods);
    expect(mockWrite).toHaveBeenCalledWith(mockDirHandle, harness, mods, undefined, "ko");
  });

  it("enters confirming status when conflicts detected", async () => {
    mockIsSupported.mockReturnValue(true);
    mockOpenDir.mockResolvedValue(mockDirHandle);
    const conflicts = [
      { path: ".claude/CLAUDE.md", type: "claudeMd" as const, resolution: "merge" as const },
    ];
    mockDetect.mockResolvedValue({ conflicts, dirHandle: mockDirHandle });

    const harness = createHarness();
    const { result } = renderHook(() => useLocalSetup());

    await act(async () => {
      await result.current.setup(harness);
    });

    expect(result.current.status).toBe("confirming");
    expect(result.current.conflictReport).toEqual({ conflicts, dirHandle: mockDirHandle });
  });

  it("resolves conflicts and completes writing", async () => {
    mockIsSupported.mockReturnValue(true);
    mockOpenDir.mockResolvedValue(mockDirHandle);
    const conflicts = [
      { path: ".claude/CLAUDE.md", type: "claudeMd" as const, resolution: "merge" as const },
    ];
    mockDetect.mockResolvedValue({ conflicts, dirHandle: mockDirHandle });
    const setupResult = {
      success: true,
      filesWritten: 4,
      filesSkipped: 0,
      filesMerged: 1,
      path: "/project",
    };
    mockWrite.mockResolvedValue(setupResult);

    const harness = createHarness();
    const { result } = renderHook(() => useLocalSetup());

    await act(async () => {
      await result.current.setup(harness);
    });

    expect(result.current.status).toBe("confirming");

    const resolved = [
      { path: ".claude/CLAUDE.md", type: "claudeMd" as const, resolution: "merge" as const },
    ];
    await act(async () => {
      await result.current.resolveConflicts(resolved);
    });

    expect(result.current.status).toBe("complete");
    expect(result.current.result).toEqual(setupResult);
    expect(result.current.conflictReport).toBeNull();
  });

  it("cancels conflicts and returns to idle", async () => {
    mockIsSupported.mockReturnValue(true);
    mockOpenDir.mockResolvedValue(mockDirHandle);
    mockDetect.mockResolvedValue({
      conflicts: [{ path: ".claude/CLAUDE.md", type: "claudeMd" as const, resolution: "merge" as const }],
      dirHandle: mockDirHandle,
    });

    const harness = createHarness();
    const { result } = renderHook(() => useLocalSetup());

    await act(async () => {
      await result.current.setup(harness);
    });

    expect(result.current.status).toBe("confirming");

    act(() => {
      result.current.cancelConflicts();
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.conflictReport).toBeNull();
  });

  it("sets error status when writeWithResolutions returns failure", async () => {
    mockIsSupported.mockReturnValue(true);
    mockOpenDir.mockResolvedValue(mockDirHandle);
    mockDetect.mockResolvedValue({ conflicts: [], dirHandle: mockDirHandle });
    mockWrite.mockResolvedValue({
      success: false,
      filesWritten: 0,
      filesSkipped: 0,
      filesMerged: 0,
      path: "",
      error: "cancelled",
    });

    const harness = createHarness();
    const { result } = renderHook(() => useLocalSetup());

    await act(async () => {
      await result.current.setup(harness);
    });

    expect(result.current.status).toBe("error");
  });

  it("returns to idle when user cancels directory picker", async () => {
    mockIsSupported.mockReturnValue(true);
    const abortError = new DOMException("User cancelled", "AbortError");
    mockOpenDir.mockRejectedValue(abortError);

    const harness = createHarness();
    const { result } = renderHook(() => useLocalSetup());

    await act(async () => {
      await result.current.setup(harness);
    });

    expect(result.current.status).toBe("idle");
  });

  it("sets error status when openProjectDir throws unexpected error", async () => {
    mockIsSupported.mockReturnValue(true);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockOpenDir.mockRejectedValue(new Error("Unexpected"));

    const harness = createHarness();
    const { result } = renderHook(() => useLocalSetup());

    await act(async () => {
      await result.current.setup(harness);
    });

    expect(result.current.status).toBe("error");
    consoleSpy.mockRestore();
  });
});
