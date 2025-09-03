"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface WishlistItem {
  productId: string;
  product: {
    id: string;
    name: string;
  };
}

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export default function WishlistButton({ productId, className = "" }: WishlistButtonProps) {
  const { data: session } = useSession();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkWishlistStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/wishlist");
      if (response.ok) {
        const data = await response.json();
        const isInWishlist = data.data.some((item: WishlistItem) => item.productId === productId);
        setIsInWishlist(isInWishlist);
      }
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    }
  }, [productId]);

  // Check if product is in wishlist on mount
  useEffect(() => {
    if (session?.user) {
      checkWishlistStatus();
    }
  }, [session?.user, checkWishlistStatus]);

  const toggleWishlist = async () => {
    if (!session?.user) {
      // Redirect to login or show login modal
      return;
    }

    setIsLoading(true);

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch(`/api/wishlist?productId=${productId}`, {
          method: "DELETE"
        });

        if (response.ok) {
          setIsInWishlist(false);
          // You could add a toast notification here
        } else {
          console.error("Failed to remove from wishlist");
        }
      } else {
        // Add to wishlist
        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ productId })
        });

        if (response.ok) {
          setIsInWishlist(true);
          // You could add a toast notification here
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
        className={`p-2 text-gray-400 hover:text-red-400 transition-colors duration-200 ${className}`}
        title="ورود برای افزودن به لیست علاقه‌مندی"
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
        ${isInWishlist 
          ? "text-red-500 hover:text-red-600" 
          : "text-gray-400 hover:text-red-400"
        } 
        ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
      title={isInWishlist ? "حذف از لیست علاقه‌مندی" : "افزودن به لیست علاقه‌مندی"}
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
