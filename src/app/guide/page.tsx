"use client";

import { useLocale } from "@/hooks/use-locale";

export default function GuidePage() {
  const { t } = useLocale();

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t("guide.title")}</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">{t("guide.whatIsHarness.title")}</h2>
        <p className="text-[var(--muted-foreground)] leading-relaxed">
          {t("guide.whatIsHarness.body")}
        </p>
      </section>

      <section className="mb-10">
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
            <pre className="bg-[var(--muted)] p-3 rounded text-sm overflow-x-auto">
{`cp -r {NN}-{harness-name}/.claude/ /path/to/my-project/.claude/
cd /path/to/my-project
claude`}
            </pre>
          </div>
        </div>
      </section>

      <section className="mb-10">
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

      <section className="mb-10">
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
