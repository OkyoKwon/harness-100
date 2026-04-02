import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";

const SearchIcon = (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { placeholder: "Enter text..." },
};

export const WithIcon: Story = {
  args: { icon: SearchIcon, placeholder: "Search..." },
};

export const Disabled: Story = {
  args: { placeholder: "Disabled", disabled: true },
};
