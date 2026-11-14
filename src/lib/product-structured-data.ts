import { SITE_URL } from "./seo";

// This is a pilot for the two Catalog Products selected for SEO work.
const pilotProductIds = new Set([
  "cmoueudwo0020ggu9kpllb1kg",
  "cmp3v8gsp005yggu92ypowv63",
]);

type ProductForStructuredData = {
  id: string;
  slug: string;
  name: string;
  sku?: string;
  brand?: string;
  price: number;
  isInStock: boolean;
  stockQuantity: number;
  variants: readonly unknown[];
  shortDescription?: string;
  images: readonly { url: string }[];
};

export function buildProductStructuredData(product: ProductForStructuredData, locale: string) {
  if (!pilotProductIds.has(product.id) || !["fa", "en", "ar"].includes(locale)) return null;
  // The page rounds to whole tomans. Do not publish a conflicting IRR value,
  // or an ambiguous single offer for variants or inconsistent stock.
  if (!product.name.trim() || !Number.isSafeInteger(product.price) || product.price <= 0 || product.price % 10 !== 0 || product.variants.length > 0 || (product.isInStock && product.stockQuantity <= 0)) return null;

  const url = `${SITE_URL}/${locale}/products/${encodeURIComponent(product.slug)}`;
  const image = product.images.flatMap(({ url: source }) => {
    try {
      const parsed = new URL(source, SITE_URL);
      return parsed.protocol === "https:" ? [parsed.href] : [];
    } catch {
      return [];
    }
  });
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(product.sku?.trim() ? { sku: product.sku.trim() } : {}),
    ...(product.brand?.trim() ? { brand: { "@type": "Brand", name: product.brand.trim() } } : {}),
    ...(product.shortDescription?.trim() ? { description: product.shortDescription } : {}),
    image,
    offers: {
      "@type": "Offer",
      url,
      price: product.price,
      priceCurrency: "IRR",
      availability: product.isInStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
