export function normalizeUploadUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("/api/uploads/")) return url;
  if (url.startsWith("/uploads/")) return `/api${url}`;
  return url;
}

export function normalizeUploadUrls<T extends { url?: string | null }>(items: T[]): T[] {
  return items.map((item) => ({
    ...item,
    url: normalizeUploadUrl(item.url),
  }));
}
