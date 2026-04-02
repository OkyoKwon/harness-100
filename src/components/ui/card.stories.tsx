import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardHeader, CardBody, CardFooter } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardBody>
        <h3 className="font-semibold mb-2">Card Title</h3>
        <p className="text-sm text-[var(--muted-foreground)]">
          This is a basic card with some content.
        </p>
      </CardBody>
    </Card>
  ),
};

export const WithHeaderFooter: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardHeader>
        <h3 className="font-semibold">Harness Name</h3>
      </CardHeader>
      <CardBody>
        <p className="text-sm text-[var(--muted-foreground)] mb-3">
          Description of the harness goes here.
        </p>
        <div className="flex gap-2">
          <Badge variant="tool">Vitest</Badge>
          <Badge variant="framework">React</Badge>
        </div>
      </CardBody>
      <CardFooter>
        <div className="flex gap-2">
          <Button size="sm">Setup</Button>
          <Button variant="outline" size="sm">ZIP ↓</Button>
        </div>
      </CardFooter>
    </Card>
  ),
};

export const Hoverable: Story = {
  render: () => (
    <Card hoverable className="max-w-sm">
      <CardBody>
        <h3 className="font-semibold mb-2">Hoverable Card</h3>
        <p className="text-sm text-[var(--muted-foreground)]">
          Hover to see the elevation effect.
        </p>
      </CardBody>
    </Card>
  ),
};
