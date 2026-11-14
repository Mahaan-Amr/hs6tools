export const DEFAULT_FREE_SHIPPING_THRESHOLD = 250_000_000; // rials

export function shippingCharge(subtotal: number, threshold: number, methodPrice: number): number {
  return subtotal > threshold ? 0 : methodPrice;
}
