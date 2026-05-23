function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function normalizeSlug(value: string) {
  return safeDecode(value)
    .normalize("NFKC")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\u200c/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getSlugCandidates(value: string) {
  return Array.from(new Set([value, safeDecode(value), normalizeSlug(value)].filter(Boolean)));
}
