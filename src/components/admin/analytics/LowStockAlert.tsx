"use client";

interface LowStockAlertProps {
  count: number;
}

export default function LowStockAlert({ count }: LowStockAlertProps) {
  if (count === 0) {
    return (
      <div className="glass rounded-2xl p-6 border border-green-500/20">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">موجودی مناسب</h3>
            <p className="text-gray-400">تمام محصولات موجودی کافی دارند</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 border border-red-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">هشدار کم‌موجودی</h3>
            <p className="text-gray-400">
              {count} محصول موجودی کم دارد و نیاز به بررسی دارد
            </p>
          </div>
        </div>
        
        <button className="px-6 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors">
          مشاهده محصولات
        </button>
      </div>
    </div>
  );
}
