export function parseShopPage(value: string | string[] | undefined): number {
  if (typeof value !== "string" || !/^[1-9]\d{0,3}$/.test(value)) return 1;
  return Number(value);
}

export function shopPagePath(page: number): string {
  return page <= 1 ? "/shop" : `/shop?page=${page}`;
}
