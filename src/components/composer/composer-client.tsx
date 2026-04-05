"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { HarnessMeta } from "@/lib/types";
import { loadCatalog } from "@/lib/harness-loader";
import { useLocale } from "@/hooks/use-locale";
import { useToast } from "@/hooks/use-toast";
import { useComposer } from "@/hooks/use-composer";
import { HarnessSelector } from "@/components/composer/harness-selector";
import { CompositionPreview } from "@/components/composer/composition-preview";

function parseComposeParam(param: string | null): ReadonlyArray<number> {
  if (!param) return [];
  return param
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n >= 1 && n <= 100);
}

function buildComposeParam(ids: ReadonlyArray<number>): string {
  return ids.map((id) => String(id).padStart(2, "0")).join(",");
}

export function ComposerClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, locale } = useLocale();
  const { addToast } = useToast();

  const [catalog, setCatalog] = useState<ReadonlyArray<HarnessMeta>>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const {
    selectedIds,
    loadedHarnesses,
    merged,
    loading,
    addHarness,
    removeHarness,
    clear,
    setSelectedIds,
  } = useComposer();

  // Load catalog on mount
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await loadCatalog(locale);
        if (!cancelled) setCatalog(data);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load catalog:", error);
          setCatalogError(t("composer.catalogError"));
        }
      }
    };

    load();
    return () => { cancelled = true; };
  }, [locale, t]);

  // Restore selection from URL on mount
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (initialized) return;
    const composeParam = searchParams.get("compose");
    const ids = parseComposeParam(composeParam);
    if (ids.length > 0) {
      setSelectedIds(ids);
    }
    setInitialized(true);
  }, [searchParams, initialized, setSelectedIds]);

  // Sync selectedIds to URL
  useEffect(() => {
    if (!initialized) return;

    const currentParam = searchParams.get("compose") ?? "";
    const newParam = selectedIds.length > 0 ? buildComposeParam(selectedIds) : "";

    if (currentParam !== newParam) {
      const params = new URLSearchParams(searchParams.toString());
      if (newParam) {
        params.set("compose", newParam);
      } else {
        params.delete("compose");
      }
      const queryString = params.toString();
      router.replace(queryString ? `?${queryString}` : "/composer", {
        scroll: false,
      });
    }
  }, [selectedIds, initialized, searchParams, router]);

  const handleAdd = useCallback(
    (id: number) => addHarness(id),
    [addHarness],
  );

  const handleRemove = useCallback(
    (id: number) => removeHarness(id),
    [removeHarness],
  );

  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      addToast(t("composer.urlCopied"), "success");
    } catch {
      // Fallback
      try {
        const textarea = document.createElement("textarea");
        textarea.value = window.location.href;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        addToast(t("composer.urlCopied"), "success");
      } catch {
        // silent
      }
    }
  }, [addToast, t]);

  if (catalogError) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">{catalogError}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            {t("composer.title")}
          </h1>
          <p className="mt-2 text-[var(--muted-foreground)]">
            {t("composer.description")}
          </p>
        </div>
        {selectedIds.length > 0 && (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleCopyUrl}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] active:bg-[var(--secondary)] transition-base focus-ring"
            >
              {t("composer.copyUrl")}
            </button>
            <button
              type="button"
              onClick={clear}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] active:bg-[var(--secondary)] transition-base focus-ring"
            >
              {t("composer.reset")}
            </button>
          </div>
        )}
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch" style={{ minHeight: "70vh" }}>
        {/* Left panel: Selector */}
        <div className="w-full shrink-0 lg:w-[350px]">
          <HarnessSelector
            catalog={catalog}
            selectedIds={selectedIds}
            onAdd={handleAdd}
            onRemove={handleRemove}
          />
        </div>

        {/* Right panel: Preview */}
        <div className="min-w-0 flex-1">
          <CompositionPreview
            merged={merged}
            loading={loading}
            selectedCount={selectedIds.length}
            loadedHarnesses={loadedHarnesses}
          />
        </div>
      </div>
    </main>
  );
}
