"use client";

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Modal, ModalBody } from "./modal";
import { Button } from "./button";
import { IconButton } from "./icon-button";

const meta: Meta<typeof Modal> = {
  title: "UI/Modal",
  component: Modal,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Modal>;

const CloseIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

function ModalDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Example Modal">
        <div className="flex justify-end px-5 py-1 -mt-10">
          <IconButton ariaLabel="Close" onClick={() => setOpen(false)}>
            {CloseIcon}
          </IconButton>
        </div>
        <ModalBody>
          <p className="text-sm text-[var(--muted-foreground)]">
            This is a modal dialog with focus trap, Escape key handling, and body scroll lock.
          </p>
        </ModalBody>
      </Modal>
    </>
  );
}

export const Default: Story = {
  render: () => <ModalDemo />,
};
