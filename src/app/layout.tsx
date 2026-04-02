import type { Metadata } from "next";
import "@/styles/globals.css";
import { Header } from "@/components/common/header";
import { LanguageProvider } from "@/hooks/use-locale";
import { ToastProvider } from "@/components/common/toast-provider";

export const metadata: Metadata = {
  title: "Harness 100 — AI Agent Team Harness",
  description: "Browse and apply 100 agent team workflows instantly",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
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

const langScript = `
(function(){
  try {
    var l = localStorage.getItem('harness100_lang');
    if (l === 'ko' || l === 'en') {
      document.documentElement.lang = l;
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
        <script dangerouslySetInnerHTML={{ __html: langScript }} />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen">
        <LanguageProvider>
          <Header />
          <ToastProvider>
            {children}
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
