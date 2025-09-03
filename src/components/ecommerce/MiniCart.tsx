"use client";

import { useCartStore, CartItem } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";

interface MiniCartProps {
  locale: string;
}

export default function MiniCart({ locale }: MiniCartProps) {
  const { items, isOpen, closeCart, totalItems, totalPrice, removeItem, updateQuantity } = useCartStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {
      style: "currency",
      currency: locale === "fa" ? "IRR" : "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(item.id);
    } else {
      updateQuantity(item.id, newQuantity);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={closeCart}
      />
      
      {/* Mini Cart */}
      <div className="fixed top-16 right-4 w-80 max-h-[80vh] glass rounded-3xl shadow-2xl z-50 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">سبد خرید</h3>
            <button
              onClick={closeCart}
              className="p-2 text-white/60 hover:text-white transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {totalItems} آیتم در سبد خرید
          </p>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {items.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">سبد خرید خالی است</h4>
              <p className="text-gray-400 text-sm">
                محصولی به سبد خرید اضافه نکرده‌اید
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 glass rounded-2xl p-3">
                  {/* Product Image */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {item.category}
                    </p>
                    <div className="text-sm text-primary-orange font-semibold">
                      {formatPrice(item.price)}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQuantityChange(item, item.quantity - 1)}
                      className="w-6 h-6 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-colors duration-200"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    
                    <span className="text-sm text-white font-medium min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    
                    <button
                      onClick={() => handleQuantityChange(item, item.quantity + 1)}
                      className="w-6 h-6 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-colors duration-200"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-red-400 hover:text-red-300 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-white/10 space-y-4">
            {/* Total */}
            <div className="flex items-center justify-between text-lg font-semibold text-white">
              <span>مجموع:</span>
              <span className="text-primary-orange">{formatPrice(totalPrice)}</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                href={`/${locale}/cart`}
                onClick={closeCart}
                className="block w-full py-3 px-4 bg-gradient-to-r from-primary-orange to-orange-500 text-white text-center rounded-xl font-semibold hover:shadow-glass-orange hover:scale-105 transition-all duration-200"
              >
                مشاهده سبد خرید
              </Link>
              
              <Link
                href={`/${locale}/checkout`}
                onClick={closeCart}
                className="block w-full py-3 px-4 glass border border-white/20 text-white text-center rounded-xl font-semibold hover:bg-white/10 transition-all duration-200"
              >
                تکمیل خرید
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
