"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface Review {
  id: string;
  title: string;
  content: string;
  rating: number;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
  locale: string;
}

export default function ProductReviews({ productId, productName, locale }: ProductReviewsProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ totalReviews: 0, averageRating: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    title: "",
    content: "",
    rating: 5
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await fetch(`/api/products/${productId}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.data.reviews);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newReview)
      });

      if (response.ok) {
        setNewReview({ title: "", content: "", rating: 5 });
        setShowReviewForm(false);
        // Refresh reviews
        await fetchReviews();
        // You could add a success toast here
      } else {
        const errorData = await response.json();
        console.error("Failed to submit review:", errorData);
        // You could add an error toast here
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      locale === "fa" ? "fa-IR" : "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric"
      }
    );
  };

  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1 space-x-reverse">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : "button"}
            onClick={interactive && onChange ? () => onChange(star) : undefined}
            disabled={!interactive}
            className={`
              ${interactive ? "cursor-pointer hover:scale-110" : ""}
              transition-all duration-200
            `}
          >
            {star <= rating ? (
              <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">
            نظرات کاربران
          </h3>
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="flex items-center space-x-2 space-x-reverse">
              {renderStars(stats.averageRating)}
              <span className="text-gray-400 text-sm">
                {stats.averageRating.toFixed(1)} از 5
              </span>
            </div>
            <span className="text-gray-400 text-sm">
              {stats.totalReviews} نظر
            </span>
          </div>
        </div>
        
        {session?.user && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2 bg-primary-orange text-white rounded-xl hover:bg-orange-600 transition-colors duration-200"
          >
            {showReviewForm ? "انصراف" : "نظر دهید"}
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && session?.user && (
        <div className="glass rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4">
            نظر خود را درباره {productName} بنویسید
          </h4>
          
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                عنوان نظر
              </label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
                placeholder="عنوان کوتاه برای نظر خود"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                امتیاز
              </label>
              {renderStars(newReview.rating, true, (rating) => 
                setNewReview({ ...newReview, rating })
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                متن نظر
              </label>
              <textarea
                value={newReview.content}
                onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange resize-none"
                placeholder="تجربه خود را از این محصول به اشتراک بگذارید..."
                required
                minLength={10}
              />
            </div>
            
            <div className="flex justify-end space-x-3 space-x-reverse">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-primary-orange text-white rounded-xl hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50"
              >
                {isSubmitting ? "در حال ارسال..." : "ارسال نظر"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="glass rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 bg-primary-orange rounded-full flex items-center justify-center text-white font-semibold">
                    {review.user.firstName.charAt(0)}{review.user.lastName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {review.user.firstName} {review.user.lastName}
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatDate(review.createdAt)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 space-x-reverse">
                  {renderStars(review.rating)}
                </div>
              </div>
              
              {review.title && (
                <h5 className="font-semibold text-white mb-2">
                  {review.title}
                </h5>
              )}
              
              <p className="text-gray-300 leading-relaxed">
                {review.content}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-gray-400 mb-4">
            هنوز نظری برای این محصول ثبت نشده است
          </p>
          {session?.user && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-6 py-2 bg-primary-orange text-white rounded-xl hover:bg-orange-600 transition-colors duration-200"
            >
              اولین نظر را شما بدهید
            </button>
          )}
        </div>
      )}
    </div>
  );
}
