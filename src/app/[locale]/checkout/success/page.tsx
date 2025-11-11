import Link from "next/link";

interface CheckoutSuccessPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ orderNumber?: string }>;
}

export default async function CheckoutSuccessPage({ params, searchParams }: CheckoutSuccessPageProps) {
  const { locale } = await params;
  const { orderNumber } = await searchParams;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          {/* Success Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            سفارش شما با موفقیت ثبت شد!
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 max-w-2xl mx-auto text-justify leading-relaxed">
            از خرید شما متشکریم. سفارش شما در حال پردازش است و به زودی از طریق ایمیل یا پیامک، 
            اطلاعات تکمیلی ارسال خواهد شد.
          </p>
          
          {/* Order Details */}
          <div className="glass rounded-3xl p-8 mb-8 max-w-lg mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">جزئیات سفارش</h2>
            <div className="space-y-3 text-left">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">شماره سفارش:</span>
                <span className="text-gray-900 dark:text-white font-medium">#{orderNumber || `HS6-${Date.now().toString().slice(-6)}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">تاریخ ثبت:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {new Date().toLocaleDateString(locale === "fa" ? "fa-IR" : "en-US")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">وضعیت:</span>
                <span className="text-green-600 dark:text-green-400 font-medium">در حال پردازش</span>
              </div>
            </div>
          </div>
          
          {/* Next Steps */}
          <div className="glass rounded-3xl p-8 mb-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">مراحل بعدی</h3>
            <div className="space-y-3 text-left text-gray-600 dark:text-gray-300">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-orange/20 text-primary-orange rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  1
                </div>
                <p>تایید پرداخت و بررسی سفارش توسط تیم ما</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-orange/20 text-primary-orange rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  2
                </div>
                <p>آماده‌سازی و بسته‌بندی محصولات</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-orange/20 text-primary-orange rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  3
                </div>
                <p>ارسال از طریق پست یا تیپاکس</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-orange/20 text-primary-orange rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  4
                </div>
                <p>تحویل در آدرس ثبت شده</p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-x-4">
            <Link
              href={`/${locale}/shop`}
              className="inline-block bg-gradient-to-r from-primary-orange to-orange-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-glass-orange hover:scale-105 transition-all duration-200"
            >
              ادامه خرید
            </Link>
            
            <Link
              href={`/${locale}`}
              className="inline-block glass border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200"
            >
              بازگشت به خانه
            </Link>
          </div>
          
          {/* Contact Info */}
          <div className="mt-12 p-6 glass rounded-2xl max-w-lg mx-auto">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">نیاز به کمک دارید؟</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              در صورت وجود هرگونه سوال یا مشکل، با ما تماس بگیرید:
            </p>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>📧 ایمیل: support@hs6tools.com</p>
              <p>📞 تلفن: 021-12345678</p>
              <p>💬 واتساپ: 09123456789</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
