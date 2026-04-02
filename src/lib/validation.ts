const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

export function assertValidSlug(slug: string): void {
  if (!isValidSlug(slug)) {
    throw new Error(`Invalid slug: "${slug}"`);
  }
}

export function isValidPath(path: string): boolean {
  return !path.includes("..") && !path.startsWith("/") && !/[<>:"|?*]/.test(path);
}

const ALLOWED_MODIFICATION_FIELDS = new Set([
  "name",
  "role",
  "description",
  "outputTemplate",
  "enabled",
]);

export function isAllowedModificationField(field: string): boolean {
  return ALLOWED_MODIFICATION_FIELDS.has(field);
}

export function parseFavoriteIds(raw: string): ReadonlyArray<number> {
  return raw
    .split(",")
    .map(Number)
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 999);
}

export function parseStoredFavorites(json: string): ReadonlyArray<number> {
  try {
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (n): n is number => typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= 999,
    );
  } catch {
    return [];
  }
}
