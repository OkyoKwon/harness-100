import type { Metadata } from "next";
import "@/styles/globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Harness 100 — AI 에이전트 팀 하네스",
  description: "100개의 에이전트 팀 워크플로우를 골라서 바로 적용하세요",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen">
        <header className="sticky top-0 z-50 bg-[var(--background)] border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="text-lg font-bold focus-ring rounded">
              Harness 100
            </Link>
            <nav className="flex items-center gap-4 text-sm">
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
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
