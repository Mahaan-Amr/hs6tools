/** Use the product name when the imported alt text is just a file name. */
export function productImageAlt(alt: string | null | undefined, productName: string): string {
  const text = alt?.trim();
  if (!text || /\.(?:jpe?g|png|gif|webp|avif|svg|bmp|heic)$/i.test(text)) {
    return productName;
  }
  return text;
}
