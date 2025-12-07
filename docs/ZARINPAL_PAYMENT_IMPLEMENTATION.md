# راهنمای پیاده‌سازی کامل درگاه پرداخت زرین‌پال

## اطلاعات درگاه
- **کد درگاه پرداخت (Merchant ID):** `34f387ef-3ba2-41ba-85ee-c86813806726`
- **زیردامنه اختصاصی:** `pay.hs6tools.com`
- **وضعیت:** ✅ پیاده‌سازی کامل (آماده برای تست)

## معماری پیاده‌سازی

### 1. کتابخانه Zarinpal (`src/lib/zarinpal.ts`)
کتابخانه اصلی برای ارتباط با API زرین‌پال شامل:
- `requestPayment()` - درخواست پرداخت و دریافت لینک پرداخت
- `verifyPayment()` - تأیید پرداخت پس از بازگشت کاربر
- `unverifiedTransactions()` - دریافت تراکنش‌های تأیید نشده
- `refundPayment()` - بازپرداخت (در صورت نیاز)

### 2. API Endpoints

#### `/api/payment/zarinpal/request`
- **Method:** POST
- **Input:** `{ orderId: string }`
- **Output:** `{ success: boolean, paymentUrl: string, authority: string }`
- **Description:** ایجاد درخواست پرداخت و دریافت لینک پرداخت زرین‌پال

#### `/api/payment/zarinpal/callback`
- **Method:** GET
- **Query Params:** `Authority`, `Status`
- **Output:** Redirect to success/failure page
- **Description:** دریافت callback از زرین‌پال و تأیید پرداخت

#### `/api/payment/zarinpal/verify`
- **Method:** POST
- **Input:** `{ authority: string, orderId: string }`
- **Output:** `{ success: boolean, refId: string, order: Order }`
- **Description:** تأیید دستی پرداخت (برای استفاده داخلی)

### 3. جریان پرداخت

```
1. کاربر در صفحه Checkout روی "پرداخت" کلیک می‌کند
2. Order در دیتابیس ایجاد می‌شود (status: PENDING, paymentStatus: PENDING)
3. درخواست به /api/payment/zarinpal/request ارسال می‌شود
4. لینک پرداخت زرین‌پال دریافت می‌شود
5. کاربر به pay.hs6tools.com هدایت می‌شود
6. کاربر پرداخت را انجام می‌دهد
7. زرین‌پال کاربر را به /api/payment/zarinpal/callback?Authority=xxx&Status=OK هدایت می‌کند
8. سیستم پرداخت را تأیید می‌کند
9. Order status به CONFIRMED و paymentStatus به PAID تغییر می‌کند
10. کاربر به صفحه success هدایت می‌شود
```

### 4. مدیریت خطا

- **خطای درخواست پرداخت:** نمایش پیام خطا و بازگشت به checkout
- **خطای تأیید پرداخت:** بررسی مجدد با unverifiedTransactions
- **پرداخت ناموفق:** نمایش پیام خطا و بازگشت به checkout
- **لغو پرداخت:** بازگشت به checkout با پیام مناسب

### 5. امنیت

- ✅ بررسی صحت Authority در callback
- ✅ بررسی مبلغ پرداخت با مبلغ سفارش
- ✅ استفاده از HTTPS برای تمام ارتباطات
- ✅ ذخیره‌سازی امن Merchant ID و API Key
- ✅ لاگ تمام تراکنش‌ها برای بررسی

## وضعیت پیاده‌سازی

- [x] کتابخانه Zarinpal ایجاد شده (`src/lib/zarinpal.ts`)
- [x] API endpoint درخواست پرداخت (`/api/payment/zarinpal/request`)
- [x] API endpoint callback/verification (`/api/payment/zarinpal/callback`)
- [x] به‌روزرسانی جریان checkout (هدایت به زرین‌پال)
- [x] صفحه پرداخت موفق/ناموفق (صفحه success با نمایش refId)
- [x] مدیریت خطاها (نمایش خطاها در صفحه checkout)
- [x] به‌روزرسانی وضعیت سفارش پس از پرداخت
- [ ] تست در حالت Sandbox (نیاز به تنظیم Merchant ID در پنل ادمین)
- [ ] تست در حالت Production
- [x] مستندات کامل

## مراحل بعدی

1. **تنظیم Merchant ID:**
   - وارد پنل ادمین شوید
   - به بخش Settings → Payment Settings بروید
   - Merchant ID را وارد کنید: `34f387ef-3ba2-41ba-85ee-c86813806726`
   - API Key را از پنل زرین‌پال دریافت و وارد کنید
   - حالت Sandbox را برای تست فعال کنید
   - تنظیمات را ذخیره کنید

2. **تنظیم زیردامنه:**
   - مراحل تنظیم CNAME را در Cloudflare انجام دهید
   - زیردامنه `pay.hs6tools.com` را فعال کنید
   - راهنمای کامل: [docs/ZARINPAL_SUBDOMAIN_SETUP.md](docs/ZARINPAL_SUBDOMAIN_SETUP.md)

3. **تست جریان پرداخت:**
   - یک سفارش تستی ایجاد کنید
   - به صفحه پرداخت زرین‌پال هدایت می‌شوید
   - در حالت Sandbox از کارت تست استفاده کنید
   - پس از پرداخت، به صفحه success هدایت می‌شوید
   - وضعیت سفارش در دیتابیس به PAID تغییر می‌کند

## منابع

- [مستندات رسمی زرین‌پال](https://www.zarinpal.com/docs/)
- [راهنمای تنظیم زیردامنه](docs/ZARINPAL_SUBDOMAIN_SETUP.md)

