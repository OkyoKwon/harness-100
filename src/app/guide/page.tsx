"use client";

import { useState } from "react";
import { useLocale } from "@/hooks/use-locale";
import { CodeBlock } from "@/components/guide/code-block";
import { ConceptRelationshipDiagram } from "@/components/common/concept-diagram";

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

export default function GuidePage() {
  const { t } = useLocale();
  const [tocOpen, setTocOpen] = useState(false);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t("guide.title")}</h1>

      {/* Table of Contents */}
      <nav className="mb-8 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
        <button
          type="button"
          onClick={() => setTocOpen((prev) => !prev)}
          className="flex w-full items-center justify-between text-sm font-semibold text-[var(--foreground)] sm:cursor-default"
          aria-expanded={tocOpen}
        >
          {t("guide.toc")}
          <svg
            className={`h-4 w-4 transition-transform sm:hidden ${tocOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <ol className={`mt-3 space-y-1.5 text-sm ${tocOpen ? "block" : "hidden"} sm:block`}>
          {TOC_SECTIONS.map((section, i) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="text-[var(--primary)] hover:underline"
              >
                {i + 1}. {t(section.key)}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <section id="what-is-harness" className="mb-10 scroll-mt-20">
        <h2 className="text-xl font-semibold mb-4">{t("guide.whatIsHarness.title")}</h2>
        <p className="text-[var(--muted-foreground)] leading-relaxed">
          {t("guide.whatIsHarness.body")}
        </p>
      </section>

      <section id="core-concepts" className="mb-10 scroll-mt-20">
        <h2 className="text-xl font-semibold mb-4">{t("guide.coreConcepts.title")}</h2>
        <p className="text-[var(--muted-foreground)] leading-relaxed mb-6">
          {t("guide.coreConcepts.intro")}
        </p>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-[var(--border)]">
            <h3 className="font-semibold mb-2">{t("guide.coreConcepts.agentTitle")}</h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              {t("guide.coreConcepts.agentBody")}
            </p>
          </div>

          <div className="p-4 rounded-lg border border-[var(--border)]">
            <h3 className="font-semibold mb-2">{t("guide.coreConcepts.skillTitle")}</h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              {t("guide.coreConcepts.skillBody")}
            </p>
          </div>

          <div className="p-4 rounded-lg border border-[var(--border)]">
            <h3 className="font-semibold mb-2">{t("guide.coreConcepts.extensionTitle")}</h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              {t("guide.coreConcepts.extensionBody")}
            </p>
          </div>
        </div>

        <ConceptRelationshipDiagram />

        <p className="mt-4 text-sm font-medium text-[var(--muted-foreground)] bg-[var(--muted)] rounded-lg px-4 py-3">
          {t("guide.coreConcepts.summary")}
        </p>
      </section>

      <section id="install" className="mb-10 scroll-mt-20">
        <h2 className="text-xl font-semibold mb-4">{t("guide.install.title")}</h2>

        <div className="space-y-6">
          <div className="p-4 rounded-lg border border-[var(--border)]">
            <h3 className="font-semibold mb-2">{t("guide.install.method1.title")}</h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-3">
              {t("guide.install.method1.desc")}
            </p>
            <ol className="list-decimal list-inside text-sm space-y-1">
              <li>{t("guide.install.method1.step1")}</li>
              <li>{t("guide.install.method1.step2")}</li>
              <li>{t("guide.install.method1.step3")}</li>
            </ol>
          </div>

          <div className="p-4 rounded-lg border border-[var(--border)]">
            <h3 className="font-semibold mb-2">{t("guide.install.method2.title")}</h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-3">
              {t("guide.install.method2.desc")}
            </p>
            <ol className="list-decimal list-inside text-sm space-y-1">
              <li>{t("guide.install.method2.step1")}</li>
              <li>{t("guide.install.method2.step2")}</li>
              <li>{t("guide.install.method2.step3")}</li>
            </ol>
          </div>

          <div className="p-4 rounded-lg border border-[var(--border)]">
            <h3 className="font-semibold mb-2">{t("guide.install.method3.title")}</h3>
            <CodeBlock>{`cp -r {NN}-{harness-name}/.claude/ /path/to/my-project/.claude/
cd /path/to/my-project
claude`}</CodeBlock>
          </div>
        </div>
      </section>

      <section id="usage" className="mb-10 scroll-mt-20">
        <h2 className="text-xl font-semibold mb-4">{t("guide.usage.title")}</h2>
        <p className="text-[var(--muted-foreground)] leading-relaxed mb-4">
          {t("guide.usage.body")}
        </p>
        <ol className="list-decimal list-inside text-sm space-y-1 mb-4">
          <li>{t("guide.usage.step1")}</li>
          <li>{t("guide.usage.step2")}</li>
          <li>{t("guide.usage.step3")}</li>
        </ol>
        <div className="mb-4">
          <CodeBlock>{`cd /path/to/my-project
claude`}</CodeBlock>
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">
          {t("guide.usage.tip")}
        </p>
      </section>

      <section id="modes" className="mb-10 scroll-mt-20">
        <h2 className="text-xl font-semibold mb-4">{t("guide.modes.title")}</h2>
        <p className="text-[var(--muted-foreground)] leading-relaxed mb-4">
          {t("guide.modes.body")}
        </p>
        <div className="space-y-2">
          {(["guide.modes.example1", "guide.modes.example2", "guide.modes.example3"] as const).map((key) => (
            <div key={key} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 text-[var(--primary)]">&#8250;</span>
              <span className="text-[var(--muted-foreground)]">{t(key)}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="file-structure" className="mb-10 scroll-mt-20">
        <h2 className="text-xl font-semibold mb-4">{t("guide.fileStructure.title")}</h2>
        <p className="text-[var(--muted-foreground)] leading-relaxed mb-4">
          {t("guide.fileStructure.body")}
        </p>
        <div className="mb-4">
          <CodeBlock>{`my-project/
└── .claude/
    ├── agents/        # agent-name.md × 4-5
    ├── skills/        # skill-name/skill.md
    └── CLAUDE.md`}</CodeBlock>
        </div>
        <ul className="space-y-1.5 text-sm mb-4">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-[var(--primary)]">&#8226;</span>
            <span className="text-[var(--muted-foreground)]">{t("guide.fileStructure.agents")}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-[var(--primary)]">&#8226;</span>
            <span className="text-[var(--muted-foreground)]">{t("guide.fileStructure.skills")}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-[var(--primary)]">&#8226;</span>
            <span className="text-[var(--muted-foreground)]">{t("guide.fileStructure.claudeMd")}</span>
          </li>
        </ul>
        <p className="text-sm text-[var(--muted-foreground)]">
          {t("guide.fileStructure.customizeTip")}
        </p>
      </section>

      <section id="troubleshooting" className="mb-10 scroll-mt-20">
        <h2 className="text-xl font-semibold mb-4">{t("guide.troubleshooting.title")}</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">{t("guide.troubleshooting.q1")}</h3>
            <p className="text-sm text-[var(--muted-foreground)]">{t("guide.troubleshooting.a1")}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">{t("guide.troubleshooting.q2")}</h3>
            <p className="text-sm text-[var(--muted-foreground)]">{t("guide.troubleshooting.a2")}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">{t("guide.troubleshooting.q3")}</h3>
            <p className="text-sm text-[var(--muted-foreground)]">{t("guide.troubleshooting.a3")}</p>
          </div>
        </div>
      </section>

      <section id="browser" className="mb-10 scroll-mt-20">
        <h2 className="text-xl font-semibold mb-4">{t("guide.browser.title")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 pr-4">{t("guide.browser.feature")}</th>
                <th className="text-left py-2 pr-4">Chrome/Edge</th>
                <th className="text-left py-2 pr-4">Safari</th>
                <th className="text-left py-2">Firefox</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--border)]">
                <td className="py-2 pr-4">{t("guide.browser.catalogBrowse")}</td>
                <td className="py-2 pr-4">✅</td>
                <td className="py-2 pr-4">✅</td>
                <td className="py-2">✅</td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className="py-2 pr-4">{t("guide.browser.favorites")}</td>
                <td className="py-2 pr-4">✅</td>
                <td className="py-2 pr-4">✅</td>
                <td className="py-2">✅</td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className="py-2 pr-4">{t("guide.browser.zipDownload")}</td>
                <td className="py-2 pr-4">✅</td>
                <td className="py-2 pr-4">✅</td>
                <td className="py-2">✅</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">{t("guide.browser.localSetup")}</td>
                <td className="py-2 pr-4">✅</td>
                <td className="py-2 pr-4">{t("guide.browser.zipFallback")}</td>
                <td className="py-2">{t("guide.browser.zipFallback")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="faq" className="mb-10 scroll-mt-20">
        <h2 className="text-xl font-semibold mb-4">{t("guide.faq.title")}</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">
              {t("guide.faq.q1")}
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              {t("guide.faq.a1")}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">
              {t("guide.faq.q2")}
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              {t("guide.faq.a2")}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">
              {t("guide.faq.q3")}
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              {t("guide.faq.a3")}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
