"use client";

import { useState } from "react";
import type { Messages } from "@/lib/i18n";
import type { ProductPagination, PublicProduct } from "@/lib/catalog";
import ProductGrid from "./ProductGrid";

interface ProductsResponse {
  success: boolean;
  data: PublicProduct[];
  pagination?: ProductPagination;
  error?: string;
}

interface ShopProductsSectionProps {
  initialProducts: PublicProduct[];
  initialPagination: ProductPagination;
  initialWishlistProductIds: string[];
  locale: string;
  messages: Messages;
}

export default function ShopProductsSection({
  initialProducts,
  initialPagination,
  initialWishlistProductIds,
  locale,
  messages,
}: ShopProductsSectionProps) {
  const [products, setProducts] = useState(initialProducts);
  const [pagination, setPagination] = useState(initialPagination);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const loadMore = async () => {
    if (!pagination.hasNextPage || isLoadingMore) return;

    setIsLoadingMore(true);
    setError(undefined);

    try {
      const params = new URLSearchParams({
        page: String(pagination.page + 1),
        limit: String(pagination.limit),
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      const response = await fetch(`/api/products?${params.toString()}`);
      const data = (await response.json()) as ProductsResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to load more products");
      }

      setProducts((currentProducts) => [...currentProducts, ...(data.data || [])]);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (loadError) {
      console.error("Error loading more products:", loadError);
      setError(messages.products.errorLoading);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <>
      <ProductGrid
        products={products}
        locale={locale}
        messages={messages}
        initialWishlistProductIds={initialWishlistProductIds}
        loading={false}
      />

      {error && (
        <p className="mt-6 text-center text-sm text-red-500 dark:text-red-400">
          {error}
        </p>
      )}

      {pagination.hasNextPage && !error && (
        <div className="text-center mt-12" data-scroll-reveal style={{ transitionDelay: "0.2s" }}>
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="px-8 py-4 bg-gradient-to-r from-primary-orange to-orange-500 text-white font-semibold rounded-xl hover:shadow-glass-orange hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:hover:scale-100"
          >
            {isLoadingMore ? messages.common.loading : messages.products.loadMoreProducts}
          </button>
        </div>
      )}
    </>
  );
}
