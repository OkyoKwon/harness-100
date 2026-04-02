import { cn } from "@/lib/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly hoverable?: boolean;
}

export function Card({ hoverable = false, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg shadow-[var(--card-shadow)]",
        hoverable &&
          "hover:border-[var(--card-hover-border)] hover:shadow-[var(--card-hover-shadow)] hover:-translate-y-1 transition-base",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border-b border-[var(--card-border)] px-5 py-3", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-4", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border-t border-[var(--card-border)] px-5 py-3", className)}
      {...rest}
    >
      {children}
    </div>
  );
}
