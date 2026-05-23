"use client";

import { useState } from "react";
import type { Messages } from "@/lib/i18n";
import type { ProductPagination, PublicCategory, PublicProduct } from "@/lib/catalog";
import ProductGrid from "./ProductGrid";
import AdvancedSearch from "./AdvancedSearch";
import IconRenderer from "@/components/shared/IconRenderer";
import CategoryFallbackIcon from "@/components/shared/CategoryFallbackIcon";

interface ProductsResponse {
  success: boolean;
  data: PublicProduct[] | {
    products: PublicProduct[];
    pagination: ProductPagination;
  };
  pagination?: ProductPagination;
  error?: string;
}

interface ShopProductsSectionProps {
  initialProducts: PublicProduct[];
  initialPagination: ProductPagination;
  initialWishlistProductIds: string[];
  locale: string;
  messages: Messages;
  categories: PublicCategory[];
}

export default function ShopProductsSection({
  initialProducts,
  initialPagination,
  initialWishlistProductIds,
  locale,
  messages,
  categories,
}: ShopProductsSectionProps) {
  const [products, setProducts] = useState(initialProducts);
  const [pagination, setPagination] = useState(initialPagination);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [activeParams, setActiveParams] = useState(new URLSearchParams());
  const [activeCategoryId, setActiveCategoryId] = useState("");

  const fetchProducts = async (params: URLSearchParams, append = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsFiltering(true);
    }
    setError(undefined);

    try {
      const response = await fetch(`/api/products/search/advanced?${params.toString()}`);
      const data = (await response.json()) as ProductsResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to load products");
      }

      const result = Array.isArray(data.data)
        ? { products: data.data, pagination: data.pagination }
        : data.data;

      if (!result?.pagination) {
        throw new Error("Invalid product response");
      }

      setProducts((currentProducts) => append ? [...currentProducts, ...result.products] : result.products);
      setPagination(result.pagination);
    } catch (loadError) {
      console.error("Error loading products:", loadError);
      setError(messages.products.errorLoading);
    } finally {
      setIsLoadingMore(false);
      setIsFiltering(false);
    }
  };

  const applyFilters = (params: URLSearchParams) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set("page", "1");
    nextParams.set("limit", String(initialPagination.limit));
    nextParams.set("sortBy", "createdAt");
    nextParams.set("sortOrder", "desc");
    setActiveParams(nextParams);
    setActiveCategoryId(nextParams.get("categoryId") || "");
    void fetchProducts(nextParams);
  };

  const selectCategory = (categoryId: string) => {
    const nextParams = new URLSearchParams(activeParams);
    if (categoryId) {
      nextParams.set("categoryId", categoryId);
    } else {
      nextParams.delete("categoryId");
    }
    applyFilters(nextParams);
  };

  const loadMore = async () => {
    if (!pagination.hasNextPage || isLoadingMore) return;

    const params = new URLSearchParams(activeParams);
    params.set("page", String(pagination.page + 1));
    params.set("limit", String(pagination.limit));
    params.set("sortBy", params.get("sortBy") || "createdAt");
    params.set("sortOrder", params.get("sortOrder") || "desc");
    await fetchProducts(params, true);
  };

  return (
    <>
      <div className="mb-8 space-y-6">
        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => selectCategory("")}
              className={`inline-flex h-12 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${
                !activeCategoryId
                  ? "border-primary-orange bg-primary-orange text-white"
                  : "border-gray-300 bg-white text-gray-800 hover:border-primary-orange dark:border-white/15 dark:bg-white/5 dark:text-white"
              }`}
            >
              {messages.search?.allCategories || "همه دسته‌ها"}
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => selectCategory(category.id)}
                className={`inline-flex h-12 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${
                  activeCategoryId === category.id
                    ? "border-primary-orange bg-primary-orange text-white"
                    : "border-gray-300 bg-white text-gray-800 hover:border-primary-orange dark:border-white/15 dark:bg-white/5 dark:text-white"
                }`}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-orange/15 text-primary-orange">
                  {category.icon ? (
                    <IconRenderer
                      name={category.icon}
                      alt={category.name}
                      className="h-4 w-4 object-contain"
                      fallback={<CategoryFallbackIcon className="h-4 w-4" />}
                    />
                  ) : (
                    <CategoryFallbackIcon className="h-4 w-4" />
                  )}
                </span>
                <span>{category.name}</span>
                <span className="text-xs opacity-70">{category._count.products}</span>
              </button>
            ))}
          </div>
        )}

        <AdvancedSearch
          locale={locale}
          messages={messages}
          categories={categories}
          onApply={applyFilters}
        />
      </div>

      <ProductGrid
        products={products}
        locale={locale}
        messages={messages}
        initialWishlistProductIds={initialWishlistProductIds}
        loading={isFiltering}
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
