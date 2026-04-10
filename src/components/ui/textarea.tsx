import { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  readonly helperText?: string;
  readonly errorMessage?: string;
  readonly label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ helperText, errorMessage, label, className, id: idProp, ...rest }, ref) {
    const autoId = useId();
    const textareaId = idProp ?? autoId;
    const helperId = helperText ? `${textareaId}-helper` : undefined;
    const errorId = errorMessage ? `${textareaId}-error` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-[var(--foreground)]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={errorMessage ? true : undefined}
          aria-errormessage={errorId}
          aria-describedby={describedBy}
          className={cn(
            "w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-sm",
            "hover:border-[var(--input-focus-border)]",
            "focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2",
            "transition-base resize-y",
            "px-3 py-2.5",
            "min-h-[80px]",
            errorMessage && "border-red-500",
            className,
          )}
          {...rest}
        />
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
