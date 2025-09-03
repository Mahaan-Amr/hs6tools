"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";

interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number;
    isInStock: boolean;
    category: {
      name: string;
      slug: string;
    };
    images: Array<{
      url: string;
      alt?: string;
    }>;
  };
  createdAt: string;
}

interface WishlistContentProps {
  locale: string;
}

export default function WishlistContent({ locale }: WishlistContentProps) {
  const { data: session } = useSession();
  const { addItem } = useCartStore();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (session?.user) {
      fetchWishlist();
    } else {
      setIsLoading(false);
    }
  }, [session?.user]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch("/api/wishlist");
      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data.data);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    setRemovingItems(prev => new Set(prev).add(productId));
    
    try {
      const response = await fetch(`/api/wishlist?productId=${productId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item.product.id !== productId));
        // You could add a success toast here
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const addToCart = async (item: WishlistItem) => {
    try {
      addItem({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: 1,
        image: item.product.images[0]?.url,
        sku: item.product.slug,
        category: item.product.category.name
      });
      
      // You could add a success toast here
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {
      style: "currency",
      currency: locale === "fa" ? "IRR" : "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (!session?.user) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-4">
          برای مشاهده لیست علاقه‌مندی وارد شوید
        </h3>
        <p className="text-gray-400 mb-6">
          محصولات مورد علاقه خود را ذخیره کنید و بعداً به آنها دسترسی داشته باشید
        </p>
        <Link
          href={`/${locale}/auth/login`}
          className="inline-block px-6 py-3 bg-primary-orange text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors duration-200"
        >
          ورود به حساب کاربری
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="glass rounded-3xl p-6 animate-pulse">
            <div className="aspect-square bg-gray-700 rounded-2xl mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-4">
          لیست علاقه‌مندی شما خالی است
        </h3>
        <p className="text-gray-400 mb-6">
          محصولات مورد علاقه خود را به لیست علاقه‌مندی اضافه کنید
        </p>
        <Link
          href={`/${locale}/shop`}
          className="inline-block px-6 py-3 bg-primary-orange text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors duration-200"
        >
          مشاهده محصولات
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {wishlistItems.map((item) => (
        <div key={item.id} className="glass rounded-3xl overflow-hidden hover:scale-105 transition-all duration-300">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden">
            {item.product.images[0] ? (
              <Image
                src={item.product.images[0].url}
                alt={item.product.images[0].alt || item.product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            
            {/* Remove from Wishlist Button */}
            <button
              onClick={() => removeFromWishlist(item.product.id)}
              disabled={removingItems.has(item.product.id)}
              className="absolute top-3 right-3 p-2 bg-red-500/20 backdrop-blur-sm text-red-400 hover:text-red-300 rounded-full transition-colors duration-200 disabled:opacity-50"
              title="حذف از لیست علاقه‌مندی"
            >
              {removingItems.has(item.product.id) ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>

          {/* Product Info */}
          <div className="p-6">
            {/* Category */}
            <div className="mb-3">
              <Link 
                href={`/${locale}/categories/${item.product.category.slug}`}
                className="inline-block bg-primary-orange/20 text-primary-orange px-2 py-1 rounded-full text-xs font-medium hover:bg-primary-orange/30 transition-colors duration-200"
              >
                {item.product.category.name}
              </Link>
            </div>

            {/* Product Name */}
            <Link href={`/${locale}/products/${item.product.slug}`}>
              <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2 hover:text-primary-orange transition-colors duration-200">
                {item.product.name}
              </h3>
            </Link>

            {/* Price */}
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <div className="text-xl font-bold text-white">
                  {formatPrice(item.product.price)}
                </div>
                {item.product.comparePrice && item.product.comparePrice > item.product.price && (
                  <div className="text-sm text-gray-400 line-through">
                    {formatPrice(item.product.comparePrice)}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => addToCart(item)}
                disabled={!item.product.isInStock}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                  item.product.isInStock
                    ? "bg-gradient-to-r from-primary-orange to-orange-500 text-white hover:shadow-glass-orange hover:scale-105"
                    : "bg-gray-600 text-gray-300 cursor-not-allowed"
                }`}
              >
                {item.product.isInStock ? "افزودن به سبد خرید" : "ناموجود"}
              </button>
              
              <Link
                href={`/${locale}/products/${item.product.slug}`}
                className="block w-full py-3 px-4 glass border border-white/20 text-white text-center rounded-xl font-semibold hover:bg-white/10 transition-all duration-200"
              >
                مشاهده جزئیات
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
