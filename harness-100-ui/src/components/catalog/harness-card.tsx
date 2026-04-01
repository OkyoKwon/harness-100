"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { HarnessMeta } from "@/lib/types";
import { FavoriteToggle } from "@/components/favorites/favorite-toggle";
import { SetupButton } from "@/components/actions/setup-button";
import { ZipButton } from "@/components/actions/zip-button";
import { CATEGORIES } from "@/lib/constants";

interface HarnessCardProps {
  readonly harness: HarnessMeta;
  readonly isFavorite: boolean;
  readonly onToggleFavorite: () => void;
}

export function HarnessCard({ harness, isFavorite, onToggleFavorite }: HarnessCardProps) {
  const router = useRouter();
  const paddedId = String(harness.id).padStart(2, "0");
  const categoryLabel = CATEGORIES.find((c) => c.slug === harness.category)?.label ?? "";

  return (
    <Link
      href={`/harness/${paddedId}`}
      className="block bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 shadow-[var(--shadow-sm)] hover:border-[var(--primary)] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2 transition-base group"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-mono text-[var(--muted-foreground)]">{paddedId}</span>
        <FavoriteToggle active={isFavorite} onClick={onToggleFavorite} size="sm" />
      </div>

      <h3 className="font-semibold mb-1 group-hover:text-[var(--primary)] transition-colors">
        {harness.name}
      </h3>

      <p className="text-xs text-[var(--muted-foreground)] mb-3 line-clamp-2">
        {harness.description}
      </p>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)]">
          👥 {harness.agentCount}명
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)]">
          {categoryLabel}
        </span>
      </div>

      <div className="flex gap-2">
        <SetupButton onClick={() => router.push(`/harness/${paddedId}?action=setup`)} size="sm" />
        <ZipButton onClick={() => router.push(`/harness/${paddedId}?action=zip`)} size="sm" />
      </div>
    </Link>
  );
}
