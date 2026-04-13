"use client";

import { useLocale } from "@/hooks/use-locale";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/guide/code-block";

interface StepProps {
  readonly stepNumber: number;
  readonly isLast: boolean;
  readonly children: React.ReactNode;
}

function Step({ stepNumber, isLast, children }: StepProps) {
  return (
    <div className="relative flex gap-4">
      {/* Vertical line */}
      {!isLast && (
        <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-[var(--border)]" />
      )}
      {/* Number circle */}
      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--button-primary-bg)] text-[var(--button-primary-fg)] text-sm font-bold">
        {stepNumber}
      </div>
      {/* Content */}
      <div className="flex-1 pb-6">{children}</div>
    </div>
  );
}

export function GuideInstallStepper() {
  const { t } = useLocale();

  return (
    <section id="install" className="mb-10 scroll-mt-20">
      <h2 className="text-xl font-semibold mb-6">{t("guide.install.title")}</h2>

      <div className="space-y-0">
        {/* Method 1: Setup */}
        <Step stepNumber={1} isLast={false}>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold">{t("guide.install.method1.title")}</h3>
            <Badge variant="framework">{t("guide.install.recommended")}</Badge>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mb-3">
            {t("guide.install.method1.desc")}
          </p>
          <ol className="space-y-1.5">
            {(["guide.install.method1.step1", "guide.install.method1.step2", "guide.install.method1.step3"] as const).map(
              (key, i) => (
                <li key={key} className="flex items-start gap-2 text-sm">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-[10px] font-medium text-[var(--muted-foreground)]">
                    {i + 1}
                  </span>
                  <span className="text-[var(--muted-foreground)]">{t(key)}</span>
                </li>
              ),
            )}
          </ol>
        </Step>

        {/* Method 2: ZIP */}
        <Step stepNumber={2} isLast={false}>
          <h3 className="font-semibold mb-2">{t("guide.install.method2.title")}</h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-3">
            {t("guide.install.method2.desc")}
          </p>
          <ol className="space-y-1.5">
            {(["guide.install.method2.step1", "guide.install.method2.step2", "guide.install.method2.step3"] as const).map(
              (key, i) => (
                <li key={key} className="flex items-start gap-2 text-sm">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-[10px] font-medium text-[var(--muted-foreground)]">
                    {i + 1}
                  </span>
                  <span className="text-[var(--muted-foreground)]">{t(key)}</span>
                </li>
              ),
            )}
          </ol>
        </Step>

        {/* Method 3: CLI */}
        <Step stepNumber={3} isLast>
          <h3 className="font-semibold mb-2">{t("guide.install.method3.title")}</h3>
          <CodeBlock>{`cp -r {NN}-{harness-name}/.claude/ /path/to/my-project/.claude/
cd /path/to/my-project
claude`}</CodeBlock>
        </Step>
      </div>
    </section>
  );
}
