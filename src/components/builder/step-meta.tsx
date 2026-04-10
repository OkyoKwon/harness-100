import { useLocale } from "@/hooks/use-locale";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { GuideBanner } from "./guide-banner";
import { AiAssistButton } from "./ai-assist-button";
import { CATEGORIES } from "@/lib/constants";
import { generateHarnessDescription } from "@/lib/ai-assist";
import type { useBuilderMeta } from "@/hooks/use-builder-meta";
import type { useAiAssist } from "@/hooks/use-ai-assist";

interface StepMetaProps {
  readonly hook: ReturnType<typeof useBuilderMeta>;
  readonly ai: ReturnType<typeof useAiAssist>;
}

export function StepMeta({ hook, ai }: StepMetaProps) {
  const { t, locale } = useLocale();
  const { addToast } = useToast();
  const { meta, errors, updateField, setCategory } = hook;

  const handleGenerateDescription = async () => {
    if (!ai.isConfigured) { addToast(t("ai.error.noKey"), "error"); return; }
    if (!meta.name.trim()) { addToast(t("ai.error.noName"), "error"); return; }

    const result = await ai.runAssist((key) =>
      generateHarnessDescription(key, meta, locale),
    );

    if (result?.success && result.text) {
      updateField("description", result.text);
      addToast(t("ai.applied"), "success");
    } else if (result?.error) {
      addToast(t(result.error), "error");
    }
  };

  return (
    <div className="space-y-6">
      <GuideBanner id="step-meta">
        <p>{t("builder.guide.meta")}</p>
      </GuideBanner>

      <Input
        label={t("builder.meta.name")}
        value={meta.name}
        onChange={(e) => updateField("name", e.target.value)}
        placeholder="PR Review Automation"
        helperText={t("builder.meta.nameHelper")}
        errorMessage={errors.name ? t(errors.name) : undefined}
        maxLength={60}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[var(--foreground)]">
            {t("builder.meta.description")}
          </label>
          {ai.isConfigured && (
            <AiAssistButton
              onClick={handleGenerateDescription}
              loading={ai.loading}
              disabled={!meta.name.trim()}
              size="md"
            />
          )}
        </div>
        <Textarea
          value={meta.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder={locale === "ko" ? "이 하네스가 수행하는 작업을 설명하세요..." : "Describe what this harness does..."}
          helperText={t("builder.meta.descHelper")}
          errorMessage={errors.description ? t(errors.description) : undefined}
          maxLength={500}
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[var(--foreground)]">
          {t("builder.meta.category")}
        </label>
        <Select
          value={meta.category}
          onChange={(e) => setCategory(e.target.value as never)}
        >
          <option value="">{locale === "ko" ? "카테고리 선택..." : "Select category..."}</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {locale === "ko" ? cat.label : cat.labelEn}
            </option>
          ))}
        </Select>
        {errors.category && (
          <p className="text-xs text-red-500" role="alert">{t(errors.category)}</p>
        )}
        <p className="text-xs text-[var(--muted-foreground)]">{t("builder.meta.categoryHelper")}</p>
      </div>

    </div>
  );
}
