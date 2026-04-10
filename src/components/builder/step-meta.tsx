import { useLocale } from "@/hooks/use-locale";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { TagInput } from "@/components/ui/tag-input";
import { GuideBanner } from "./guide-banner";
import { CATEGORIES } from "@/lib/constants";
import type { useBuilderMeta } from "@/hooks/use-builder-meta";

interface StepMetaProps {
  readonly hook: ReturnType<typeof useBuilderMeta>;
}

export function StepMeta({ hook }: StepMetaProps) {
  const { t, locale } = useLocale();
  const { meta, errors, updateField, setCategory, setFrameworks } = hook;

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

      <Textarea
        label={t("builder.meta.description")}
        value={meta.description}
        onChange={(e) => updateField("description", e.target.value)}
        placeholder={locale === "ko" ? "이 하네스가 수행하는 작업을 설명하세요..." : "Describe what this harness does..."}
        helperText={t("builder.meta.descHelper")}
        errorMessage={errors.description ? t(errors.description) : undefined}
        maxLength={500}
        rows={3}
      />

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

      <TagInput
        label={t("builder.meta.frameworks")}
        tags={meta.frameworks as string[]}
        onChange={(tags) => setFrameworks(tags)}
        placeholder="React, Python, Node.js"
        helperText={t("builder.meta.frameworksHelper")}
      />
    </div>
  );
}
