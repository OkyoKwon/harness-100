import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "tool", "framework", "category"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: { variant: "default", children: "3 Agents" },
};

export const Tool: Story = {
  args: { variant: "tool", children: "Vitest" },
};

export const Framework: Story = {
  args: { variant: "framework", children: "React" },
};

export const Category: Story = {
  args: { variant: "category", color: "#2563eb", children: "Testing" },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="tool">Tool</Badge>
      <Badge variant="framework">Framework</Badge>
      <Badge variant="category" color="#16a34a">Category</Badge>
    </div>
  ),
};
