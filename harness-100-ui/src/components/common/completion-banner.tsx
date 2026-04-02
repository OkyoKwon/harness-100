"use client";

import { useState } from "react";
import { CopyCliButton } from "@/components/actions/copy-cli-button";
import { buildCliCommand } from "@/lib/cli";
import { useLocale } from "@/hooks/use-locale";

interface CompletionBannerProps {
  readonly type: "setup" | "zip";
  readonly path?: string;
  readonly slug: string;
  readonly filesWritten?: number;
}

export function CompletionBanner({
  type,
  path,
  slug,
  filesWritten,
}: CompletionBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const { t } = useLocale();

  if (dismissed) return null;

  const cliCommand = buildCliCommand(slug);

  return (
    <div className="relative rounded-lg border border-[var(--success-border)] bg-[var(--success-bg)] p-4">
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-3 text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        aria-label={t("a11y.close")}
      >
        ✕
      </button>

      <div className="pr-8">
        {type === "setup" ? (
          <>
            <p className="text-sm font-semibold text-[var(--success-foreground)]">
              {t("completion.setupDone", { path: path ?? "" })}
            </p>
            {filesWritten !== undefined && (
              <p className="mt-1 text-xs text-[var(--success-foreground)]">
                {t("completion.filesCreated", { count: filesWritten ?? 0 })}
              </p>
            )}
            <div className="mt-3 flex items-center gap-2">
              <code className="rounded bg-[var(--code-bg)] px-3 py-1.5 text-xs text-[var(--success)]">
                cd {path} && {cliCommand}
              </code>
              <CopyCliButton text={`cd ${path} && ${cliCommand}`} />
            </div>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-[var(--success-foreground)]">
              {t("completion.zipDone", { slug })}
            </p>
            <p className="mt-1 text-xs text-[var(--success-foreground)]">
              {t("completion.unzipHint")}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <code className="rounded bg-[var(--code-bg)] px-3 py-1.5 text-xs text-[var(--success)]">
                unzip {slug}.zip && {cliCommand}
              </code>
              <CopyCliButton text={`unzip ${slug}.zip && ${cliCommand}`} />
            </div>
          </>
        )}

        <div className="mt-3 rounded border border-[var(--info-border)] bg-[var(--info-bg)] px-3 py-2">
          <p className="text-xs text-[var(--info-foreground)]">
            {t("completion.tipText")}
          </p>
        </div>
      </div>
    </div>
  );
}
