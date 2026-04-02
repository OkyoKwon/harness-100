"use client";

import { useEffect, useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import matter from "gray-matter";
import { useLocale } from "@/hooks/use-locale";

interface MarkdownViewerProps {
  readonly title: string;
  readonly content: string;
  readonly open: boolean;
  readonly onClose: () => void;
}

function FrontmatterTable({
  data,
}: {
  readonly data: Record<string, unknown>;
}) {
  const entries = Object.entries(data);
  if (entries.length === 0) return null;

  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-[var(--border)]">
      <table className="w-full text-sm">
        <tbody>
          {entries.map(([key, value]) => (
            <tr key={key} className="border-b border-[var(--border)] last:border-b-0">
              <td className="bg-[var(--muted)] px-3 py-1.5 font-medium text-[var(--muted-foreground)]">
                {key}
              </td>
              <td className="px-3 py-1.5 text-[var(--card-foreground)]">
                {Array.isArray(value) ? value.join(", ") : String(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function MarkdownViewer({
  title,
  content,
  open,
  onClose,
}: MarkdownViewerProps) {
  const { t } = useLocale();
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = "md-viewer-title";

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // Focus trap
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
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

    // Focus the close button on open
    const timer = setTimeout(() => {
      const closeBtn = dialogRef.current?.querySelector<HTMLElement>("button");
      closeBtn?.focus();
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

  const parsed = matter(content);

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
          <h3 id={titleId} className="text-base font-semibold text-[var(--foreground)]">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-base focus-ring"
            aria-label={t("a11y.close")}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <FrontmatterTable data={parsed.data} />
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {parsed.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
