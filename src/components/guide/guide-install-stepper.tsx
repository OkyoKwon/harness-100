"use client";

import { useLocale } from "@/hooks/use-locale";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/guide/code-block";

export function GuideInstallStepper() {
  const { t } = useLocale();

  return (
    <section id="install" className="mb-10 scroll-mt-20">
      <h2 className="text-xl font-semibold mb-6">{t("guide.install.title")}</h2>

      <div className="space-y-4">
        {/* Method 1: Setup */}
        <Card>
          <CardBody>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--button-primary-bg)] text-[var(--button-primary-fg)] text-xs font-bold">
                1
              </span>
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
          </CardBody>
        </Card>

        {/* Method 2: ZIP */}
        <Card>
          <CardBody>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--button-primary-bg)] text-[var(--button-primary-fg)] text-xs font-bold">
                2
              </span>
              <h3 className="font-semibold">{t("guide.install.method2.title")}</h3>
            </div>
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
          </CardBody>
        </Card>

        {/* Method 3: CLI */}
        <Card>
          <CardBody>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--button-primary-bg)] text-[var(--button-primary-fg)] text-xs font-bold">
                3
              </span>
              <h3 className="font-semibold">{t("guide.install.method3.title")}</h3>
            </div>
            <CodeBlock>{`cp -r {NN}-{harness-name}/.claude/ /path/to/my-project/.claude/
cd /path/to/my-project
claude`}</CodeBlock>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}
