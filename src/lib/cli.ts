import { assertValidSlug } from "./validation";

export function buildCliCommand(slug: string): string {
  assertValidSlug(slug);
  return `claude "/${slug}"`;
}
