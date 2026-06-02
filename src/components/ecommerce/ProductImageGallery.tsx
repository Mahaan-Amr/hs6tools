"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

interface ProductGalleryImage {
  id: string;
  url: string;
  alt?: string | null;
  isPrimary?: boolean;
}

interface ProductImageGalleryProps {
  images: ProductGalleryImage[];
  productName: string;
  isFeatured?: boolean;
  featuredLabel: string;
}

export default function ProductImageGallery({
  images,
  productName,
  isFeatured = false,
  featuredLabel,
}: ProductImageGalleryProps) {
  const initialImage = useMemo(
    () => images.find((image) => image.isPrimary) ?? images[0],
    [images]
  );
  const [selectedImageId, setSelectedImageId] = useState(initialImage?.id ?? "");
  const selectedImage = images.find((image) => image.id === selectedImageId) ?? initialImage;

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-3xl glass">
        {selectedImage ? (
          <Image
            key={selectedImage.id}
            src={selectedImage.url}
            alt={selectedImage.alt || productName}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
            <svg className="h-16 w-16 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {isFeatured && (
          <div className="absolute right-4 top-4">
            <span className="rounded-full bg-gradient-to-r from-primary-orange to-orange-500 px-3 py-1 text-xs font-bold text-white">
              {featuredLabel}
            </span>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.slice(0, 4).map((image) => {
            const isSelected = selectedImage?.id === image.id;

            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setSelectedImageId(image.id)}
                aria-pressed={isSelected}
                aria-label={image.alt || productName}
                className={`relative aspect-square overflow-hidden rounded-2xl glass transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-orange ${
                  isSelected ? "ring-2 ring-primary-orange" : "hover:ring-2 hover:ring-primary-orange"
                }`}
              >
                <Image
                  src={image.url}
                  alt={image.alt || productName}
                  fill
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
