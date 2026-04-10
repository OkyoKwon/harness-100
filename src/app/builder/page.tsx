import { Suspense } from "react";
import { BuilderClient } from "@/components/builder/builder-client";

function BuilderSkeleton() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-64 rounded bg-[var(--muted)]" />
        <div className="h-4 w-96 rounded bg-[var(--muted)]" />
        <div className="mt-8 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-[var(--muted)]" />
          ))}
        </div>
      </div>
    </main>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<BuilderSkeleton />}>
      <BuilderClient />
    </Suspense>
  );
}
