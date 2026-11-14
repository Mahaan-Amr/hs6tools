export const DEFAULT_FREE_SHIPPING_THRESHOLD = 250_000_000; // rials

export function shippingCharge(subtotal: number, threshold: number, methodPrice: number): number {
  return subtotal > threshold ? 0 : methodPrice;
}

export function acceptsShippingMethod(value: unknown): value is string {
  return typeof value === "string" && value.length > 20 && /^[a-z]/.test(value);
}
