/**
 * Lightweight class name merger (zero-dependency).
 * Filters out falsy values and joins remaining class strings.
 */
export function cn(
  ...classes: ReadonlyArray<string | false | undefined | null>
): string {
  return classes.filter(Boolean).join(" ");
}
