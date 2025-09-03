"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface ImageFile {
  id: string;
  name: string;
  originalName: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  alt?: string;
  title?: string;
  isPrimary?: boolean;
}

interface ImageUploadProps {
  images: ImageFile[];
  onImagesChange: (images: ImageFile[]) => void;
  multiple?: boolean;
  maxImages?: number;
  className?: string;
  label?: string;
  required?: boolean;
  category?: string; // Add category for proper file organization
}

export default function ImageUpload({
  images,
  onImagesChange,
  multiple = false,
  maxImages = 10,
  className = "",
  label = "تصاویر",
  required = false,
  category
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check if we're at max capacity
    if (images.length + files.length > maxImages) {
      setUploadError(`حداکثر ${maxImages} تصویر مجاز است`);
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const newImages: ImageFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", category || "general");

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "خطا در آپلود تصویر");
        }

        const result = await response.json();
        if (result.success) {
          newImages.push(result.file);
        }
      }

      // Update images based on multiple setting
      if (multiple) {
        onImagesChange([...images, ...newImages]);
      } else {
        onImagesChange(newImages);
      }

    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error instanceof Error ? error.message : "خطا در آپلود تصاویر");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (imageId: string) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    onImagesChange(updatedImages);
  };

  const setPrimaryImage = (imageId: string) => {
    if (!multiple) return;
    
    const updatedImages = images.map(img => ({
      ...img,
      isPrimary: img.id === imageId
    }));
    onImagesChange(updatedImages);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-white">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        {multiple && (
          <span className="text-xs text-gray-400">
            {images.length}/{maxImages} تصویر
          </span>
        )}
      </div>

      {/* Upload Area */}
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`w-full p-8 border-2 border-dashed rounded-xl text-center transition-all duration-200 ${
            isUploading
              ? "border-gray-500 bg-gray-800/50 cursor-not-allowed"
              : "border-white/20 hover:border-primary-orange hover:bg-white/5 cursor-pointer"
          }`}
        >
          {isUploading ? (
            <div className="space-y-3">
              <div className="w-8 h-8 border-2 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-white">در حال آپلود...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <svg className="w-12 h-12 text-white/40 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div>
                <p className="text-white font-medium">برای آپلود تصویر کلیک کنید</p>
                <p className="text-white/60 text-sm mt-1">
                  یا فایل را اینجا بکشید و رها کنید
                </p>
                <p className="text-white/40 text-xs mt-2">
                  فرمت‌های مجاز: JPEG, PNG, WebP, AVIF (حداکثر 5MB)
                </p>
              </div>
            </div>
          )}
        </button>
      </div>

      {/* Error Display */}
      {uploadError && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{uploadError}</p>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              {/* Image */}
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-800">
                <Image
                  src={image.url}
                  alt={image.alt || image.originalName}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
                {multiple && (
                  <button
                    onClick={() => setPrimaryImage(image.id)}
                    className="p-2 bg-blue-500/80 hover:bg-blue-500 rounded-lg transition-colors"
                    title="تنظیم به عنوان تصویر اصلی"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                )}
                
                <button
                  onClick={() => removeImage(image.id)}
                  className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors"
                  title="حذف تصویر"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-white text-xs">
                <p className="truncate">{image.originalName}</p>
                <p className="text-gray-300">{formatFileSize(image.size)}</p>
              </div>

              {/* Primary Badge */}
              {multiple && image.isPrimary && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  اصلی
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
