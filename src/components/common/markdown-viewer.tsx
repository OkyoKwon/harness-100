"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import matter from "gray-matter";
import { useLocale } from "@/hooks/use-locale";
import { Modal, ModalBody } from "@/components/ui";
import { IconButton } from "@/components/ui";

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
  const { t } = useLocale();
  const parsed = matter(content);

  return (
    <Modal open={open} onClose={onClose} ariaLabelledBy="md-viewer-title">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
        <h3 id="md-viewer-title" className="text-base font-semibold text-[var(--foreground)]">
          {title}
        </h3>
        <IconButton ariaLabel={t("a11y.close")} onClick={onClose}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </IconButton>
      </div>

      {/* Body */}
      <ModalBody>
        <FrontmatterTable data={parsed.data} />
        <div className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {parsed.content}
          </ReactMarkdown>
        </div>
      </ModalBody>
    </Modal>
  );
}
