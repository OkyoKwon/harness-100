"use client";

import { useState } from "react";
import { CopyCliButton } from "@/components/actions/copy-cli-button";

interface CompletionBannerProps {
  readonly type: "setup" | "zip";
  readonly harnessName: string;
  readonly path?: string;
  readonly slug: string;
  readonly filesWritten?: number;
}

export function CompletionBanner({
  type,
  harnessName,
  path,
  slug,
  filesWritten,
}: CompletionBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const cliCommand = `claude --skill ${slug}`;

  return (
    <div className="relative rounded-lg border border-green-200 bg-green-50 p-4">
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-3 text-gray-400 transition-colors hover:text-gray-600"
        aria-label="닫기"
      >
        ✕
      </button>

      <div className="pr-8">
        {type === "setup" ? (
          <>
            <p className="text-sm font-semibold text-green-800">
              ✅ 세팅 완료! {path}/.claude/ 에 설치됨
            </p>
            {filesWritten !== undefined && (
              <p className="mt-1 text-xs text-green-700">
                {filesWritten}개 파일이 생성되었습니다.
              </p>
            )}
            <div className="mt-3 flex items-center gap-2">
              <code className="rounded bg-gray-900 px-3 py-1.5 text-xs text-green-400">
                cd {path} && {cliCommand}
              </code>
              <CopyCliButton text={`cd ${path} && ${cliCommand}`} />
            </div>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-green-800">
              ✅ {slug}.zip 다운로드 완료!
            </p>
            <p className="mt-1 text-xs text-green-700">
              압축을 풀고 프로젝트 루트에 .claude/ 폴더를 복사하세요.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <code className="rounded bg-gray-900 px-3 py-1.5 text-xs text-green-400">
                unzip {slug}.zip && {cliCommand}
              </code>
              <CopyCliButton text={`unzip ${slug}.zip && ${cliCommand}`} />
            </div>
          </>
        )}

        <div className="mt-3 rounded border border-blue-200 bg-blue-50 px-3 py-2">
          <p className="text-xs text-blue-800">
            💡 <span className="font-medium">Tip:</span> Claude CLI에서{" "}
            <code className="rounded bg-blue-100 px-1 font-mono text-xs">
              /{harnessName}
            </code>{" "}
            스킬을 호출하면 에이전트가 순서대로 실행됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
