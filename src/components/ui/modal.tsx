"use client";

import { useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/cn";

interface ModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title?: string;
  readonly ariaLabelledBy?: string;
  readonly className?: string;
  readonly children: React.ReactNode;
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  title,
  ariaLabelledBy,
  className,
  children,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = ariaLabelledBy ?? "modal-title";

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusable =
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      const firstFocusable =
        dialogRef.current?.querySelector<HTMLElement>("button");
      firstFocusable?.focus();
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--modal-overlay)] p-4 backdrop-blur-sm"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl",
          "border border-[var(--modal-border)] bg-[var(--modal-bg)] shadow-lg",
          className,
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-[var(--modal-header-border)] px-5 py-3">
            <h3
              id={titleId}
              className="text-base font-semibold text-[var(--foreground)]"
            >
              {title}
            </h3>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function ModalBody({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex-1 overflow-y-auto px-5 py-4", className)} {...rest}>
      {children}
    </div>
  );
}
