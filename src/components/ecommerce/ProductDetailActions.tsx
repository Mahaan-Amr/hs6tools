"use client";

import { useState } from "react";
import { useCartStore } from "@/contexts/CartContext";
import type { Messages } from "@/lib/i18n";
import type { PublicProductDetail } from "@/lib/catalog";
import { formatPrice as formatPriceUtil } from "@/utils/format";
import WishlistButton from "./WishlistButton";

interface ProductDetailActionsProps {
  product: PublicProductDetail;
  locale: string;
  messages: Messages;
  initialIsInWishlist?: boolean;
}

export default function ProductDetailActions({
  product,
  locale,
  messages,
  initialIsInWishlist = false,
}: ProductDetailActionsProps) {
  const { addItem } = useCartStore();
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  const selectedVariant = product.variants.find((variant) => variant.id === selectedVariantId);
  const requiresVariant = product.variants.length > 0;
  const canAddBaseProduct = product.isInStock && !requiresVariant;
  const canAddVariant = Boolean(selectedVariant?.isInStock && selectedVariant.stockQuantity > 0);
  const canAdd = requiresVariant ? canAddVariant : canAddBaseProduct;

  const formatPrice = (price: number) => formatPriceUtil(price, locale);

  const handleAddToCart = () => {
    if (requiresVariant && !selectedVariant) {
      setError(messages.products.selectVariant || "لطفا یک گزینه را انتخاب کنید");
      return;
    }

    if (!canAdd) return;

    setIsAdding(true);
    setError("");

    const primaryImage = product.images.find((image) => image.isPrimary) || product.images[0];
    const variantName = selectedVariant ? `${product.name} - ${selectedVariant.name}` : product.name;

    addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      name: variantName,
      price: selectedVariant?.price ?? product.price,
      quantity: 1,
      image: primaryImage?.url,
      sku: selectedVariant?.sku || product.slug,
      category: product.category.name,
    });

    window.setTimeout(() => setIsAdding(false), 250);
  };

  return (
    <div className="space-y-4">
      {requiresVariant && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {messages.products.selectVariant}
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {product.variants.map((variant) => {
              const selected = selectedVariantId === variant.id;
              const available = variant.isInStock && variant.stockQuantity > 0;

              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => {
                    setSelectedVariantId(variant.id);
                    setError("");
                  }}
                  disabled={!available}
                  className={`min-h-24 rounded-xl border p-4 text-right transition ${
                    selected
                      ? "border-primary-orange bg-primary-orange/10"
                      : "border-gray-300 bg-white hover:border-primary-orange dark:border-white/20 dark:bg-white/5"
                  } ${!available ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">{variant.name}</div>
                  <div className="mb-2 font-semibold text-gray-900 dark:text-white">
                    {formatPrice(variant.price)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {messages.products.stock}: {variant.stockQuantity} {messages.products.stockCount}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!canAdd || isAdding}
        className={`w-full rounded-xl px-6 py-4 text-lg font-semibold transition-all duration-200 ${
          canAdd
            ? "bg-gradient-to-r from-primary-orange to-orange-500 text-white hover:scale-105 hover:shadow-glass-orange"
            : "cursor-not-allowed bg-gray-600 text-gray-300"
        }`}
      >
        {isAdding
          ? messages.products.addingToCart
          : canAdd
            ? messages.products.addToCart
            : messages.products.outOfStock}
      </button>

      <WishlistButton
        productId={product.id}
        initialIsInWishlist={initialIsInWishlist}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-4 text-gray-900 dark:border-white/20 dark:bg-white/5 dark:text-white"
        labels={{
          add: messages.products.addToWishlist,
          remove: messages.wishlist.removeFromWishlist,
          loginRequired: messages.wishlist.loginRequired,
        }}
        showLabel
      />
    </div>
  );
}
