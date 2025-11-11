export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            درباره HS6Tools
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            ما تولید کننده تخصصی ابزارهای صنعتی و نجاری با کیفیت برتر هستیم
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">تاریخچه شرکت</h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
              HS6Tools با بیش از ۱۵ سال تجربه در زمینه تولید ابزارهای صنعتی، 
              یکی از پیشگامان صنعت ابزارسازی در ایران است. ما متعهد به ارائه 
              محصولات با کیفیت و خدمات حرفه‌ای به مشتریان خود هستیم.
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              تیم متخصص ما با استفاده از جدیدترین تکنولوژی‌ها و مواد اولیه 
              با کیفیت، محصولاتی تولید می‌کند که نیازهای صنعتگران و نجاران 
              را به بهترین شکل برآورده می‌سازد.
            </p>
          </div>
          
          <div className="glass rounded-3xl p-8 text-center">
            <div className="w-32 h-32 bg-gradient-to-r from-primary-orange to-orange-500 rounded-3xl mx-auto mb-6 flex items-center justify-center">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">۱۵+ سال تجربه</h3>
            <p className="text-gray-600 dark:text-gray-300">در تولید ابزارهای صنعتی</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass rounded-3xl p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-primary-orange to-orange-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">کیفیت تضمین شده</h3>
            <p className="text-gray-600 dark:text-gray-300">تمام محصولات ما با بالاترین استانداردهای کیفیت تولید می‌شوند</p>
          </div>
          
          <div className="glass rounded-3xl p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-primary-orange to-orange-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">تکنولوژی پیشرفته</h3>
            <p className="text-gray-600 dark:text-gray-300">استفاده از جدیدترین تکنولوژی‌ها در تولید ابزارهای صنعتی</p>
          </div>
          
          <div className="glass rounded-3xl p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-primary-orange to-orange-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">پشتیبانی 24/7</h3>
            <p className="text-gray-600 dark:text-gray-300">پشتیبانی کامل و مشاوره تخصصی در تمام ساعات شبانه‌روز</p>
          </div>
        </div>
      </div>
    </div>
  );
}
