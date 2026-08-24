export function normalizePublicImageSource(src: string): string {
  return src.startsWith("//") ? `https:${src}` : src;
}

export function isThirdPartyImageSource(src: string): boolean {
  return /^https?:\/\//i.test(normalizePublicImageSource(src));
}
