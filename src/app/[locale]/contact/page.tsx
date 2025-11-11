export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12" data-scroll-reveal>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            تماس با ما
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-justify leading-relaxed">
            ما آماده پاسخگویی به سوالات و درخواست‌های شما هستیم
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="glass rounded-3xl p-8" data-scroll-reveal>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">فرم تماس</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 dark:text-white text-sm font-medium mb-2">نام</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    placeholder="نام خود را وارد کنید"
                  />
                </div>
                <div>
                  <label className="block text-gray-900 dark:text-white text-sm font-medium mb-2">نام خانوادگی</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    placeholder="نام خانوادگی خود را وارد کنید"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-900 dark:text-white text-sm font-medium mb-2">ایمیل</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  placeholder="ایمیل خود را وارد کنید"
                />
              </div>
              
              <div>
                <label className="block text-gray-900 dark:text-white text-sm font-medium mb-2">موضوع</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  placeholder="موضوع پیام خود را وارد کنید"
                />
              </div>
              
              <div>
                <label className="block text-gray-900 dark:text-white text-sm font-medium mb-2">پیام</label>
                <textarea 
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent resize-none"
                  placeholder="پیام خود را وارد کنید"
                ></textarea>
              </div>
              
              <button 
                type="submit"
                className="w-full px-8 py-4 bg-gradient-to-r from-primary-orange to-orange-500 text-white font-semibold rounded-xl hover:scale-105 transition-transform duration-300"
              >
                ارسال پیام
              </button>
            </form>
          </div>
          
          {/* Contact Information */}
          <div className="space-y-8">
          <div className="glass rounded-3xl p-8" data-scroll-reveal style={{ transitionDelay: "0.1s" }}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">اطلاعات تماس</h2>
              <div className="space-y-4">
            <div className="flex items-center gap-4 gap-x-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-primary-orange to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-orange/20">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-gray-900 dark:text-white font-semibold text-lg">آدرس</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed">تهران، خیابان ولیعصر، پلاک ۱۲۳</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 gap-x-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-primary-orange to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-orange/20">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-gray-900 dark:text-white font-semibold text-lg">تلفن</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed">۰۲۱-۱۲۳۴۵۶۷۸</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 gap-x-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-primary-orange to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-orange/20">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-gray-900 dark:text-white font-semibold text-lg">ایمیل</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed">info@hs6tools.com</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="glass rounded-3xl p-8" data-scroll-reveal style={{ transitionDelay: "0.2s" }}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">ساعات کاری</h2>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p>شنبه تا چهارشنبه: ۸ صبح تا ۶ عصر</p>
                <p>پنجشنبه: ۸ صبح تا ۱ ظهر</p>
                <p>جمعه: تعطیل</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
