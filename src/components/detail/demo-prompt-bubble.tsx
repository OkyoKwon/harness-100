"use client";

interface DemoPromptBubbleProps {
  readonly prompt: string;
  readonly label: string;
}

export function DemoPromptBubble({ prompt, label }: DemoPromptBubbleProps) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm"
        aria-hidden="true"
      >
        U
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-[var(--muted)] mb-1">{label}</p>
        <div className="rounded-xl rounded-tl-sm bg-[var(--card)] border border-[var(--border)] px-4 py-3 text-sm text-[var(--foreground)]">
          &ldquo;{prompt}&rdquo;
        </div>
      </div>
    </div>
  );
}
