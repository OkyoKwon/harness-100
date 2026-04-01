import { Suspense } from "react";
import { ComposerClient } from "@/components/composer/composer-client";

function ComposerSkeleton() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-[var(--muted)]" />
        <div className="h-4 w-96 rounded bg-[var(--muted)]" />
        <div className="flex flex-col gap-4 lg:flex-row" style={{ minHeight: "70vh" }}>
          <div className="w-full shrink-0 lg:w-[350px] rounded-lg border border-[var(--border)] bg-[var(--card)]" />
          <div className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)]" />
        </div>
      </div>
    </main>
  );
}

export default function ComposerPage() {
  return (
    <Suspense fallback={<ComposerSkeleton />}>
      <ComposerClient />
    </Suspense>
  );
}
