"use client";

interface TopProductsProps {
  products: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
}

export default function TopProducts({ products }: TopProductsProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <p className="text-gray-400">محصولی برای نمایش وجود ندارد</p>
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

  return (
    <div className="space-y-4">
      {products.map((product, index) => (
        <div key={product.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* Rank Badge */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              index === 0 ? 'bg-yellow-500 text-white' :
              index === 1 ? 'bg-gray-400 text-white' :
              index === 2 ? 'bg-orange-600 text-white' :
              'bg-white/10 text-gray-300'
            }`}>
              {index + 1}
            </div>

            {/* Product Info */}
            <div className="flex-1">
              <h4 className="font-medium text-white truncate max-w-32">{product.name}</h4>
              <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-400">
                <span>فروش: {product.sales}</span>
                <span>درآمد: {formatCurrency(product.revenue)}</span>
              </div>
            </div>
          </div>

          {/* Performance Indicator */}
          <div className="text-right">
            <div className="text-lg font-bold text-primary-orange">
              {formatCurrency(product.revenue)}
            </div>
            <div className="text-xs text-gray-400">
              {((product.revenue / products[0].revenue) * 100).toFixed(1)}% از برترین
            </div>
          </div>
        </div>
      ))}

      {/* Summary */}
      <div className="pt-4 border-t border-white/10">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary-orange">
              {products.reduce((sum, p) => sum + p.sales, 0)}
            </div>
            <div className="text-sm text-gray-400">کل فروش</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-500">
              {formatCurrency(products.reduce((sum, p) => sum + p.revenue, 0))}
            </div>
            <div className="text-sm text-gray-400">کل درآمد</div>
          </div>
        </div>
      </div>
    </div>
  );
}
