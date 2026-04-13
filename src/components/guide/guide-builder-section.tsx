"use client";

import Link from "next/link";
import { useLocale } from "@/hooks/use-locale";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STEPS = [
  { num: 1, titleKey: "guide.builder.step1.title", descKey: "guide.builder.step1.desc", icon: "📝" },
  { num: 2, titleKey: "guide.builder.step2.title", descKey: "guide.builder.step2.desc", icon: "🤖" },
  { num: 3, titleKey: "guide.builder.step3.title", descKey: "guide.builder.step3.desc", icon: "🎯" },
  { num: 4, titleKey: "guide.builder.step4.title", descKey: "guide.builder.step4.desc", icon: "✅" },
] as const;

export function GuideBuilderSection() {
  const { t } = useLocale();

  return (
    <section id="builder" className="mb-10 scroll-mt-20">
      <h2 className="text-xl font-semibold mb-4">{t("guide.builder.title")}</h2>
      <p className="text-[var(--muted-foreground)] leading-relaxed mb-6">
        {t("guide.builder.intro")}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {STEPS.map((step) => (
          <Card key={step.num}>
            <CardBody className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--button-primary-bg)] text-[var(--button-primary-fg)] text-[10px] font-bold">
                  {step.num}
                </span>
                <span role="img" aria-hidden="true">{step.icon}</span>
                <Badge variant="tool">{t(step.titleKey)}</Badge>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                {t(step.descKey)}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* AI Assist tip */}
      <div className="rounded-lg border border-[var(--info-border)] bg-[var(--info-bg)] px-4 py-3 mb-3">
        <p className="text-sm text-[var(--info-foreground)]">
          {t("guide.builder.aiAssist")}
        </p>
      </div>

      {/* Clone tip */}
      <div className="rounded-lg border border-[var(--info-border)] bg-[var(--info-bg)] px-4 py-3 mb-4">
        <p className="text-sm text-[var(--info-foreground)]">
          {t("guide.builder.cloneTip")}
        </p>
      </div>

      {/* CTA */}
      <Link
        href="/builder"
        className="inline-flex items-center rounded-lg bg-[var(--button-primary-bg)] text-[var(--button-primary-fg)] px-4 py-2 text-sm font-medium hover:brightness-110 active:brightness-95 transition-base"
      >
        {t("guide.builder.cta")}
      </Link>
    </section>
  );
}
