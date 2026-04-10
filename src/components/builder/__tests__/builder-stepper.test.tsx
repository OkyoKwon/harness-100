import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BuilderStepper } from "../builder-stepper";

// Mock useLocale
vi.mock("@/hooks/use-locale", () => ({
  useLocale: () => ({
    locale: "en",
    t: (key: string) => {
      const map: Record<string, string> = {
        "builder.step.meta": "Basic Info",
        "builder.step.agents": "Agents",
        "builder.step.skill": "Skill",
        "builder.step.review": "Review",
      };
      return map[key] ?? key;
    },
  }),
}));

describe("BuilderStepper", () => {
  const onStepClick = vi.fn();

  beforeEach(() => {
    onStepClick.mockClear();
  });

  it("renders all 4 steps", () => {
    render(<BuilderStepper currentStep={1} onStepClick={onStepClick} />);
    // Use getAllByText since mobile label also shows current step text
    expect(screen.getAllByText("Basic Info").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Agents").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Skill").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Review").length).toBeGreaterThanOrEqual(1);
  });

  it("marks current step with aria-current", () => {
    render(<BuilderStepper currentStep={2} onStepClick={onStepClick} />);
    // Find all buttons in the stepper, step 2 should have aria-current
    const buttons = screen.getAllByRole("button");
    const currentButton = buttons.find((b) => b.getAttribute("aria-current") === "step");
    expect(currentButton).toBeDefined();
    expect(currentButton?.textContent).toContain("Agents");
  });

  it("calls onStepClick when a step is clicked", async () => {
    const user = userEvent.setup();
    render(<BuilderStepper currentStep={1} onStepClick={onStepClick} />);

    // Click the button containing "Agents" text (step 2)
    const buttons = screen.getAllByRole("button");
    const agentsButton = buttons.find((b) => b.textContent?.includes("Agents"));
    expect(agentsButton).toBeDefined();
    await user.click(agentsButton!);
    expect(onStepClick).toHaveBeenCalledWith(2);
  });

  it("shows check icon for completed steps", () => {
    render(<BuilderStepper currentStep={3} onStepClick={onStepClick} />);
    const stepNav = screen.getByRole("navigation");
    const svgs = stepNav.querySelectorAll("svg");
    // At least 2 check icons for steps 1 and 2
    expect(svgs.length).toBeGreaterThanOrEqual(2);
  });
});
