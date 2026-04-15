import { cn } from "@/lib/cn";
import { useLocale } from "@/hooks/use-locale";
import type { ValidationErrors } from "@/lib/builder-validation";
import { hasErrors } from "@/lib/builder-validation";

interface ValidationSummaryProps {
  readonly errors: ValidationErrors;
}

export function ValidationSummary({ errors }: ValidationSummaryProps) {
  const { t } = useLocale();
  const failed = hasErrors(errors);

  const allErrors = [
    ...Object.values(errors.meta),
    ...Object.values(errors.agents),
    ...Object.values(errors.skill),
    ...Object.values(errors.extensionSkills),
  ];

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        failed
          ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
          : "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30",
      )}
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        {failed ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span className="text-red-700 dark:text-red-300">{t("builder.review.hasErrors")}</span>
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polyline points="16 10 11 15 8 12" />
            </svg>
            <span className="text-green-700 dark:text-green-300">{t("builder.review.allPassed")}</span>
          </>
        )}
      </div>

      {failed && (
        <ul className="mt-2 space-y-1">
          {allErrors.map((errKey, i) => (
            <li key={i} className="text-xs text-red-600 dark:text-red-400">
              - {t(errKey)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
