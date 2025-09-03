'use client';

import React, { useState, useEffect } from 'react';
import { getMessages, Messages } from '@/lib/i18n';
import { useCartStore } from '@/contexts/CartContext';
import Image from 'next/image';
import Link from 'next/link';

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

interface WishlistTabProps {
  locale: string;
}

export default function WishlistTab({ locale }: WishlistTabProps) {
  const { addItem } = useCartStore();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<Messages | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await getMessages(locale);
      setMessages(msgs);
    };
    loadMessages();
    fetchWishlist();
  }, [locale]);

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
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
      
      // Remove from wishlist after adding to cart
      await removeFromWishlist(item.product.id);
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

  if (isLoading || !messages) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-white/10 rounded w-1/3"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-4">
          {messages?.customer?.wishlist?.noItems || 'لیست علاقه‌مندی خالی است'}
        </h3>
        <p className="text-gray-400 mb-6">
          {messages?.customer?.wishlist?.noItemsMessage || 'محصولات مورد علاقه خود را اضافه کنید'}
        </p>
        <Link
          href={`/${locale}/shop`}
          className="inline-block px-6 py-3 bg-primary-orange text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors duration-200"
        >
          {messages?.customer?.wishlist?.browseProducts || 'مشاهده محصولات'}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          {messages?.customer?.wishlist?.title || 'لیست علاقه‌مندی‌ها'}
        </h2>
        <span className="text-sm text-gray-400">
          {wishlistItems.length} {messages?.customer?.wishlist?.itemCount || 'محصول'}
        </span>
      </div>

      {/* Wishlist Items */}
      <div className="space-y-4">
        {wishlistItems.map((item) => (
          <div key={item.id} className="glass rounded-xl p-6 border border-white/10">
            <div className="flex items-start gap-4">
              {/* Product Image */}
              <div className="flex-shrink-0">
                {item.product.images[0] && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-white/5">
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      <Link 
                        href={`/${locale}/shop/products/${item.product.slug}`}
                        className="hover:text-primary-orange transition-colors duration-200"
                      >
                        {item.product.name}
                      </Link>
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-300 mb-3">
                      <span className="bg-white/10 px-2 py-1 rounded-full">
                        {item.product.category.name}
                      </span>
                      <span className={`px-2 py-1 rounded-full ${
                        item.product.isInStock 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {item.product.isInStock 
                          ? (messages?.customer?.wishlist?.inStock || 'موجود') 
                          : (messages?.customer?.wishlist?.outOfStock || 'ناموجود')
                        }
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-primary-orange">
                        {formatPrice(item.product.price)}
                      </span>
                      {item.product.comparePrice && item.product.comparePrice > item.product.price && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(item.product.comparePrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    {item.product.isInStock && (
                      <button
                        onClick={() => addToCart(item)}
                        className="px-4 py-2 bg-primary-orange text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors duration-200"
                        title={messages?.customer?.wishlist?.addToCart || 'افزودن به سبد خرید'}
                      >
                        {messages?.customer?.wishlist?.addToCart || 'افزودن به سبد'}
                      </button>
                    )}
                    
                    <button
                      onClick={() => removeFromWishlist(item.product.id)}
                      disabled={removingItems.has(item.product.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors duration-200 disabled:opacity-50"
                      title={messages?.customer?.wishlist?.removeFromWishlist || 'حذف از لیست علاقه‌مندی'}
                    >
                      {removingItems.has(item.product.id) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-white/10">
        <div className="text-sm text-gray-400">
          {messages?.customer?.wishlist?.totalItems || 'مجموع محصولات'}: {wishlistItems.length}
        </div>
        
        <div className="flex gap-3">
          <Link
            href={`/${locale}/shop`}
            className="px-6 py-3 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-colors duration-200"
          >
            {messages?.customer?.wishlist?.continueShopping || 'ادامه خرید'}
          </Link>
          
          {wishlistItems.some(item => item.product.isInStock) && (
            <button
              onClick={() => {
                const inStockItems = wishlistItems.filter(item => item.product.isInStock);
                inStockItems.forEach(item => addToCart(item));
              }}
              className="px-6 py-3 bg-primary-orange text-white font-medium rounded-lg hover:bg-orange-600 transition-colors duration-200"
            >
              {messages?.customer?.wishlist?.addAllToCart || 'افزودن همه به سبد خرید'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
