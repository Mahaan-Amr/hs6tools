"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface CategoryCardProps {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  productCount: number;
  subcategoryCount: number;
  locale: string;
  isParent?: boolean;
}

export default function CategoryCard({
  slug,
  name,
  description,
  image,
  icon,
  productCount,
  subcategoryCount,
  locale,
  isParent = false
}: CategoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  return (
    <Link href={`/${locale}/categories/${slug}`}>
      <div
        className="group relative glass rounded-3xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-glass-orange cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Image or Icon */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className={`object-cover transition-transform duration-300 ${
                isHovered ? "scale-110" : "scale-100"
              } ${isImageLoading ? "blur-sm" : "blur-0"}`}
              onLoad={() => setIsImageLoading(false)}
              onError={() => setIsImageLoading(false)}
            />
          ) : icon ? (
            <div className="w-full h-full bg-gradient-to-br from-primary-orange/20 to-orange-500/20 flex items-center justify-center">
              <div className="text-6xl">{icon}</div>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          )}
          
          {/* Overlay */}
          <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            isHovered ? "opacity-60" : "opacity-40"
          }`} />
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
          {/* Category Type Badge */}
          {isParent && (
            <div className="mb-3">
              <span className="bg-primary-orange/80 text-white text-xs font-bold px-2 py-1 rounded-full">
                دسته اصلی
              </span>
            </div>
          )}

          {/* Category Name */}
          <h3 className="text-xl font-bold mb-2 group-hover:text-primary-orange transition-colors duration-200">
            {name}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-gray-200 text-sm mb-4 line-clamp-2">
              {description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-primary-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <span>{productCount} محصول</span>
            </div>
            
            {subcategoryCount > 0 && (
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-primary-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>{subcategoryCount} زیردسته</span>
              </div>
            )}
          </div>

          {/* View Button */}
          <div className={`mt-4 transition-all duration-300 ${
            isHovered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}>
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <span className="text-sm font-medium">مشاهده دسته</span>
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
