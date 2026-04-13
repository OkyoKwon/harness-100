export function buildCliCommand(slug: string): string {
  // Sanitize: strip characters that could break shell quoting
  const safe = slug.replace(/["\\`$]/g, "");
  return `claude "/${safe}"`;
}
