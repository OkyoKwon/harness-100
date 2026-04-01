import type { Metadata } from "next";
import "@/styles/globals.css";
import Link from "next/link";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { ToastProvider } from "@/components/common/toast-provider";

export const metadata: Metadata = {
  title: "Harness 100 — AI 에이전트 팀 하네스",
  description: "100개의 에이전트 팀 워크플로우를 골라서 바로 적용하세요",
};

const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('harness100_theme');
    if (t === 'dark' || t === 'light') {
      document.documentElement.setAttribute('data-theme', t);
    }
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen">
        {/* Skip navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-[var(--primary)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[var(--primary-foreground)]"
        >
          본문으로 건너뛰기
        </a>

        <header className="sticky top-0 z-50 bg-[var(--background)] border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="text-lg font-bold focus-ring rounded">
              Harness 100
            </Link>
            <nav className="flex items-center gap-3 text-sm">
              <Link
                href="/ranking"
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-base focus-ring rounded px-1"
              >
                랭킹
              </Link>
              <Link
                href="/composer"
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-base focus-ring rounded px-1"
              >
                조합기
              </Link>
              <Link
                href="/guide"
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-base focus-ring rounded px-1"
              >
                가이드
              </Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
