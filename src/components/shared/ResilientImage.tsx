"use client";

import Image, { type ImageProps } from "next/image";
import { type ReactNode, useState } from "react";
import { isThirdPartyImageSource, normalizePublicImageSource } from "@/lib/image-source";

type ResilientImageProps = Omit<ImageProps, "onError"> & {
  fallback?: ReactNode;
  onError?: ImageProps["onError"];
};

export default function ResilientImage({
  src,
  alt,
  fallback,
  onError,
  unoptimized,
  ...imageProps
}: ResilientImageProps) {
  const resolvedSrc = typeof src === "string" ? normalizePublicImageSource(src) : src;
  const [failedSrc, setFailedSrc] = useState<ImageProps["src"] | null>(null);
  const failed = failedSrc === resolvedSrc;

  if (failed) {
    return (
      fallback ?? (
        <div
          className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 text-gray-500 dark:from-gray-700 dark:to-gray-800 dark:text-gray-400"
          role="img"
          aria-label={`${alt} unavailable`}
          data-testid="image-fallback"
        >
          <svg className="h-14 w-14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2 1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2Z" />
          </svg>
        </div>
      )
    );
  }

  return (
    <Image
      {...imageProps}
      src={resolvedSrc}
      alt={alt}
      unoptimized={
        unoptimized ?? (typeof resolvedSrc === "string" && isThirdPartyImageSource(resolvedSrc))
      }
      onError={(event) => {
        setFailedSrc(resolvedSrc);
        onError?.(event);
      }}
    />
  );
}
