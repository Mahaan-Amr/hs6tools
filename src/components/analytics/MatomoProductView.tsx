"use client";

import { useEffect, useRef } from "react";
import { trackProductView } from "@/lib/matomo";

export default function MatomoProductView({ productId }: { productId: string }) {
  const lastProduct = useRef<string | null>(null);
  useEffect(() => {
    if (lastProduct.current === productId) return;
    lastProduct.current = productId;
    trackProductView(productId);
  }, [productId]);
  return null;
}
