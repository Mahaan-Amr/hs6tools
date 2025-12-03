"use client";

import { useState, useEffect } from "react";
import { getMessages, Messages } from "@/lib/i18n";
import ProductCard from "./ProductCard";

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
  images: Array<{
    id: string;
    url: string;
    alt?: string;
    title?: string;
    isPrimary: boolean;
    sortOrder: number;
  }>;
  variants: Array<{
    id: string;
    name: string;
    sku: string;
    price: number;
    comparePrice?: number;
    stockQuantity: number;
    isInStock: boolean;
    attributes: Record<string, string | number>;
  }>;
  category: {
    id: string;
    name: string;
    slug: string;
    description?: string;
  };
  _count: {
    reviews: number;
    variants: number;
  };
}

interface ProductGridProps {
  products: Product[];
  locale: string;
  loading?: boolean;
  error?: string;
}

export default function ProductGrid({ products, locale, loading = false, error }: ProductGridProps) {
  const [gridCols, setGridCols] = useState("grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4");
  const [messages, setMessages] = useState<Messages | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await getMessages(locale);
      setMessages(msgs);
    };
    loadMessages();
  }, [locale]);

  useEffect(() => {
    const updateGridCols = () => {
      if (window.innerWidth >= 1280) {
        setGridCols("grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4");
      } else if (window.innerWidth >= 1024) {
        setGridCols("grid-cols-1 md:grid-cols-2 lg:grid-cols-3");
      } else if (window.innerWidth >= 768) {
        setGridCols("grid-cols-1 md:grid-cols-2");
      } else {
        setGridCols("grid-cols-1");
      }
    };

    updateGridCols();
    window.addEventListener("resize", updateGridCols);
    return () => window.removeEventListener("resize", updateGridCols);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="glass rounded-3xl overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-200 dark:bg-gray-700"></div>
            <div className="p-6 space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="glass rounded-3xl p-8 max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {messages?.products?.errorLoading || 'خطا در بارگذاری محصولات'}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-orange text-white rounded-lg hover:bg-orange-600 transition-colors duration-200"
          >
            {messages?.products?.retry || messages?.common?.retry || 'تلاش مجدد'}
          </button>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="glass rounded-3xl p-8 max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {messages?.products?.noProductsFound || 'محصولی یافت نشد'}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            {messages?.products?.noProductsMessage || 'متأسفانه محصولی با این مشخصات پیدا نشد. لطفاً فیلترهای خود را تغییر دهید.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols} gap-6`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          locale={locale}
        />
      ))}
    </div>
  );
}
