"use client";

interface TopCategoriesProps {
  categories: Array<{
    id: string;
    name: string;
    revenue: number;
  }>;
}

export default function TopCategories({ categories }: TopCategoriesProps) {
  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
        <p className="text-gray-400">دسته‌بندی‌ای برای نمایش وجود ندارد</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M';
    }
    if (amount >= 1000) {
      return (amount / 1000).toFixed(1) + 'K';
    }
    return amount.toString();
  };

  const maxRevenue = Math.max(...categories.map(cat => cat.revenue));

  return (
    <div className="space-y-4">
      {categories.map((category, index) => (
        <div key={category.id} className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3 space-x-reverse">
              {/* Rank Badge */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                index === 0 ? 'bg-yellow-500 text-white' :
                index === 1 ? 'bg-gray-400 text-white' :
                index === 2 ? 'bg-orange-600 text-white' :
                'bg-white/10 text-gray-300'
              }`}>
                {index + 1}
              </div>

              {/* Category Name */}
              <h4 className="font-medium text-white">{category.name}</h4>
            </div>

            {/* Revenue */}
            <div className="text-right">
              <div className="text-lg font-bold text-primary-orange">
                {formatCurrency(category.revenue)}
              </div>
              <div className="text-xs text-gray-400">
                {((category.revenue / maxRevenue) * 100).toFixed(1)}% از برترین
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary-orange to-orange-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(category.revenue / maxRevenue) * 100}%`
              }}
            ></div>
          </div>
        </div>
      ))}

      {/* Summary */}
      <div className="pt-4 border-t border-white/10">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-orange">
            {formatCurrency(categories.reduce((sum, cat) => sum + cat.revenue, 0))}
          </div>
          <div className="text-sm text-gray-400">کل درآمد از دسته‌بندی‌ها</div>
        </div>
      </div>
    </div>
  );
}
