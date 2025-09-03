export default function BlogSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="glass rounded-3xl overflow-hidden animate-pulse">
          {/* Image Skeleton */}
          <div className="aspect-video bg-gray-700/50"></div>
          
          <div className="p-6 space-y-4">
            {/* Category and Date Skeleton */}
            <div className="flex items-center space-x-2">
              <div className="w-20 h-6 bg-gray-700/50 rounded-full"></div>
              <div className="w-16 h-4 bg-gray-700/50 rounded-full"></div>
            </div>
            
            {/* Title Skeleton */}
            <div className="space-y-2">
              <div className="w-full h-6 bg-gray-700/50 rounded"></div>
              <div className="w-3/4 h-6 bg-gray-700/50 rounded"></div>
            </div>
            
            {/* Excerpt Skeleton */}
            <div className="space-y-2">
              <div className="w-full h-4 bg-gray-700/50 rounded"></div>
              <div className="w-5/6 h-4 bg-gray-700/4 rounded"></div>
            </div>
            
            {/* Button Skeleton */}
            <div className="w-24 h-4 bg-gray-700/50 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
