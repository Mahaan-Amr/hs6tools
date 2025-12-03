"use client";

import { useState, useEffect } from "react";
import { getMessages, Messages } from "@/lib/i18n";

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

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onVariantChange: (variant: ProductVariant) => void;
  locale: string;
}

export default function ProductVariantSelector({
  variants,
  selectedVariant,
  onVariantChange,
  locale
}: ProductVariantSelectorProps) {
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string | number>>({});
  const [messages, setMessages] = useState<Messages | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await getMessages(locale);
      setMessages(msgs);
    };
    loadMessages();
  }, [locale]);

  // Get unique attribute keys from all variants
  const attributeKeys = Array.from(
    new Set(variants.flatMap(variant => Object.keys(variant.attributes)))
  );

  // Get available options for each attribute
  const getAttributeOptions = (key: string) => {
    const options = new Set<string | number>();
    variants.forEach(variant => {
      if (variant.attributes[key]) {
        options.add(variant.attributes[key]);
      }
    });
    return Array.from(options);
  };

  // Find variant based on selected attributes
  const findVariantByAttributes = (attributes: Record<string, string | number>) => {
    return variants.find(variant => {
      return Object.entries(attributes).every(([key, value]) => 
        variant.attributes[key] === value
      );
    });
  };

  // Handle attribute selection
  const handleAttributeChange = (key: string, value: string | number) => {
    const newAttributes = { ...selectedAttributes, [key]: value };
    setSelectedAttributes(newAttributes);
    
    const variant = findVariantByAttributes(newAttributes);
    if (variant) {
      onVariantChange(variant);
    }
  };

  // Initialize selected attributes with first variant
  useEffect(() => {
    if (variants.length > 0 && !selectedVariant) {
      const firstVariant = variants[0];
      setSelectedAttributes(firstVariant.attributes);
      onVariantChange(firstVariant);
    }
  }, [variants, selectedVariant, onVariantChange]);

  // Check if a variant is available with current attribute selection
  const isVariantAvailable = (key: string, value: string | number) => {
    const testAttributes = { ...selectedAttributes, [key]: value };
    const variant = findVariantByAttributes(testAttributes);
    return variant && variant.isInStock;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {
      style: "currency",
      currency: locale === "fa" ? "IRR" : "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (variants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Variant Attributes */}
      {attributeKeys.map((key) => (
        <div key={key} className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
            {(messages?.products?.attributes as Record<string, string>)?.[key] || 
             (key === "color" ? "رنگ" : 
              key === "size" ? "سایز" : 
              key === "material" ? "جنس" : 
              key === "weight" ? "وزن" : 
              key === "dimension" ? "ابعاد" : key)}
          </label>
          
          <div className="flex flex-wrap gap-3">
            {getAttributeOptions(key).map((option) => {
              const isAvailable = isVariantAvailable(key, option);
              const isSelected = selectedAttributes[key] === option;
              
              return (
                <button
                  key={option}
                  onClick={() => handleAttributeChange(key, option)}
                  disabled={!isAvailable}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${isSelected 
                      ? "bg-primary-orange text-white ring-2 ring-primary-orange/50" 
                      : isAvailable 
                        ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 border border-gray-300 dark:border-white/20" 
                        : "bg-gray-300 dark:bg-gray-600/50 text-gray-500 dark:text-gray-400 cursor-not-allowed border border-gray-400 dark:border-gray-600"
                    }
                  `}
                >
                  {key === "color" ? (
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div 
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: String(option) }}
                      />
                      <span>{String(option)}</span>
                    </div>
                  ) : (
                    String(option)
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Selected Variant Info */}
      {selectedVariant && (
        <div className="glass rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {messages?.products?.sku || 'SKU'}:
            </span>
            <span className="text-sm text-gray-900 dark:text-white font-mono">{selectedVariant.sku}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {messages?.products?.price || 'قیمت'}:
            </span>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {formatPrice(selectedVariant.price)}
              </div>
              {selectedVariant.comparePrice && selectedVariant.comparePrice > selectedVariant.price && (
                <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  {formatPrice(selectedVariant.comparePrice)}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {messages?.products?.stock || 'موجودی'}:
            </span>
            <span className={`text-sm font-medium ${
              selectedVariant.isInStock ? "text-primary-orange" : "text-red-400"
            }`}>
              {selectedVariant.isInStock 
                ? `${selectedVariant.stockQuantity} ${messages?.products?.stockAvailable || 'عدد موجود'}` 
                : (messages?.products?.outOfStock || 'ناموجود')
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
