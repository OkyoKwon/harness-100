import { forwardRef } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  readonly icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ icon, className, ...rest }, ref) {
    return (
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--input-placeholder)]">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-sm",
            "hover:border-[var(--input-focus-border)]",
            "focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2",
            "transition-base",
            icon ? "pl-10" : "pl-3",
            "pr-3 py-2.5",
            className,
          )}
          {...rest}
        />
      </div>
    );
  },
);
