import { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  readonly icon?: React.ReactNode;
  readonly helperText?: string;
  readonly errorMessage?: string;
  readonly label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ icon, helperText, errorMessage, label, className, id: idProp, ...rest }, ref) {
    const autoId = useId();
    const inputId = idProp ?? autoId;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const errorId = errorMessage ? `${inputId}-error` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--foreground)]">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--input-placeholder)]">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={errorMessage ? true : undefined}
            aria-errormessage={errorId}
            aria-describedby={describedBy}
            className={cn(
              "w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-sm",
              "hover:border-[var(--input-focus-border)]",
              "focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2",
              "transition-base",
              icon ? "pl-10" : "pl-3",
              "pr-3 py-2.5",
              errorMessage && "border-red-500",
              className,
            )}
            {...rest}
          />
        </div>
        {errorMessage && (
          <p id={errorId} className="text-xs text-red-500" role="alert">
            {errorMessage}
          </p>
        )}
        {helperText && !errorMessage && (
          <p id={helperId} className="text-xs text-[var(--muted-foreground)]">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);
