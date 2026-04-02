"use client";

import { Button } from "@/components/ui";
import { useLocale } from "@/hooks/use-locale";

interface SetupButtonProps {
  readonly onClick: () => void;
  readonly disabled?: boolean;
  readonly size?: "sm" | "md";
}

export function SetupButton({ onClick, disabled, size = "md" }: SetupButtonProps) {
  const { t } = useLocale();

  return (
    <Button
      variant="primary"
      size={size}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
    >
      {t("action.setup")}
    </Button>
  );
}
