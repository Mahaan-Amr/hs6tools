"use client";

import { useCartStore } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import WishlistButton from "./WishlistButton";

interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  title?: string;
  isPrimary: boolean;
  sortOrder: number;
}

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  comparePrice?: number;
  stockQuantity: number;
  isInStock: boolean;
  attributes: Record<string, string | number>;
}

interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface Product {
  id: string;
  slug: string;
  name: string;
  description?: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  stockQuantity: number;
  isInStock: boolean;
  allowBackorders: boolean;
  weight?: number;
  dimensions?: Record<string, number>;
  material?: string;
  warranty?: string;
  brand?: string;
  isFeatured: boolean;
  category: ProductCategory;
  images: ProductImage[];
  variants: ProductVariant[];
  _count: {
    reviews: number;
    variants: number;
  };
}

interface ProductCardProps {
  product: Product;
  locale: string;
}

export default function ProductCard({ product, locale }: ProductCardProps) {
  const { addItem } = useCartStore();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {
      style: "currency",
      currency: locale === "fa" ? "IRR" : "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = async () => {
    if (!product.isInStock) return;
    
    setIsAddingToCart(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.images[0]?.url,
        sku: product.slug,
        category: product.category.name
      });
      
      // Show success feedback
      // You could add a toast notification here
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;

  return (
    <div className="group glass rounded-3xl overflow-hidden hover:scale-105 transition-all duration-300 hover:shadow-glass-orange">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt || product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Featured Badge */}
        {product.isFeatured && (
          <div className="absolute top-3 right-3">
            <span className="bg-gradient-to-r from-primary-orange to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              ویژه
            </span>
          </div>
        )}
        
        {/* Wishlist Button */}
        <div className="absolute top-3 left-3">
          <WishlistButton 
            productId={product.id}
            className="bg-black/20 backdrop-blur-sm"
          />
        </div>
        
        {/* Stock Status */}
        <div className="absolute bottom-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            product.isInStock 
              ? "bg-primary-orange/20 text-primary-orange" 
              : "bg-red-500/20 text-red-400"
          }`}>
            {product.isInStock ? "موجود" : "ناموجود"}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        {/* Category */}
        <div className="mb-3">
          <Link 
            href={`/${locale}/categories/${product.category.slug}`}
            className="inline-block bg-primary-orange/20 text-primary-orange px-2 py-1 rounded-full text-xs font-medium hover:bg-primary-orange/30 transition-colors duration-200"
          >
            {product.category.name}
          </Link>
        </div>

        {/* Product Name */}
        <Link href={`/${locale}/products/${product.slug}`}>
          <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2 hover:text-primary-orange transition-colors duration-200">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        {product.shortDescription && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {product.shortDescription}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <div className="text-xl font-bold text-white">
              {formatPrice(product.price)}
            </div>
            {hasDiscount && (
              <div className="text-sm text-gray-400 line-through">
                {formatPrice(product.comparePrice!)}
              </div>
            )}
          </div>
          
          {/* Reviews Count */}
          {product._count.reviews > 0 && (
            <div className="flex items-center space-x-1 text-sm text-gray-400">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{product._count.reviews}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleAddToCart}
            disabled={!product.isInStock || isAddingToCart}
            className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
              product.isInStock
                ? "bg-gradient-to-r from-primary-orange to-orange-500 text-white hover:shadow-glass-orange hover:scale-105"
                : "bg-gray-600 text-gray-300 cursor-not-allowed"
            } ${isAddingToCart ? "opacity-75" : ""}`}
          >
            {isAddingToCart ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>در حال افزودن...</span>
              </div>
            ) : (
              product.isInStock ? "افزودن به سبد خرید" : "ناموجود"
            )}
          </button>
          
          <Link
            href={`/${locale}/products/${product.slug}`}
            className="block w-full py-3 px-4 glass border border-white/20 text-white text-center rounded-xl font-semibold hover:bg-white/10 transition-all duration-200"
          >
            مشاهده جزئیات
          </Link>
        </div>
      </div>
    </div>
  );
}