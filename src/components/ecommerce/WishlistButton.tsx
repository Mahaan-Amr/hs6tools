"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  initialIsInWishlist?: boolean;
  labels: {
    add: string;
    remove: string;
    loginRequired: string;
  };
}

export default function WishlistButton({
  productId,
  className = "",
  initialIsInWishlist = false,
  labels,
}: WishlistButtonProps) {
  const { data: session } = useSession();
  const [isInWishlist, setIsInWishlist] = useState(initialIsInWishlist);
  const [isLoading, setIsLoading] = useState(false);

  const toggleWishlist = async () => {
    if (!session?.user) return;

    setIsLoading(true);

    try {
      if (isInWishlist) {
        const response = await fetch(`/api/wishlist?productId=${productId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setIsInWishlist(false);
        } else {
          console.error("Failed to remove from wishlist");
        }
      } else {
        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId }),
        });

        if (response.ok) {
          setIsInWishlist(true);
        } else {
          console.error("Failed to add to wishlist");
        }
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user) {
    return (
      <button
        className={`p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 ${className}`}
        title={labels.loginRequired}
        disabled
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={toggleWishlist}
      disabled={isLoading}
      className={`
        p-2 transition-all duration-200 rounded-full hover:bg-red-500/20 
        ${
          isInWishlist
            ? "text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-600"
            : "text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
        } 
        ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
      title={isInWishlist ? labels.remove : labels.add}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isInWishlist ? (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )}
    </button>
  );
}
