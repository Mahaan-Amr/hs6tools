"use client";

import { useCartStore } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface CartPageClientProps {
  locale: string;
}

export default function CartPageClient({ locale }: CartPageClientProps) {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCartStore();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {
      style: "currency",
      currency: locale === "fa" ? "IRR" : "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    setIsUpdating(itemId);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (newQuantity <= 0) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
    
    setIsUpdating(null);
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
  };

  const handleClearCart = () => {
    if (confirm("آیا مطمئن هستید که می‌خواهید سبد خرید را خالی کنید؟")) {
      clearCart();
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-black via-gray-900 to-primary-black pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Empty Cart State */}
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">سبد خرید خالی است</h1>
            <p className="text-gray-400 text-lg mb-8">
              محصولی به سبد خرید اضافه نکرده‌اید. برای شروع خرید، محصولات ما را مشاهده کنید.
            </p>
            
            <div className="space-x-4">
              <Link
                href={`/${locale}/shop`}
                className="inline-block bg-gradient-to-r from-primary-orange to-orange-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-glass-orange hover:scale-105 transition-all duration-200"
              >
                مشاهده محصولات
              </Link>
              
              <Link
                href={`/${locale}/categories`}
                className="inline-block glass border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-200"
              >
                دسته‌بندی‌ها
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-black via-gray-900 to-primary-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">سبد خرید</h1>
          <p className="text-gray-400 text-lg">
            {totalItems} آیتم در سبد خرید شما
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="glass rounded-3xl p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">محصولات انتخاب شده</h2>
                <button
                  onClick={handleClearCart}
                  className="text-red-400 hover:text-red-300 text-sm transition-colors duration-200"
                >
                  خالی کردن سبد خرید
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="glass rounded-2xl p-4">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white mb-1 line-clamp-2">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-400 mb-2">
                          {item.category} • {item.sku}
                        </p>
                        <div className="text-lg text-primary-orange font-bold">
                          {formatPrice(item.price)}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={isUpdating === item.id}
                          className="w-8 h-8 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-colors duration-200 disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        
                        <span className="text-white font-medium min-w-[3rem] text-center">
                          {isUpdating === item.id ? (
                            <div className="w-4 h-4 border-2 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto"></div>
                          ) : (
                            item.quantity
                          )}
                        </span>
                        
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={isUpdating === item.id}
                          className="w-8 h-8 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-colors duration-200 disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>

                      {/* Item Total & Remove */}
                      <div className="text-right">
                        <div className="text-lg text-white font-semibold mb-2">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-400 hover:text-red-300 text-sm transition-colors duration-200"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="glass rounded-3xl p-6">
              <div className="text-center">
                <p className="text-gray-400 mb-4">آیا محصول دیگری نیاز دارید؟</p>
                <Link
                  href={`/${locale}/shop`}
                  className="inline-block glass border border-white/20 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all duration-200"
                >
                  ادامه خرید
                </Link>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass rounded-3xl p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-white mb-6">خلاصه سفارش</h2>
              
              {/* Order Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-400">
                  <span>تعداد محصولات:</span>
                  <span className="text-white">{items.length}</span>
                </div>
                
                <div className="flex justify-between text-gray-400">
                  <span>تعداد کل آیتم‌ها:</span>
                  <span className="text-white">{totalItems}</span>
                </div>
                
                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between text-lg font-semibold text-white">
                    <span>مجموع:</span>
                    <span className="text-primary-orange">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="mb-6 p-4 bg-white/5 rounded-2xl">
                <h3 className="font-semibold text-white mb-3">اطلاعات ارسال</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>• ارسال از طریق پست و تیپاکس</p>
                  <p>• زمان تحویل: 2-5 روز کاری</p>
                  <p>• هزینه ارسال: رایگان برای سفارشات بالای 500,000 تومان</p>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href={`/${locale}/checkout`}
                className="block w-full bg-gradient-to-r from-primary-orange to-orange-500 text-white text-center py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-glass-orange hover:scale-105 transition-all duration-200"
              >
                تکمیل خرید
              </Link>

              {/* Security Notice */}
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>پرداخت امن با ZarinPal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
