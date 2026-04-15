import type { Modification } from "@/lib/types";

interface FieldRule {
  readonly required: boolean;
  readonly maxLength: number;
}

const FIELD_RULES: Readonly<Record<string, FieldRule>> = {
  name: { required: true, maxLength: 80 },
  role: { required: true, maxLength: 200 },
  description: { required: true, maxLength: 500 },
  instructions: { required: false, maxLength: 10000 },
  outputTemplate: { required: false, maxLength: 5000 },
};

type Locale = "ko" | "en";

const MESSAGES: Readonly<Record<string, Readonly<Record<Locale, string>>>> = {
  required: {
    ko: "필수 입력입니다",
    en: "This field is required",
  },
  tooLong: {
    ko: "최대 {max}자까지 입력 가능합니다",
    en: "Maximum {max} characters",
  },
};

function getMessage(key: string, locale: Locale, params?: Readonly<Record<string, string | number>>): string {
  const template = MESSAGES[key]?.[locale] ?? MESSAGES[key]?.en ?? key;
  if (!params) return template;
  return Object.entries(params).reduce(
    (msg, [k, v]) => msg.replace(`{${k}}`, String(v)),
    template,
  );
}

export function validateAgentField(
  field: Modification["field"],
  value: string | boolean,
  locale: Locale = "ko",
): string | null {
  if (field === "enabled" || typeof value === "boolean") return null;

  const rule = FIELD_RULES[field];
  if (!rule) return null;

  const trimmed = value.trim();

  if (rule.required && trimmed.length === 0) {
    return getMessage("required", locale);
  }

  if (trimmed.length > rule.maxLength) {
    return getMessage("tooLong", locale, { max: rule.maxLength });
  }

  return null;
}
