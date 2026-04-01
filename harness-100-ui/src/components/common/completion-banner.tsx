"use client";

import { useState } from "react";
import { CopyCliButton } from "@/components/actions/copy-cli-button";
import { buildCliCommand } from "@/lib/cli";

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

  if (dismissed) return null;

  const cliCommand = buildCliCommand(slug);

  return (
    <div className="relative rounded-lg border border-[var(--success-border)] bg-[var(--success-bg)] p-4">
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-3 text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        aria-label="닫기"
      >
        ✕
      </button>

      <div className="pr-8">
        {type === "setup" ? (
          <>
            <p className="text-sm font-semibold text-[var(--success-foreground)]">
              ✅ 세팅 완료! {path}/.claude/ 에 설치됨
            </p>
            {filesWritten !== undefined && (
              <p className="mt-1 text-xs text-[var(--success-foreground)]">
                {filesWritten}개 파일이 생성되었습니다.
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
              ✅ {slug}.zip 다운로드 완료!
            </p>
            <p className="mt-1 text-xs text-[var(--success-foreground)]">
              압축을 풀고 프로젝트 루트에 .claude/ 폴더를 복사하세요.
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
            💡 <span className="font-medium">Tip:</span> Claude CLI에서{" "}
            <code className="rounded bg-[var(--badge-tool-bg)] px-1 font-mono text-xs">
              /{slug}
            </code>{" "}
            스킬을 호출하면 에이전트가 순서대로 실행됩니다. 스킬이
            보이지 않으면 Claude 세션을 재시작(/exit 후 다시 실행)해
            보세요.
          </p>
        </div>
      </div>
    </div>
  );
}
