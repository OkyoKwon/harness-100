"use client";

import { useMemo } from "react";
import { useLocale } from "@/hooks/use-locale";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/guide/code-block";
import { GuideHero } from "@/components/guide/guide-hero";
import { GuideTocSidebar } from "@/components/guide/guide-toc-sidebar";
import { GuideConceptCards } from "@/components/guide/guide-concept-cards";
import { GuideInstallStepper } from "@/components/guide/guide-install-stepper";
import { GuideAccordion } from "@/components/guide/guide-accordion";
import { GuideFileTree } from "@/components/guide/guide-file-tree";

const TOC_SECTIONS = [
  { id: "what-is-harness", key: "guide.whatIsHarness.title" },
  { id: "core-concepts", key: "guide.coreConcepts.title" },
  { id: "install", key: "guide.install.title" },
  { id: "usage", key: "guide.usage.title" },
  { id: "modes", key: "guide.modes.title" },
  { id: "file-structure", key: "guide.fileStructure.title" },
  { id: "troubleshooting", key: "guide.troubleshooting.title" },
  { id: "browser", key: "guide.browser.title" },
  { id: "faq", key: "guide.faq.title" },
] as const;

const MODES = [
  { titleKey: "guide.modes.example1.title", descKey: "guide.modes.example1.desc" },
  { titleKey: "guide.modes.example2.title", descKey: "guide.modes.example2.desc" },
  { titleKey: "guide.modes.example3.title", descKey: "guide.modes.example3.desc" },
] as const;

export default function GuidePage() {
  const { t } = useLocale();

  const troubleshootingItems = useMemo(
    () => [
      { id: "ts-1", question: t("guide.troubleshooting.q1"), answer: t("guide.troubleshooting.a1") },
      { id: "ts-2", question: t("guide.troubleshooting.q2"), answer: t("guide.troubleshooting.a2") },
      { id: "ts-3", question: t("guide.troubleshooting.q3"), answer: t("guide.troubleshooting.a3") },
    ],
    [t],
  );

  const faqItems = useMemo(
    () => [
      { id: "faq-1", question: t("guide.faq.q1"), answer: t("guide.faq.a1") },
      { id: "faq-2", question: t("guide.faq.q2"), answer: t("guide.faq.a2") },
      { id: "faq-3", question: t("guide.faq.q3"), answer: t("guide.faq.a3") },
    ],
    [t],
  );

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero */}
      <GuideHero />

      {/* Two-column layout: TOC sidebar + content */}
      <div className="lg:grid lg:grid-cols-[14rem_1fr] lg:gap-8">
        <GuideTocSidebar sections={TOC_SECTIONS} />

        <div>
          {/* 1. What is a Harness */}
          <section id="what-is-harness" className="mb-10 scroll-mt-20">
            <h2 className="text-xl font-semibold mb-4">{t("guide.whatIsHarness.title")}</h2>
            <div className="rounded-lg border-l-4 border-[var(--primary)] bg-[var(--card-bg)] border border-[var(--card-border)] p-4">
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                {t("guide.whatIsHarness.body")}
              </p>
            </div>
          </section>

          {/* 2. Core Concepts */}
          <GuideConceptCards />

          {/* 3. Installation */}
          <GuideInstallStepper />

          {/* 4. How to Use */}
          <section id="usage" className="mb-10 scroll-mt-20">
            <h2 className="text-xl font-semibold mb-4">{t("guide.usage.title")}</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed mb-4">
              {t("guide.usage.body")}
            </p>

            <div className="space-y-3 mb-4">
              {(["guide.usage.step1", "guide.usage.step2", "guide.usage.step3"] as const).map(
                (key, i) => (
                  <div key={key} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--button-primary-bg)] text-[var(--button-primary-fg)] text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm text-[var(--muted-foreground)] pt-0.5">{t(key)}</span>
                  </div>
                ),
              )}
            </div>

            <div className="mb-4">
              <CodeBlock>{`cd /path/to/my-project
claude`}</CodeBlock>
            </div>

            <div className="rounded-lg border border-[var(--info-border)] bg-[var(--info-bg)] px-4 py-3">
              <p className="text-sm text-[var(--info-foreground)]">
                {t("guide.usage.tip")}
              </p>
            </div>
          </section>

          {/* 5. Execution Modes */}
          <section id="modes" className="mb-10 scroll-mt-20">
            <h2 className="text-xl font-semibold mb-4">{t("guide.modes.title")}</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed mb-4">
              {t("guide.modes.body")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {MODES.map((mode) => (
                <Card key={mode.titleKey} hoverable>
                  <CardBody className="p-3">
                    <Badge variant="tool" className="mb-2">{t(mode.titleKey)}</Badge>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                      {t(mode.descKey)}
                    </p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </section>

          {/* 6. File Structure */}
          <GuideFileTree />

          {/* 7. Troubleshooting */}
          <section id="troubleshooting" className="mb-10 scroll-mt-20">
            <h2 className="text-xl font-semibold mb-4">{t("guide.troubleshooting.title")}</h2>
            <GuideAccordion items={troubleshootingItems} />
          </section>

          {/* 8. Browser Compatibility */}
          <section id="browser" className="mb-10 scroll-mt-20">
            <h2 className="text-xl font-semibold mb-4">{t("guide.browser.title")}</h2>
            <Card>
              <CardBody className="p-0 overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--card-border)]">
                      <th className="text-left py-2.5 px-4 font-medium">{t("guide.browser.feature")}</th>
                      <th className="text-left py-2.5 px-4 font-medium">Chrome/Edge</th>
                      <th className="text-left py-2.5 px-4 font-medium">Safari</th>
                      <th className="text-left py-2.5 px-4 font-medium">Firefox</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[var(--card-border)] even:bg-[var(--muted)]">
                      <td className="py-2.5 px-4">{t("guide.browser.catalogBrowse")}</td>
                      <td className="py-2.5 px-4">✅</td>
                      <td className="py-2.5 px-4">✅</td>
                      <td className="py-2.5 px-4">✅</td>
                    </tr>
                    <tr className="border-b border-[var(--card-border)] even:bg-[var(--muted)]">
                      <td className="py-2.5 px-4">{t("guide.browser.favorites")}</td>
                      <td className="py-2.5 px-4">✅</td>
                      <td className="py-2.5 px-4">✅</td>
                      <td className="py-2.5 px-4">✅</td>
                    </tr>
                    <tr className="border-b border-[var(--card-border)] even:bg-[var(--muted)]">
                      <td className="py-2.5 px-4">{t("guide.browser.zipDownload")}</td>
                      <td className="py-2.5 px-4">✅</td>
                      <td className="py-2.5 px-4">✅</td>
                      <td className="py-2.5 px-4">✅</td>
                    </tr>
                    <tr className="even:bg-[var(--muted)]">
                      <td className="py-2.5 px-4">{t("guide.browser.localSetup")}</td>
                      <td className="py-2.5 px-4">✅</td>
                      <td className="py-2.5 px-4">{t("guide.browser.zipFallback")}</td>
                      <td className="py-2.5 px-4">{t("guide.browser.zipFallback")}</td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </section>

          {/* 9. FAQ */}
          <section id="faq" className="mb-10 scroll-mt-20">
            <h2 className="text-xl font-semibold mb-4">{t("guide.faq.title")}</h2>
            <GuideAccordion items={faqItems} />
          </section>
        </div>
      </div>
    </main>
  );
}
