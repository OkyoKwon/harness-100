"use client";

import { Button } from "@/components/ui";

interface ZipButtonProps {
  readonly onClick: () => void;
  readonly disabled?: boolean;
  readonly size?: "sm" | "md";
}

export function ZipButton({ onClick, disabled, size = "md" }: ZipButtonProps) {
  return (
    <Button
      variant="outline"
      size={size}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
    >
      ZIP ↓
    </Button>
  );
}
