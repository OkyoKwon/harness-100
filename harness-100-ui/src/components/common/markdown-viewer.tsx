"use client";

import { useEffect, useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import matter from "gray-matter";

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

export function MarkdownViewer({
  title,
  content,
  open,
  onClose,
}: MarkdownViewerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
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
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
          <h3 className="text-base font-semibold text-[var(--foreground)]">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-base focus-ring"
            aria-label="닫기"
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
