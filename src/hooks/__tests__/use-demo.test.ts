import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDemo } from "../use-demo";
import { createDemoScenario } from "@/test/mocks/harness-fixtures";

// Mock the demo-loader module
vi.mock("@/lib/demo-loader", () => ({
  loadDemoScenario: vi.fn(),
}));

// Mock use-locale to return en
vi.mock("@/hooks/use-locale", () => ({
  useLocale: () => ({ locale: "en", t: (key: string) => key }),
}));

import { loadDemoScenario } from "@/lib/demo-loader";

const mockLoad = vi.mocked(loadDemoScenario);

describe("useDemo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockLoad.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts in idle status", () => {
    const { result } = renderHook(() => useDemo(1, "en"));
    expect(result.current.status).toBe("idle");
    expect(result.current.scenario).toBeNull();
    expect(result.current.activeAgentId).toBeNull();
  });

  it("loads scenario on startDemo", async () => {
    const demo = createDemoScenario();
    mockLoad.mockResolvedValue(demo);

    const { result } = renderHook(() => useDemo(1, "en"));

    await act(async () => {
      result.current.startDemo();
    });

    expect(result.current.status).toBe("ready");
    expect(result.current.scenario).toEqual(demo);
    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.totalSteps).toBe(3);
    expect(result.current.activeAgentId).toBe("agent-1");
  });

  it("sets error status when demo not found", async () => {
    mockLoad.mockResolvedValue(null);

    const { result } = renderHook(() => useDemo(1, "en"));

    await act(async () => {
      result.current.startDemo();
    });

    expect(result.current.status).toBe("error");
  });

  it("navigates steps with nextStep and prevStep", async () => {
    const demo = createDemoScenario();
    mockLoad.mockResolvedValue(demo);

    const { result } = renderHook(() => useDemo(1, "en"));

    await act(async () => {
      result.current.startDemo();
    });

    expect(result.current.currentStepIndex).toBe(0);

    act(() => {
      result.current.nextStep();
    });
    expect(result.current.currentStepIndex).toBe(1);

    act(() => {
      result.current.nextStep();
    });
    expect(result.current.currentStepIndex).toBe(2);

    // Should not go past last step
    act(() => {
      result.current.nextStep();
    });
    expect(result.current.currentStepIndex).toBe(2);

    act(() => {
      result.current.prevStep();
    });
    expect(result.current.currentStepIndex).toBe(1);

    // Should not go below 0
    act(() => {
      result.current.prevStep();
    });
    act(() => {
      result.current.prevStep();
    });
    expect(result.current.currentStepIndex).toBe(0);
  });

  it("navigates to specific step with goToStep", async () => {
    const demo = createDemoScenario();
    mockLoad.mockResolvedValue(demo);

    const { result } = renderHook(() => useDemo(1, "en"));

    await act(async () => {
      result.current.startDemo();
    });

    act(() => {
      result.current.goToStep(2);
    });
    expect(result.current.currentStepIndex).toBe(2);
    expect(result.current.activeAgentId).toBe("agent-3");

    // Invalid index should be ignored
    act(() => {
      result.current.goToStep(-1);
    });
    expect(result.current.currentStepIndex).toBe(2);

    act(() => {
      result.current.goToStep(99);
    });
    expect(result.current.currentStepIndex).toBe(2);
  });

  it("auto-plays through steps with toggleAutoPlay", async () => {
    const demo = createDemoScenario();
    mockLoad.mockResolvedValue(demo);

    const { result } = renderHook(() => useDemo(1, "en"));

    await act(async () => {
      result.current.startDemo();
    });

    act(() => {
      result.current.toggleAutoPlay();
    });
    expect(result.current.status).toBe("playing");

    // Advance timer for first step duration (2000ms)
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.currentStepIndex).toBe(1);

    // Advance timer for second step duration
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.currentStepIndex).toBe(2);
    // Should stop at last step
    expect(result.current.status).toBe("ready");
  });

  it("pauses auto-play on toggleAutoPlay during playing", async () => {
    const demo = createDemoScenario();
    mockLoad.mockResolvedValue(demo);

    const { result } = renderHook(() => useDemo(1, "en"));

    await act(async () => {
      result.current.startDemo();
    });

    act(() => {
      result.current.toggleAutoPlay();
    });
    expect(result.current.status).toBe("playing");

    act(() => {
      result.current.toggleAutoPlay();
    });
    expect(result.current.status).toBe("ready");
  });

  it("resets to initial ready state", async () => {
    const demo = createDemoScenario();
    mockLoad.mockResolvedValue(demo);

    const { result } = renderHook(() => useDemo(1, "en"));

    await act(async () => {
      result.current.startDemo();
    });

    act(() => {
      result.current.nextStep();
    });
    act(() => {
      result.current.nextStep();
    });
    expect(result.current.currentStepIndex).toBe(2);

    act(() => {
      result.current.reset();
    });
    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.status).toBe("ready");
  });

  it("reports correct currentStep and activeAgentId", async () => {
    const demo = createDemoScenario();
    mockLoad.mockResolvedValue(demo);

    const { result } = renderHook(() => useDemo(1, "en"));

    await act(async () => {
      result.current.startDemo();
    });

    expect(result.current.currentStep?.agentId).toBe("agent-1");
    expect(result.current.activeAgentId).toBe("agent-1");

    act(() => {
      result.current.goToStep(1);
    });
    expect(result.current.currentStep?.agentId).toBe("agent-2");
    expect(result.current.activeAgentId).toBe("agent-2");
  });
});
