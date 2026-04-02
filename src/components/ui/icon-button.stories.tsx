import type { Meta, StoryObj } from "@storybook/react";
import { IconButton } from "./icon-button";

const CloseIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const MoonIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const meta: Meta<typeof IconButton> = {
  title: "UI/IconButton",
  component: IconButton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Close: Story = {
  args: { ariaLabel: "Close", children: CloseIcon },
};

export const ThemeToggle: Story = {
  args: { ariaLabel: "Toggle dark mode", children: MoonIcon },
};

export const Small: Story = {
  args: { ariaLabel: "Close", size: "sm", children: CloseIcon },
};
