export default function FontTest() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-4xl font-bold text-primary-orange">
        تست فونت Vazirmatn
      </h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-thin mb-2">وزن نازک (Thin - 100)</h2>
          <p className="font-thin text-lg">
            این متن با وزن نازک فونت Vazirmatn نمایش داده می‌شود. این فونت برای نمایش متن‌های ظریف و زیبا طراحی شده است.
          </p>
        </div>
        
        <div>
          <h2 className="text-2xl font-light mb-2">وزن روشن (Light - 300)</h2>
          <p className="font-light text-lg">
            این متن با وزن روشن فونت Vazirmatn نمایش داده می‌شود. این وزن برای خوانایی بهتر در صفحات وب مناسب است.
          </p>
        </div>
        
        <div>
          <h2 className="text-2xl font-normal mb-2">وزن معمولی (Regular - 400)</h2>
          <p className="font-normal text-lg">
            این متن با وزن معمولی فونت Vazirmatn نمایش داده می‌شود. این وزن استاندارد برای متن‌های اصلی و محتوا است.
          </p>
        </div>
        
        <div>
          <h2 className="text-2xl font-medium mb-2">وزن متوسط (Medium - 500)</h2>
          <p className="font-medium text-lg">
            این متن با وزن متوسط فونت Vazirmatn نمایش داده می‌شود. این وزن برای عناوین فرعی و تأکید مناسب است.
          </p>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-2">وزن ضخیم (Bold - 700)</h2>
          <p className="font-bold text-lg">
            این متن با وزن ضخیم فونت Vazirmatn نمایش داده می‌شود. این وزن برای عناوین اصلی و تأکید قوی استفاده می‌شود.
          </p>
        </div>
      </div>
      
      <div className="mt-8 p-6 bg-gray-100 rounded-lg">
        <h3 className="text-xl font-semibold mb-3">اطلاعات فونت:</h3>
        <ul className="space-y-2 text-sm">
          <li>• نام فونت: Vazirmatn</li>
          <li>• نوع: فونت فارسی/عربی</li>
          <li>• وزن‌های موجود: 100, 300, 400, 500, 700</li>
          <li>• فرمت: WOFF2 (بهینه‌سازی شده)</li>
          <li>• پشتیبانی: RTL، اعداد فارسی، حروف عربی</li>
        </ul>
      </div>
    </div>
  );
}
