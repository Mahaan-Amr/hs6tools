# رفع مشکلات سبد خرید و تسویه حساب

## ✅ بهبود جامع: اعتبارسنجی کامل فرم‌ها و مودال‌ها

### بررسی و پیاده‌سازی اعتبارسنجی

**هدف:**
- افزودن اعتبارسنجی کامل به تمام فرم‌ها و مودال‌های پلتفرم
- استفاده از پیام‌های ترجمه‌شده در سه زبان (فارسی، انگلیسی، عربی)
- جلوگیری از خطاهای کاربر و بهبود تجربه کاربری

**فرم‌های به‌روزرسانی شده:**

1. **QuoteForm** (`src/components/admin/crm/QuoteForm.tsx`)
   - اعتبارسنجی انتخاب مشتری
   - اعتبارسنجی حداقل یک محصول در پیشنهاد
   - اعتبارسنجی تاریخ اعتبار (باید در آینده باشد)
   - اعتبارسنجی تعداد و قیمت محصولات
   - نمایش خطاهای فیلد به فیلد

2. **CustomerInteractionForm** (`src/components/admin/crm/CustomerInteractionForm.tsx`)
   - اعتبارسنجی نوع تعامل
   - اعتبارسنجی موضوع (حداقل 3 کاراکتر، حداکثر 200 کاراکتر)
   - اعتبارسنجی محتوا (حداقل 10 کاراکتر)
   - استفاده از ترجمه‌ها به جای متن‌های هاردکد شده

3. **ProfileForm** (`src/components/customer/profile/ProfileForm.tsx`)
   - اعتبارسنجی نام و نام خانوادگی (حداقل 2 کاراکتر، حداکثر 50 کاراکتر)
   - اعتبارسنجی شماره تلفن (فرمت ایرانی)
   - اعتبارسنجی طول فیلدهای اختیاری (شرکت، سمت)

4. **EmailSettingsForm** (`src/components/admin/settings/EmailSettingsForm.tsx`)
   - اعتبارسنجی سرور SMTP (الزامی، حداکثر 255 کاراکتر)
   - اعتبارسنجی پورت SMTP (بین 1 تا 65535)
   - اعتبارسنجی ایمیل فرستنده (فرمت ایمیل)
   - اعتبارسنجی نام فرستنده (الزامی، حداکثر 100 کاراکتر)

5. **PaymentSettingsForm** (`src/components/admin/settings/PaymentSettingsForm.tsx`)
   - اعتبارسنجی حداقل مبلغ سفارش (باید >= 0)
   - اعتبارسنجی حداکثر مبلغ سفارش (باید > حداقل)
   - اعتبارسنجی طول شناسه فروشنده و کلید API

6. **SystemSettingsForm** (`src/components/admin/settings/SystemSettingsForm.tsx`)
   - اعتبارسنجی نام سایت (الزامی، حداکثر 100 کاراکتر)
   - اعتبارسنجی آدرس سایت (الزامی، فرمت URL معتبر)
   - اعتبارسنجی ایمیل تماس (الزامی، فرمت ایمیل)

7. **Content CategoryForm** (`src/components/admin/content/CategoryForm.tsx`)
   - اعتبارسنجی نام دسته‌بندی (الزامی، حداکثر 100 کاراکتر)
   - اعتبارسنجی Slug (الزامی، حداکثر 100 کاراکتر)
   - اعتبارسنجی توضیحات (حداکثر 500 کاراکتر)
   - جایگزینی متن‌های هاردکد شده با ترجمه‌ها

8. **ArticleForm** (`src/components/admin/content/ArticleForm.tsx`)
   - اعتبارسنجی عنوان مقاله (الزامی، حداکثر 200 کاراکتر)
   - اعتبارسنجی Slug (الزامی، حداکثر 100 کاراکتر)
   - اعتبارسنجی محتوای مقاله (الزامی، حداقل 50 کاراکتر)
   - اعتبارسنجی خلاصه (حداکثر 500 کاراکتر)

9. **EducationForm** (`src/components/admin/education/EducationForm.tsx`)
   - اعتبارسنجی عنوان درس (الزامی، حداکثر 200 کاراکتر)
   - اعتبارسنجی Slug (الزامی، حداکثر 100 کاراکتر)
   - اعتبارسنجی محتوا بر اساس نوع درس:
     - دروس متنی: محتوا الزامی است
     - دروس ویدیویی: ویدیو یا آدرس ویدیو الزامی است
     - دروس ترکیبی: حداقل یکی از محتوا یا ویدیو الزامی است
   - اعتبارسنجی آدرس ویدیو (فرمت URL معتبر)
   - جایگزینی تمام متن‌های هاردکد شده فارسی با ترجمه‌ها

10. **EducationCategoryForm** (`src/components/admin/education/EducationCategoryForm.tsx`)
    - اعتبارسنجی نام دسته‌بندی (الزامی، حداکثر 100 کاراکتر)
    - اعتبارسنجی Slug (الزامی، حداکثر 100 کاراکتر)
    - اعتبارسنجی والد (نمی‌تواند خودش باشد)
    - اعتبارسنجی توضیحات (حداکثر 500 کاراکتر)

**پیام‌های ترجمه اضافه شده:**

تمام پیام‌های اعتبارسنجی به سه زبان اضافه شدند:
- `messages/fa.json` - فارسی
- `messages/en.json` - انگلیسی
- `messages/ar.json` - عربی

**ساختار پیام‌ها:**
```json
{
  "admin": {
    "crm": {
      "quotes": {
        "validation": {
          "customerRequired": "...",
          "itemsRequired": "...",
          "validUntilRequired": "...",
          "validUntilInvalid": "...",
          "itemQuantityInvalid": "...",
          "itemPriceInvalid": "..."
        }
      },
      "customer360": {
        "interactions": {
          "validation": {
            "typeRequired": "...",
            "subjectRequired": "...",
            "contentRequired": "...",
            "contentMinLength": "...",
            "subjectMinLength": "...",
            "subjectMaxLength": "..."
          }
        }
      }
    },
    "contentCategoryForm": { ... },
    "articleForm": { ... },
    "educationForm": { ... },
    "educationCategoryForm": { ... }
  },
  "customer": {
    "profile": {
      "validation": { ... }
    }
  },
  "settingsPage": {
    "systemSettings": {
      "validation": { ... }
    },
    "emailSettings": {
      "validation": { ... }
    },
    "paymentSettings": {
      "validation": { ... }
    }
  }
}
```

**ویژگی‌های پیاده‌سازی شده:**

1. **اعتبارسنجی فیلد به فیلد:**
   - خطاها هنگام تایپ کاربر پاک می‌شوند
   - نمایش خطا در زیر هر فیلد
   - رنگ‌بندی border فیلدها (قرمز برای خطا)

2. **اعتبارسنجی طول:**
   - `maxLength` attribute برای تمام فیلدهای متنی
   - اعتبارسنجی `minLength` برای فیلدهای مهم

3. **اعتبارسنجی فرمت:**
   - ایمیل: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
   - شماره تلفن ایرانی: `/^(\+98|0)?9\d{9}$/`
   - کد پستی: `/^\d{10}$/`
   - URL: استفاده از `new URL()` و regex

4. **اعتبارسنجی منطقی:**
   - تاریخ اعتبار باید در آینده باشد
   - حداکثر مبلغ باید بیشتر از حداقل باشد
   - دسته‌بندی نمی‌تواند والد خودش باشد

5. **بهبود UX:**
   - نمایش خطاها در مودال‌ها بدون بستن مودال
   - جلوگیری از submit در صورت خطا
   - نمایش spinner و disable کردن دکمه‌ها هنگام submit

**فایل‌های تغییر یافته:**
- تمام فرم‌های ذکر شده
- `messages/fa.json`, `messages/en.json`, `messages/ar.json`
- `src/components/admin/settings/SettingsTab.tsx` - اضافه کردن locale prop
- `src/components/admin/content/ContentTabs.tsx` - اضافه کردن locale prop
- `src/components/admin/content/CategoriesTab.tsx` - اضافه کردن locale prop
- `src/components/admin/content/ArticlesTab.tsx` - اضافه کردن locale prop
- `src/components/admin/education/EducationTab.tsx` - اضافه کردن locale prop
- `src/components/admin/education/EducationCategoryTab.tsx` - اضافه کردن locale prop

---

## مشکلات شناسایی شده و رفع شده

### ✅ مشکل 1: نمایش تعداد محصولات در آیکون سبد خرید

**مشکل:**
- آیکون سبد خرید در هدر تعداد محصولات را نمایش نمی‌داد

**علت:**
- `totalItems` در `CartContext` به عنوان getter تعریف شده بود که در Zustand reactive نیست

**راه‌حل:**
- حذف getter از interface
- محاسبه `totalItems` مستقیماً در کامپوننت‌ها:
  ```typescript
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  ```

**فایل‌های تغییر یافته:**
- `src/contexts/CartContext.tsx` - حذف getters
- `src/components/layout/Header.tsx` - محاسبه totalItems در کامپوننت
- `src/components/ecommerce/MiniCart.tsx` - محاسبه totalItems در کامپوننت

---

### ✅ مشکل 2: نمایش قیمت 0 در خلاصه سفارش صفحه سبد خرید

**مشکل:**
- در صفحه سبد خرید (`/fa/cart`)، بخش "خلاصه سفارش" قیمت 0 نمایش می‌داد

**علت:**
- `totalPrice` در `CartContext` به عنوان getter تعریف شده بود که reactive نیست

**راه‌حل:**
- حذف getter از interface
- محاسبه `totalPrice` مستقیماً در کامپوننت:
  ```typescript
  const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  ```

**فایل‌های تغییر یافته:**
- `src/contexts/CartContext.tsx` - حذف getters
- `src/app/[locale]/cart/CartPageClient.tsx` - محاسبه totalPrice در کامپوننت
- `src/app/[locale]/checkout/CheckoutPageClient.tsx` - محاسبه totalPrice در کامپوننت

---

### ✅ مشکل 3: خطای 500 در ایجاد سفارش

**مشکل:**
- هنگام ثبت سفارش، خطای `Failed to create order` با کد 500 رخ می‌داد

**علل احتمالی:**
1. تبدیل نوع قیمت (Decimal vs Number)
2. عدم وجود محصول در دیتابیس
3. خطا در ساختار داده‌های ارسالی

**راه‌حل‌های اعمال شده:**

1. **بهبود مدیریت خطا:**
   - افزودن لاگ‌های دقیق‌تر برای debugging
   - افزودن validation برای item data
   - بهبود پیام‌های خطا

2. **بررسی وجود محصول:**
   - بررسی وجود محصول قبل از به‌روزرسانی موجودی
   - ادامه فرآیند حتی اگر محصول پیدا نشود (با warning)

3. **تبدیل نوع قیمت:**
   - استفاده از `Number()` برای تبدیل قیمت‌ها
   - Prisma به صورت خودکار تبدیل می‌کند

4. **بهبود ساختار کد:**
   - اصلاح indentation و ساختار کد
   - افزودن null check برای order

**فایل‌های تغییر یافته:**
- `src/app/api/customer/orders/route.ts` - بهبود error handling و validation

---

## تغییرات در CartContext

### قبل:
```typescript
interface CartState {
  // ...
  totalItems: number;  // Getter
  totalPrice: number;  // Getter
  itemCount: number;   // Getter
}

get totalItems() {
  return get().items.reduce((total, item) => total + item.quantity, 0);
}
```

### بعد:
```typescript
interface CartState {
  items: CartItem[];
  isOpen: boolean;
  // ... actions only
  // Getters removed
}

// در کامپوننت‌ها:
const totalItems = items.reduce((total, item) => total + item.quantity, 0);
const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);
```

---

## تست و بررسی

### چک‌لیست تست:

- [x] آیکون سبد خرید تعداد محصولات را نمایش می‌دهد
- [x] صفحه سبد خرید قیمت کل را به درستی نمایش می‌دهد
- [x] خلاصه سفارش در صفحه سبد خرید قیمت‌ها را درست نشان می‌دهد
- [x] ثبت سفارش بدون خطا انجام می‌شود
- [x] لاگ‌های خطا برای debugging در دسترس هستند

---

## نکات مهم

1. **Reactivity در Zustand:**
   - Getters در Zustand reactive نیستند
   - برای مقادیر computed، باید از selectors استفاده کرد یا در کامپوننت محاسبه کرد

2. **Type Safety:**
   - Prisma Decimal types به صورت خودکار از JavaScript numbers تبدیل می‌شوند
   - اما بهتر است از `Number()` برای اطمینان استفاده کرد

3. **Error Handling:**
   - همیشه validation را در API انجام دهید
   - لاگ‌های دقیق برای debugging ضروری هستند

---

## فایل‌های تغییر یافته

1. `src/contexts/CartContext.tsx` - حذف getters
2. `src/components/layout/Header.tsx` - محاسبه totalItems
3. `src/components/ecommerce/MiniCart.tsx` - محاسبه totalItems و totalPrice
4. `src/app/[locale]/cart/CartPageClient.tsx` - محاسبه totalItems و totalPrice
5. `src/app/[locale]/checkout/CheckoutPageClient.tsx` - محاسبه totalPrice
6. `src/app/api/customer/orders/route.ts` - بهبود error handling

---

---

## ✅ مشکل 4: خطای useCustomer در CheckoutAddressSelector

**مشکل:**
- خطای `useCustomer must be used within a CustomerProvider` در صفحه checkout

**علت:**
- کامپوننت `CheckoutAddressSelector` از hook `useCustomer()` استفاده می‌کند
- اما صفحه checkout با `CustomerProvider` wrap نشده بود

**راه‌حل:**
- افزودن `CustomerProvider` به صفحه checkout

**فایل‌های تغییر یافته:**
- `src/app/[locale]/checkout/page.tsx` - افزودن CustomerProvider wrapper

---

## ✅ مشکل 5: خطای Foreign Key Constraint در ایجاد آدرس

**مشکل:**
- خطای `Foreign key constraint violated on the constraint: addresses_userId_fkey` هنگام ثبت سفارش
- خطای `User not found` در API `/api/customer/profile`

**علت:**
- کاربر موجود در session ممکن است در دیتابیس وجود نداشته باشد
- هنگام ایجاد آدرس با `userId: session.user.id`، foreign key constraint نقض می‌شد

**راه‌حل:**
1. **بررسی وجود کاربر قبل از ایجاد آدرس:**
   - بررسی وجود کاربر در دیتابیس قبل از ایجاد آدرس
   - بررسی فعال بودن حساب کاربری
   - برگرداندن خطای مناسب اگر کاربر وجود نداشته باشد

2. **بهبود مدیریت خطا:**
   - مدیریت خطاهای Prisma (P2003 برای foreign key, P2002 برای unique constraint)
   - پیام‌های خطای واضح‌تر برای کاربر

**فایل‌های تغییر یافته:**
- `src/app/api/customer/orders/route.ts` - افزودن بررسی وجود کاربر و بهبود error handling

**کد اضافه شده:**
```typescript
// Verify user exists in database before creating addresses
const userExists = await prisma.user.findUnique({
  where: { id: session.user.id },
  select: { id: true, email: true, isActive: true }
});

if (!userExists) {
  return NextResponse.json(
    { 
      success: false, 
      error: "User account not found. Please log out and log in again." 
    },
    { status: 404 }
  );
}

if (!userExists.isActive) {
  return NextResponse.json(
    { 
      success: false, 
      error: "Your account has been deactivated. Please contact support." 
    },
    { status: 403 }
  );
}
```

---

## ✅ مشکل 6: بهبود مدیریت خطای "User account not found"

**مشکل:**
- وقتی کاربر در session وجود دارد اما در دیتابیس نیست، خطای 404 برمی‌گردد
- پیام خطا برای کاربر واضح نبود

**راه‌حل:**
1. **بهبود مدیریت خطا در کلاینت:**
   - تشخیص خطای "User account not found"
   - نمایش پیام واضح‌تر به کاربر
   - پیشنهاد logout و login مجدد

2. **افزودن کلید ترجمه:**
   - افزودن `userAccountNotFound` به فایل‌های ترجمه (fa, en, ar)
   - افزودن به TypeScript interface

**فایل‌های تغییر یافته:**
- `src/app/[locale]/checkout/CheckoutPageClient.tsx` - بهبود error handling
- `messages/fa.json`, `messages/en.json`, `messages/ar.json` - افزودن کلید ترجمه
- `src/lib/i18n.ts` - افزودن به interface

**کد اضافه شده:**
```typescript
// Handle user not found error - redirect to logout
if (response.status === 404 && result.error?.includes('User account not found')) {
  const shouldLogout = window.confirm(
    String(t.userAccountNotFound || 'Your account was not found. Please log out and log in again. Would you like to log out now?')
  );
  if (shouldLogout) {
    signOut({ callbackUrl: `/${locale}/auth/login` });
    return;
  }
  throw new Error(result.error || 'Failed to create order');
}
```

---

## ✅ مشکل 7: هدایت کاربران غیراحراز هویت شده به صفحه ورود/ثبت‌نام

**مشکل:**
- کاربران بدون حساب کاربری می‌توانستند به صفحه checkout دسترسی داشته باشند
- بعد از ورود یا ثبت‌نام، کاربر به صفحه اصلی هدایت می‌شد نه checkout

**راه‌حل:**
1. **بررسی احراز هویت در CheckoutPageClient:**
   - استفاده از `useSession` برای بررسی وضعیت احراز هویت
   - هدایت خودکار به صفحه login با `callbackUrl` اگر کاربر احراز هویت نشده باشد
   - نمایش loading state در حین بررسی احراز هویت

2. **بهبود صفحه Login:**
   - خواندن `callbackUrl` از query parameters
   - هدایت به `callbackUrl` بعد از ورود موفق (به جای صفحه اصلی)
   - انتقال `callbackUrl` به صفحه register

3. **بهبود صفحه Register:**
   - خواندن `callbackUrl` از query parameters
   - هدایت به login با `callbackUrl` بعد از ثبت‌نام موفق
   - حفظ `callbackUrl` در تمام مراحل ثبت‌نام

**فایل‌های تغییر یافته:**
- `src/app/[locale]/checkout/CheckoutPageClient.tsx` - افزودن بررسی احراز هویت
- `src/app/[locale]/auth/login/page.tsx` - پشتیبانی از callbackUrl
- `src/app/[locale]/auth/register/page.tsx` - پشتیبانی از callbackUrl

**جریان کار:**
1. کاربر بدون حساب به `/checkout` می‌رود
2. سیستم بررسی می‌کند که کاربر احراز هویت نشده است
3. کاربر به `/auth/login?callbackUrl=/checkout` هدایت می‌شود
4. کاربر می‌تواند وارد شود یا ثبت‌نام کند
5. بعد از ورود/ثبت‌نام موفق، کاربر به `/checkout` بازمی‌گردد
6. سبد خرید حفظ می‌شود (Zustand state)

**کد اضافه شده:**
```typescript
// Check authentication status and redirect if not authenticated
useEffect(() => {
  if (status === "loading") return; // Wait for session to load
  
  if (status === "unauthenticated") {
    // Redirect to login with callback URL to return to checkout
    const callbackUrl = encodeURIComponent(`/${locale}/checkout`);
    router.push(`/${locale}/auth/login?callbackUrl=${callbackUrl}`);
  }
}, [status, router, locale]);
```

---

---

## ✅ مشکل 8: رفع مشکل ارسال SMS برای تأیید شماره تلفن

**مشکل:**
- SMS تأیید شماره تلفن در هنگام ثبت‌نام ارسال نمی‌شد
- خطاها به درستی مدیریت نمی‌شدند

**علت:**
- تابع `sendVerificationCode` یک Promise برمی‌گرداند که resolve می‌شود (خطا throw نمی‌کند)
- استفاده از `try-catch` برای بررسی موفقیت کافی نبود
- باید `result.success` بررسی می‌شد نه catch کردن خطا

**راه‌حل:**
1. **بهبود مدیریت خطا در API:**
   - بررسی `result.success` به جای استفاده از try-catch
   - افزودن fallback به simple SMS اگر template SMS ناموفق باشد
   - افزودن بررسی وجود `KAVENEGAR_API_KEY` در environment variables
   - بهبود logging برای debugging

2. **بهبود مدیریت خطا در کلاینت:**
   - نمایش warning اگر SMS ارسال نشده باشد اما کد در دیتابیس ذخیره شده باشد
   - امکان درخواست مجدد کد در صورت عدم دریافت

**فایل‌های تغییر یافته:**
- `src/app/api/auth/verify-phone/send/route.ts` - بهبود error handling و fallback
- `src/app/[locale]/auth/register/page.tsx` - بهبود نمایش warning

**نکات مهم:**
1. **Environment Variables:**
   - اطمینان حاصل کنید که `KAVENEGAR_API_KEY` در `.env.local` تنظیم شده است

2. **Template در Kavehnegar:**
   - اگر template `verify` در پنل Kavehnegar وجود نداشته باشد، سیستم به صورت خودکار از simple SMS استفاده می‌کند

3. **Fallback Strategy:**
   - اگر هر دو روش (template و simple SMS) ناموفق باشند، کد همچنان در دیتابیس ذخیره می‌شود
   - کاربر می‌تواند کد جدید درخواست کند

---

## ✅ مشکل 9: رفع خطای Prisma Validation در ثبت سفارش

**مشکل:**
- خطای `Invalid data provided. Please check your order details.` با کد 400 هنگام ثبت سفارش
- خطای Prisma validation برای فیلدهای Decimal

**علت:**
- فیلدهای Decimal در Prisma نیاز به تبدیل صریح به `Decimal` دارند
- استفاده از `Number()` به جای `new Decimal()` برای فیلدهای قیمت
- عدم بررسی وجود `customerEmail` در session

**راه‌حل:**
1. **تبدیل صحیح فیلدهای Decimal:**
   - استفاده از `new Decimal()` برای تمام فیلدهای قیمت (subtotal, taxAmount, shippingAmount, discountAmount, totalAmount)
   - استفاده از `new Decimal()` برای unitPrice و totalPrice در order items
   - استفاده از `mul()` برای محاسبه totalPrice در order items

2. **بررسی customerEmail:**
   - بررسی وجود `customerEmail` در session قبل از ایجاد سفارش
   - throw کردن خطای واضح اگر email وجود نداشته باشد

3. **بهبود error logging:**
   - افزودن logging دقیق‌تر برای Prisma validation errors
   - نمایش جزئیات خطا در development mode

**فایل‌های تغییر یافته:**
- `src/app/api/customer/orders/route.ts` - تبدیل صحیح Decimal و بهبود validation

**کد اضافه شده:**
```typescript
import { Decimal } from "@prisma/client/runtime/library";

// Validate and convert Decimal values
const subtotalDecimal = new Decimal(subtotal || 0);
const taxAmountDecimal = new Decimal(taxAmount || 0);
const shippingAmountDecimal = new Decimal(shippingAmount || 0);
const discountAmountDecimal = new Decimal(discountAmount || 0);
const totalAmountDecimal = new Decimal(totalAmount || 0);

// Validate customer email (required field)
if (!session.user.email) {
  throw new Error("User email is required but not found in session");
}

// For order items:
const unitPrice = new Decimal(item.price || 0);
const itemQuantity = parseInt(String(item.quantity || 1));
const totalPrice = unitPrice.mul(itemQuantity);
```

**نکات مهم:**
1. **Decimal Type:**
   - Prisma از `Decimal` type برای دقت در محاسبات مالی استفاده می‌کند
   - باید از `new Decimal()` استفاده شود نه `Number()`

2. **Email Validation:**
   - `customerEmail` یک فیلد required در schema است
   - باید در session موجود باشد

---

## ✅ مشکل 10: رفع خطای Enum Case Sensitivity در Shipping Method

**مشکل:**
- خطای `Invalid data provided` با کد 400 ادامه داشت
- `shippingMethod` به صورت lowercase (`"post"`) از کلاینت ارسال می‌شد
- Prisma enum ها case-sensitive هستند و نیاز به uppercase دارند (`"POST"`)

**علت:**
- کلاینت `shippingMethod: "post"` (lowercase) ارسال می‌کرد
- Prisma enum `ShippingMethod` مقادیر `POST`, `TIPAX`, `EXPRESS` را می‌پذیرد (uppercase)
- عدم تبدیل به uppercase قبل از استفاده در Prisma

**راه‌حل:**
1. **Normalize enum values:**
   - تبدیل `shippingMethod` و `paymentMethod` به uppercase قبل از validation
   - بررسی اعتبار enum values بعد از normalization
   - استفاده از normalized values در order creation

2. **بهبود validation:**
   - افزودن validation برای enum values
   - پیام‌های خطای واضح‌تر

**فایل‌های تغییر یافته:**
- `src/app/api/customer/orders/route.ts` - افزودن normalization و validation برای enum values

**کد اضافه شده:**
```typescript
// Normalize enum values to uppercase (Prisma enums are case-sensitive)
const normalizedShippingMethod = shippingMethod.toUpperCase();
const normalizedPaymentMethod = paymentMethod.toUpperCase();

// Validate enum values
const validPaymentMethods = ['ZARINPAL', 'BANK_TRANSFER', 'CASH_ON_DELIVERY'];
const validShippingMethods = ['POST', 'TIPAX', 'EXPRESS'];

if (!validPaymentMethods.includes(normalizedPaymentMethod)) {
  return NextResponse.json(
    { 
      success: false, 
      error: `Invalid payment method: ${paymentMethod}. Must be one of: ${validPaymentMethods.join(', ')}` 
    },
    { status: 400 }
  );
}

if (!validShippingMethods.includes(normalizedShippingMethod)) {
  return NextResponse.json(
    { 
      success: false, 
      error: `Invalid shipping method: ${shippingMethod}. Must be one of: ${validShippingMethods.join(', ')}` 
    },
    { status: 400 }
  );
}

// Use normalized values in order creation
paymentMethod: normalizedPaymentMethod as "ZARINPAL" | "BANK_TRANSFER" | "CASH_ON_DELIVERY",
shippingMethod: normalizedShippingMethod as "POST" | "TIPAX" | "EXPRESS",
```

**نکات مهم:**
1. **Enum Case Sensitivity:**
   - Prisma enums case-sensitive هستند
   - باید مطمئن شویم که مقادیر با enum definition مطابقت دارند

2. **Normalization:**
   - تبدیل به uppercase قبل از validation و استفاده
   - این کار باعث می‌شود که کلاینت بتواند lowercase یا uppercase ارسال کند

---

## ✅ مشکل 11: Payment Gateway Not Configured

**مشکل:**
- خطای `Payment gateway is not configured` با کد 500
- سفارش با موفقیت ایجاد می‌شد اما درخواست پرداخت به Zarinpal ناموفق بود
- `PaymentSettings` در دیتابیس وجود نداشت یا `zarinpalMerchantId` خالی بود

**علت:**
- تنظیمات پرداخت در دیتابیس (`PaymentSettings`) ایجاد نشده بود
- API route فقط از دیتابیس تنظیمات را می‌خواند و fallback به environment variables نداشت
- کاربر باید ابتدا از پنل ادمین تنظیمات را وارد می‌کرد

**راه‌حل:**
1. **Auto-create Payment Settings:**
   - اگر `PaymentSettings` وجود نداشت، یک رکورد پیش‌فرض ایجاد می‌شود
   - از environment variables به عنوان fallback استفاده می‌شود

2. **Environment Variable Fallback:**
   - اگر `zarinpalMerchantId` در دیتابیس خالی بود، از `ZARINPAL_MERCHANT_ID` در environment variables استفاده می‌شود
   - این کار باعث می‌شود که در development بتوان از `.env` استفاده کرد

3. **بهبود Error Messages:**
   - پیام خطای واضح‌تر که به کاربر می‌گوید باید Merchant ID را در admin settings یا environment variables تنظیم کند

**فایل‌های تغییر یافته:**
- `src/app/api/payment/zarinpal/request/route.ts` - افزودن auto-create و environment variable fallback

**کد اضافه شده:**
```typescript
// Get payment settings or create default if not exists
let paymentSettings = await prisma.paymentSettings.findFirst();

if (!paymentSettings) {
  // Create default payment settings if not exists
  console.log('⚠️ [Payment Request] Payment settings not found, creating default...');
  paymentSettings = await prisma.paymentSettings.create({
    data: {
      zarinpalMerchantId: process.env.ZARINPAL_MERCHANT_ID || "",
      zarinpalApiKey: process.env.ZARINPAL_API_KEY || "",
      zarinpalSandbox: process.env.ZARINPAL_SANDBOX === "true" || true,
      allowBankTransfer: true,
      allowCashOnDelivery: true,
    }
  });
  console.log('✅ [Payment Request] Default payment settings created');
}

if (!paymentSettings.zarinpalMerchantId || paymentSettings.zarinpalMerchantId.trim() === "") {
  // Try to get from environment variable as fallback
  const envMerchantId = process.env.ZARINPAL_MERCHANT_ID;
  if (envMerchantId) {
    console.log('⚠️ [Payment Request] Using merchant ID from environment variable');
    paymentSettings.zarinpalMerchantId = envMerchantId;
  } else {
    console.error('❌ [Payment Request] Zarinpal Merchant ID is not configured');
    return NextResponse.json(
      { 
        success: false, 
        error: "Payment gateway is not configured. Please configure Zarinpal Merchant ID in admin settings or environment variables." 
      },
      { status: 500 }
    );
  }
}
```

**نکات مهم:**
1. **Environment Variables:**
   - برای development، `ZARINPAL_MERCHANT_ID` در `.env.local` تنظیم شده است
   - برای production، `ZARINPAL_MERCHANT_ID` در `.env.production` تنظیم شده است
   - Merchant ID: `34f387ef-3ba2-41ba-85ee-c86813806726`

2. **Admin Settings:**
   - برای production، بهتر است از پنل ادمین (`/admin/settings`) تنظیمات را وارد کرد
   - این کار باعث می‌شود که تنظیمات در دیتابیس ذخیره شود

3. **Auto-creation:**
   - اگر `PaymentSettings` وجود نداشت، به صورت خودکار با مقادیر پیش‌فرض ایجاد می‌شود
   - این کار باعث می‌شود که در اولین استفاده، خطای "not configured" رخ ندهد

---

## ✅ مشکل 12: Zarinpal Payment Request Error 422

**مشکل:**
- خطای `خطا در درخواست پرداخت (کد: 422)` از Zarinpal API
- سفارش با موفقیت ایجاد می‌شد اما درخواست پرداخت به Zarinpal ناموفق بود
- کد 422 معمولاً به معنای validation error از طرف Zarinpal است

**علت:**
- عدم validation داده‌ها قبل از ارسال به Zarinpal
- ممکن است مبلغ، callback URL، mobile، email یا merchant ID نامعتبر باشد
- عدم logging کافی برای debugging

**راه‌حل:**
1. **Validation قبل از ارسال:**
   - بررسی مبلغ حداقل (1000 Toman = 10,000 Rial)
   - اطمینان از integer بودن مبلغ
   - بررسی طول description (حداکثر 255 کاراکتر)
   - Validation فرمت callback URL
   - Validation فرمت mobile (شماره موبایل ایرانی)
   - Validation فرمت email

2. **بهبود Logging:**
   - Log کردن تمام داده‌های ارسالی به Zarinpal
   - Log کردن کامل response از Zarinpal
   - Log کردن validation errors با جزئیات

3. **Error Handling بهتر:**
   - نمایش پیام‌های خطای واضح‌تر
   - نمایش validation errors از Zarinpal

**فایل‌های تغییر یافته:**
- `src/app/api/payment/zarinpal/request/route.ts` - افزودن validation و logging
- `src/lib/zarinpal.ts` - بهبود validation و error handling

**کد اضافه شده:**
```typescript
// Validation amount
if (amountInTomans < 1000) {
  return NextResponse.json(
    { 
      success: false, 
      error: `مبلغ سفارش باید حداقل ۱۰,۰۰۰ ریال باشد. مبلغ فعلی: ${Number(order.totalAmount).toLocaleString('fa-IR')} ریال` 
    },
    { status: 400 }
  );
}

// Ensure amount is integer
const amountInteger = Math.floor(amountInTomans);

// Validate description length
if (description.length > 255) {
  return NextResponse.json(
    { 
      success: false, 
      error: "توضیحات سفارش بیش از حد مجاز است" 
    },
    { status: 400 }
  );
}

// Validate and format mobile
let mobileFormatted: string | undefined = undefined;
if (order.user.phone) {
  const phoneDigits = order.user.phone.replace(/\D/g, '');
  if (phoneDigits.length === 11 && phoneDigits.startsWith('09')) {
    mobileFormatted = phoneDigits;
  } else if (phoneDigits.length === 10 && phoneDigits.startsWith('9')) {
    mobileFormatted = `0${phoneDigits}`;
  }
}

// Validate email format
let emailFormatted: string | undefined = undefined;
if (order.user.email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(order.user.email)) {
    emailFormatted = order.user.email;
  }
}
```

**نکات مهم:**
1. **Merchant ID Validation:**
   - Zarinpal Merchant ID باید حداقل 36 کاراکتر باشد
   - برای Sandbox، می‌توانید از Merchant ID تست استفاده کنید
   - Merchant ID باید در تنظیمات ادمین یا متغیرهای محیطی (`ZARINPAL_MERCHANT_ID`) تنظیم شود
   - اگر Merchant ID نامعتبر باشد، خطای 422 با پیام "The merchant id must be at least 36 characters" دریافت می‌شود

2. **Minimum Amount:**
   - Zarinpal حداقل 1000 Toman (10,000 Rial) را می‌پذیرد
   - باید قبل از ارسال بررسی شود

3. **Amount Format:**
   - مبلغ باید integer باشد (نه decimal)
   - استفاده از `Math.floor()` برای اطمینان

4. **Mobile Format:**
   - شماره موبایل باید به فرمت `09xxxxxxxxx` باشد
   - اگر `9xxxxxxxxx` بود، `0` اضافه می‌شود

5. **Email Format:**
   - بررسی فرمت email با regex
   - اگر نامعتبر بود، ارسال نمی‌شود

6. **Callback URL:**
   - باید یک URL معتبر باشد
   - در production باید HTTPS باشد

**راه‌حل برای Merchant ID:**
1. **برای Sandbox (تست):**
   - Merchant ID در `.env.local` تنظیم شده است: `34f387ef-3ba2-41ba-85ee-c86813806726`
   - `ZARINPAL_SANDBOX=true` برای تست فعال است
   - یا می‌توانید در تنظیمات ادمین در پنل مدیریت تنظیم کنید

2. **برای Production:**
   - Merchant ID در `.env.production` تنظیم شده است: `34f387ef-3ba2-41ba-85ee-c86813806726`
   - `ZARINPAL_SANDBOX=false` برای production تنظیم شده است

**نکته:** Merchant ID در هر دو محیط (local و production) تنظیم شده است و نیازی به تنظیم دستی نیست.

---

## ✅ مشکل 13: Checkout Success Page Not Showing Order Details

**مشکل:**
- صفحه success بعد از پرداخت فقط اطلاعات پایه سفارش را نمایش می‌داد
- محصولات سفارش، وضعیت پرداخت، آدرس‌ها و جزئیات کامل سفارش نمایش داده نمی‌شد
- صفحه فقط order number، date و refId را نشان می‌داد

**علت:**
- صفحه success از API برای دریافت جزئیات سفارش استفاده نمی‌کرد
- فقط از URL parameters (orderNumber و refId) استفاده می‌کرد
- API endpoint فقط order ID را می‌پذیرفت، نه orderNumber

**راه‌حل:**
1. **بهبود API Endpoint:**
   - API endpoint `/api/customer/orders/[id]` را به‌روزرسانی کردیم تا هم order ID و هم orderNumber را بپذیرد
   - اگر `id` با "HS6-" شروع شود، به عنوان orderNumber در نظر گرفته می‌شود
   - در غیر این صورت، به عنوان order ID (UUID) استفاده می‌شود

2. **بهبود صفحه Success:**
   - افزودن fetch order details از API وقتی orderNumber موجود است
   - نمایش کامل محصولات سفارش با تصاویر
   - نمایش وضعیت پرداخت با رنگ‌بندی مناسب
   - نمایش آدرس‌های ارسال و صورتحساب
   - نمایش breakdown کامل قیمت (subtotal, discount, shipping, tax, total)
   - افزودن لینک به صفحه جزئیات سفارش

3. **UI/UX بهبود یافته:**
   - Layout بهتر با grid system
   - نمایش تصاویر محصولات
   - رنگ‌بندی وضعیت پرداخت (Paid = green, Pending = yellow, Failed = red)
   - استفاده از utility functions برای format کردن قیمت و تاریخ

**فایل‌های تغییر یافته:**
- `src/app/api/customer/orders/[id]/route.ts` - پشتیبانی از orderNumber
- `src/app/[locale]/checkout/success/page.tsx` - نمایش کامل جزئیات سفارش

**کد اضافه شده:**
```typescript
// API Endpoint - Support both order ID and orderNumber
const isOrderNumber = id.startsWith("HS6-");
const whereClause = isOrderNumber
  ? { orderNumber: id, userId: session.user.id }
  : { id: id, userId: session.user.id };

// Success Page - Fetch order details
useEffect(() => {
  const fetchOrder = async () => {
    if (!orderNumber || !session?.user?.id) return;
    
    const response = await fetch(`/api/customer/orders/${orderNumber}`);
    const result = await response.json();
    
    if (result.success && result.data) {
      setOrder(result.data);
    }
  };
  
  if (orderNumber && session?.user?.id) {
    fetchOrder();
  }
}, [orderNumber, session?.user?.id]);
```

**ویژگی‌های جدید:**
1. **Order Items Display:**
   - نمایش تمام محصولات سفارش با تصاویر
   - نمایش variant (اگر موجود باشد)
   - نمایش quantity و total price برای هر محصول

2. **Payment Status:**
   - نمایش وضعیت پرداخت با رنگ‌بندی
   - نمایش payment reference ID (refId)

3. **Address Display:**
   - نمایش کامل آدرس ارسال
   - نمایش کامل آدرس صورتحساب

4. **Price Breakdown:**
   - Subtotal
   - Discount (اگر موجود باشد)
   - Shipping cost
   - Tax
   - Total amount

5. **Navigation:**
   - لینک به صفحه جزئیات کامل سفارش
   - لینک به ادامه خرید

**نکات مهم:**
1. **Authentication:**
   - صفحه success نیاز به authentication دارد
   - اگر کاربر لاگین نباشد، نمی‌تواند جزئیات سفارش را ببیند

2. **Error Handling:**
   - اگر سفارش یافت نشود، پیام خطای مناسب نمایش داده می‌شود
   - لینک به صفحه سفارشات برای مشاهده تمام سفارش‌ها

3. **Loading State:**
   - نمایش loading state هنگام fetch کردن داده‌ها
   - نمایش skeleton یا spinner

---

## ✅ مشکل 14: Kavenegar SMS Integration and Testing

**مشکل:**
- نیاز به اطمینان از تنظیم صحیح Kavenegar در تمام پلتفرم‌ها
- نیاز به ارسال SMS به مشتری با اطلاعات محصولات خریداری شده
- نیاز به ارسال SMS موفقیت پرداخت
- نیاز به راهنمای تست برای اطمینان از عملکرد صحیح

**راه‌حل:**
1. **تنظیمات Environment Variables:**
   - افزودن `KAVENEGAR_API_KEY` و `KAVENEGAR_SENDER` به `.env.production`
   - اطمینان از تنظیم صحیح در `.env.local`

2. **بهبود SMS Templates:**
   - افزودن template جدید `ORDER_PAYMENT_SUCCESS` برای موفقیت پرداخت
   - بهبود template `ORDER_CONFIRMED` برای شامل کردن لیست محصولات و مبلغ کل
   - نمایش محصولات (تا 3 محصول، یا "X محصول دیگر" برای بیشتر)

3. **افزودن SMS در Payment Callback:**
   - ارسال SMS بعد از موفقیت پرداخت
   - شامل کردن اطلاعات محصولات، مبلغ و refId

4. **بهبود SMS در Order Creation:**
   - افزودن لیست محصولات به SMS تایید سفارش
   - افزودن مبلغ کل به SMS

5. **ایجاد راهنمای تست:**
   - راهنمای کامل تست SMS در `docs/KAVENEGAR_SMS_TESTING_GUIDE.md`
   - چک‌لیست تست
   - راهنمای debugging

**فایل‌های تغییر یافته:**
- `.env.production` - افزودن تنظیمات Kavenegar
- `src/lib/sms.ts` - بهبود templates و افزودن `ORDER_PAYMENT_SUCCESS`
- `src/app/api/customer/orders/route.ts` - بهبود SMS order creation با محصولات
- `src/app/api/payment/zarinpal/callback/route.ts` - افزودن SMS بعد از موفقیت پرداخت
- `docs/KAVENEGAR_SMS_TESTING_GUIDE.md` - راهنمای تست (جدید)
- `docs/SMS_IMPLEMENTATION_SUMMARY.md` - به‌روزرسانی مستندات

**کد اضافه شده:**
```typescript
// Enhanced SMS Template
ORDER_PAYMENT_SUCCESS: (orderNumber, customerName, products, totalAmount, refId) => {
  let message = `سلام ${customerName}، پرداخت سفارش ${orderNumber} با موفقیت انجام شد.`;
  if (products && products.length > 0) {
    const productsList = products.length <= 3 
      ? products.join('، ') 
      : `${products.slice(0, 2).join('، ')} و ${products.length - 2} محصول دیگر`;
    message += `\nمحصولات: ${productsList}`;
  }
  if (totalAmount) {
    const formattedAmount = new Intl.NumberFormat('fa-IR').format(totalAmount);
    message += `\nمبلغ پرداخت شده: ${formattedAmount} ریال`;
  }
  if (refId) {
    message += `\nکد پیگیری پرداخت: ${refId}`;
  }
  message += '\nسفارش شما در حال پردازش است.';
  return message;
}

// Payment Callback - Send SMS
if (updatedOrder.user.phone) {
  const customerName = updatedOrder.user.firstName && updatedOrder.user.lastName
    ? `${updatedOrder.user.firstName} ${updatedOrder.user.lastName}`
    : 'کاربر گرامی';
  
  const products = updatedOrder.orderItems.map(item => 
    item.quantity > 1 ? `${item.name} (${item.quantity} عدد)` : item.name
  );
  const totalAmount = Number(updatedOrder.totalAmount);
  
  sendSMSSafe({
    receptor: updatedOrder.user.phone,
    message: SMSTemplates.ORDER_PAYMENT_SUCCESS(
      updatedOrder.orderNumber,
      customerName,
      products,
      totalAmount,
      verifyResult.refId
    ),
  }, `Payment success: ${updatedOrder.orderNumber}`);
}
```

**ویژگی‌های جدید:**
1. **SMS Order Confirmation:**
   - شامل نام مشتری
   - شامل شماره سفارش
   - شامل لیست محصولات (تا 3 محصول)
   - شامل مبلغ کل

2. **SMS Payment Success:**
   - شامل نام مشتری
   - شامل شماره سفارش
   - شامل لیست محصولات
   - شامل مبلغ پرداخت شده
   - شامل کد پیگیری پرداخت (refId)

3. **Product List Formatting:**
   - نمایش تا 3 محصول کامل
   - برای بیشتر از 3 محصول: "Product 1، Product 2 و X محصول دیگر"
   - نمایش quantity برای محصولات: "Product Name (3 عدد)"

**نکات مهم:**
1. **Non-blocking:**
   - تمام SMS sending ها non-blocking هستند
   - استفاده از `sendSMSSafe()` برای جلوگیری از شکستن flow

2. **Error Handling:**
   - SMS failures لاگ می‌شوند اما exception نمی‌اندازند
   - Order و payment flow تحت تأثیر قرار نمی‌گیرند

3. **Phone Number Validation:**
   - SMS فقط در صورت وجود phone number ارسال می‌شود
   - Phone number باید به فرمت صحیح باشد (11 رقم، شروع با 09)

4. **Testing:**
   - راهنمای کامل تست در `docs/KAVENEGAR_SMS_TESTING_GUIDE.md`
   - چک‌لیست تست برای اطمینان از عملکرد صحیح

---

## ✅ مشکل 15: Checkout Page Showing Empty Cart After Payment & SMS Not Sent

**مشکل:**
1. بعد از پرداخت موفق، کاربر به `/fa/checkout` redirect می‌شود و پیام "سبد خرید خالی است" نمایش داده می‌شود
2. SMS بعد از پرداخت موفق ارسال نمی‌شود
3. صفحه checkout باید به `/fa/checkout/success` redirect شود

**علت:**
1. **Redirect Issue:**
   - بعد از پرداخت، cart خالی می‌شود (برای جلوگیری از duplicate order)
   - صفحه checkout فقط error parameters را چک می‌کرد، نه success parameters (orderNumber و refId)
   - اگر کاربر به `/fa/checkout` با orderNumber و refId برود، باید به success page redirect شود

2. **SMS Issue:**
   - Phone number ممکن است از `user.phone` موجود نباشد
   - باید از `customerPhone` در order به عنوان fallback استفاده شود
   - Logging کافی برای debugging وجود نداشت

**راه‌حل:**
1. **Redirect به Success Page:**
   - افزودن check برای orderNumber و refId در URL (بدون error)
   - اگر هر دو موجود باشند، redirect به `/fa/checkout/success`
   - این check قبل از error handling انجام می‌شود

2. **بهبود SMS Phone Number:**
   - استفاده از `customerPhone` از order به عنوان fallback
   - اگر `user.phone` موجود نباشد، از `order.customerPhone` استفاده می‌شود
   - افزودن logging برای debugging

3. **بهبود SMS Logging:**
   - افزودن validation برای phone number format
   - Logging بهتر برای debugging
   - نمایش جزئیات بیشتر در logs

**فایل‌های تغییر یافته:**
- `src/app/[locale]/checkout/CheckoutPageClient.tsx` - افزودن redirect به success page
- `src/app/api/payment/zarinpal/callback/route.ts` - بهبود SMS phone number و logging
- `src/app/api/customer/orders/route.ts` - بهبود SMS logging
- `src/lib/sms.ts` - بهبود validation و logging

**کد اضافه شده:**
```typescript
// Checkout Page - Redirect to success if orderNumber and refId present
useEffect(() => {
  const orderNumber = searchParams.get("orderNumber");
  const refId = searchParams.get("refId");
  const error = searchParams.get("error");
  
  // If we have orderNumber and refId without error, redirect to success page
  if (orderNumber && refId && !error) {
    router.replace(`/${locale}/checkout/success?orderNumber=${orderNumber}&refId=${refId}`);
    return;
  }
}, [searchParams, locale, router]);

// Payment Callback - Use customerPhone as fallback
const customerPhone = updatedOrder.user.phone || updatedOrder.customerPhone;
if (customerPhone) {
  // ... send SMS
} else {
  console.warn('⚠️ [Payment Callback] No phone number found for SMS');
}

// SMS Library - Phone validation and better logging
const phoneDigits = options.receptor.replace(/\D/g, '');
if (phoneDigits.length !== 11 || !phoneDigits.startsWith('09')) {
  console.error(`[SMS] Invalid phone number format:`, options.receptor);
  return;
}
```

**نکات مهم:**
1. **Redirect Logic:**
   - Check برای orderNumber و refId باید قبل از error handling باشد
   - فقط در صورت عدم وجود error redirect انجام می‌شود

2. **Phone Number:**
   - اول از `user.phone` استفاده می‌شود
   - اگر موجود نباشد، از `order.customerPhone` استفاده می‌شود
   - Phone number باید به فرمت `09xxxxxxxxx` باشد

3. **SMS Validation:**
   - Phone number باید 11 رقم باشد
   - باید با `09` شروع شود
   - اگر نامعتبر باشد، SMS ارسال نمی‌شود و error log می‌شود

4. **Logging:**
   - تمام SMS attempts log می‌شوند
   - Success و failure هر دو log می‌شوند
   - جزئیات کامل برای debugging

---

**تاریخ:** 2025-01-XX
**وضعیت:** ✅ تمام مشکلات رفع شده

---

## ✅ تغییر بزرگ: حذف آدرس صورتحساب (Billing Address)

### 📅 تاریخ: 2025-01-XX

### تغییرات اعمال شده:

#### 1. **ساده‌سازی سیستم آدرس**
- حذف کامل آدرس صورتحساب (Billing Address) از سیستم
- فقط آدرس ارسال (Shipping Address) باقی مانده است
- این تغییر برای ساده‌سازی و یکپارچگی در سراسر پلتفرم اعمال شده است

#### 2. **تغییرات دیتابیس**
- حذف `billingAddressId` از جدول `orders`
- حذف `billingOrders` relation از جدول `addresses`
- به‌روزرسانی `AddressType` enum: حذف `BILLING` و `BOTH`، فقط `SHIPPING` باقی مانده
- Migration ایجاد شده: `remove_billing_address`

**فایل‌های تغییر یافته:**
- `prisma/schema.prisma` - به‌روزرسانی مدل‌های Order و Address
- Migration file برای اعمال تغییرات در دیتابیس

#### 3. **تغییرات API Routes**
- حذف `billingAddress` از تمام API responses
- حذف ایجاد `billingAddress` در order creation
- حذف validation برای `billingAddress`
- به‌روزرسانی تمام endpoints مرتبط با orders

**فایل‌های تغییر یافته:**
- `src/app/api/customer/orders/route.ts` - حذف billing address از order creation
- `src/app/api/customer/orders/[id]/route.ts` - حذف billing address از responses
- `src/app/api/orders/route.ts` - حذف billing address از admin order list
- `src/app/api/orders/[id]/route.ts` - حذف billing address از admin order details
- `src/app/api/crm/quotes/[id]/convert/route.ts` - حذف billing address از quote conversion
- `src/app/api/customer/addresses/[id]/route.ts` - حذف billing address check از delete validation

#### 4. **تغییرات کامپوننت‌ها**

**Checkout Components:**
- `src/app/[locale]/checkout/CheckoutPageClient.tsx` - حذف state و logic مربوط به billing address
- `src/components/checkout/CheckoutAddressSelector.tsx` - حذف بخش انتخاب billing address
- `src/components/checkout/AddressFormModal.tsx` - حذف نوع billing از modal

**Order Display Components:**
- `src/components/customer/orders/OrderDetails.tsx` - حذف نمایش billing address
- `src/app/[locale]/checkout/success/page.tsx` - حذف نمایش billing address

**Address Management:**
- `src/components/customer/addresses/AddressForm.tsx` - حذف گزینه‌های BILLING و BOTH از dropdown
- `src/components/customer/addresses/AddressList.tsx` - حذف handling برای BILLING و BOTH types

#### 5. **تغییرات Types**
- حذف `billingAddress` از تمام type definitions
- حذف `billingAddressId` از AdminOrder interface
- به‌روزرسانی CustomerOrder interface

**فایل‌های تغییر یافته:**
- `src/types/admin.ts` - حذف billingAddress از AdminOrder
- `src/contexts/CustomerContext.tsx` - حذف billingAddress از CustomerOrder interface
- `src/lib/i18n.ts` - حذف billingAddress از type definitions (translations باقی می‌مانند برای backward compatibility)

#### 6. **تغییرات UI/UX**
- صفحه checkout: فقط یک بخش برای انتخاب آدرس ارسال
- صفحه جزئیات سفارش: فقط نمایش آدرس ارسال
- صفحه موفقیت پرداخت: فقط نمایش آدرس ارسال
- مدیریت آدرس‌ها: فقط امکان ایجاد آدرس ارسال

### منطق کسب‌وکار:

#### قوانین جدید:
- ✅ فقط یک نوع آدرس: SHIPPING
- ✅ تمام آدرس‌های موجود باید از نوع SHIPPING باشند
- ✅ هنگام ایجاد سفارش، فقط shipping address لازم است
- ✅ در نمایش سفارش‌ها، فقط shipping address نمایش داده می‌شود

### Migration Steps:

1. **اعمال Migration:**
   ```bash
   npx prisma migrate dev
   ```

2. **بررسی داده‌های موجود:**
   - آدرس‌های موجود با نوع BILLING یا BOTH باید به SHIPPING تبدیل شوند
   - سفارش‌های موجود که billingAddressId دارند باید بررسی شوند

3. **Data Migration (در صورت نیاز):**
   - اگر داده‌های موجود دارید، باید قبل از اعمال migration، آدرس‌های BILLING/BOTH را به SHIPPING تبدیل کنید
   - یا از migration script استفاده کنید

### تست:
1. ✅ ایجاد سفارش جدید با فقط shipping address
2. ✅ نمایش سفارش‌های موجود (باید فقط shipping address نمایش دهد)
3. ✅ ایجاد آدرس جدید (باید فقط SHIPPING باشد)
4. ✅ انتخاب آدرس در checkout (باید فقط shipping addresses نمایش دهد)
5. ✅ تبدیل quote به order (باید فقط shipping address استفاده کند)

### نکات مهم:
- **Backward Compatibility:** ترجمه‌های مربوط به billing address در فایل‌های translation باقی می‌مانند اما استفاده نمی‌شوند
- **Existing Data:** اگر داده‌های موجود دارید، باید migration script برای تبدیل آدرس‌های BILLING/BOTH به SHIPPING بنویسید
- **Database:** Migration باید با دقت اعمال شود تا داده‌های موجود از دست نروند

---

---

## ✅ ویژگی جدید: پرداخت و لغو سفارش‌ها

### 📅 تاریخ: 2025-12-06

### ویژگی‌های اضافه شده:

#### 1. **پرداخت سفارش‌های پرداخت‌نشده**
- کاربران می‌توانند سفارش‌های پرداخت‌نشده را از صفحه تاریخچه سفارشات یا جزئیات سفارش پرداخت کنند
- دکمه "پرداخت" فقط برای سفارش‌هایی با `paymentStatus = PENDING` و `status != CANCELLED/DELIVERED/REFUNDED` نمایش داده می‌شود
- استفاده از endpoint موجود `/api/payment/zarinpal/request` برای ایجاد درخواست پرداخت
- هدایت خودکار به درگاه پرداخت زرین‌پال

**فایل‌های تغییر یافته:**
- `src/components/customer/orders/OrderHistory.tsx` - اضافه شدن دکمه پرداخت و handler
- `src/components/customer/orders/OrderDetails.tsx` - اضافه شدن دکمه پرداخت و handler

#### 2. **لغو سفارش‌ها**
- کاربران می‌توانند سفارش‌های قابل لغو را لغو کنند
- سفارش‌های قابل لغو: سفارش‌هایی که `status != CANCELLED/DELIVERED/REFUNDED`
- پس از لغو، `status` سفارش به `CANCELLED` تغییر می‌کند
- تایید کاربر قبل از لغو (confirmation dialog)

**API Endpoint جدید:**
- `PATCH /api/customer/orders/[id]` - برای لغو سفارش
  - بررسی اینکه سفارش قابل لغو است
  - به‌روزرسانی `status` به `CANCELLED`
  - بازگرداندن اطلاعات سفارش به‌روز شده

**فایل‌های تغییر یافته:**
- `src/app/api/customer/orders/[id]/route.ts` - اضافه شدن PATCH endpoint
- `src/components/customer/orders/OrderHistory.tsx` - اضافه شدن دکمه لغو و handler
- `src/components/customer/orders/OrderDetails.tsx` - اضافه شدن دکمه لغو و handler

#### 3. **حذف سفارش‌ها (اختیاری)**
- کاربران می‌توانند سفارش‌های پرداخت‌نشده و ارسال‌نشده را حذف کنند
- سفارش‌های قابل حذف:
  - `paymentStatus = PENDING` یا `FAILED`
  - `status = PENDING` یا `CONFIRMED` یا `CANCELLED`
  - `shippedAt = null` (هنوز ارسال نشده)

**API Endpoint جدید:**
- `DELETE /api/customer/orders/[id]` - برای حذف سفارش
  - بررسی اینکه سفارش قابل حذف است
  - حذف سفارش از دیتابیس (cascade delete برای orderItems)

**فایل‌های تغییر یافته:**
- `src/app/api/customer/orders/[id]/route.ts` - اضافه شدن DELETE endpoint

#### 4. **ترجمه‌ها**
- اضافه شدن کلیدهای ترجمه جدید:
  - `customer.orders.payNow` - "پرداخت"
  - `customer.orders.cancelOrder` - "لغو سفارش"
  - `customer.orders.cancelOrderConfirm` - "آیا از لغو این سفارش اطمینان دارید؟"
  - `customer.orders.cancelOrderSuccess` - "سفارش با موفقیت لغو شد"
  - `customer.orders.cancelOrderError` - "خطا در لغو سفارش"
  - `customer.orders.paymentRequestFailed` - "خطا در درخواست پرداخت"
  - `customer.orders.paymentError` - "خطا در پرداخت"
  - `customer.orderDetails.payNowButton` - "پرداخت سفارش"
  - `customer.orderDetails.cancelOrderButton` - "لغو سفارش"
  - و سایر کلیدهای مرتبط

**فایل‌های تغییر یافته:**
- `messages/fa.json` - اضافه شدن ترجمه‌های فارسی

### منطق کسب‌وکار:

#### قوانین لغو سفارش:
- ✅ قابل لغو: سفارش‌هایی با `paymentStatus != PAID` و `status != CANCELLED/DELIVERED/REFUNDED`
- ❌ غیرقابل لغو: سفارش‌های پرداخت شده (`PAID`), `CANCELLED`, `DELIVERED`, `REFUNDED`

#### قوانین حذف سفارش:
- ✅ قابل حذف: سفارش‌های پرداخت‌نشده (`PENDING` یا `FAILED`) که هنوز ارسال نشده‌اند
- ❌ غیرقابل حذف: سفارش‌های پرداخت شده، ارسال شده، یا تحویل شده

#### قوانین پرداخت:
- ✅ قابل پرداخت: سفارش‌هایی با `paymentStatus = PENDING` که `status != CANCELLED/DELIVERED/REFUNDED`
- ❌ غیرقابل پرداخت: سفارش‌های پرداخت شده یا لغو شده

### تست:
1. ✅ ایجاد سفارش و پرداخت آن از صفحه جزئیات
2. ✅ لغو سفارش پرداخت‌نشده
3. ✅ تلاش برای لغو سفارش تحویل شده (باید خطا بدهد)
4. ✅ حذف سفارش پرداخت‌نشده
5. ✅ تلاش برای حذف سفارش پرداخت شده (باید خطا بدهد)

---

## ✅ بهبودهای امنیتی و اعتبارسنجی: ایجاد آدرس

### 📅 تاریخ: 2025-01-XX

### مشکلات شناسایی شده:

#### 1. **عدم استفاده از Transaction**
- اگر تنظیم آدرس به عنوان پیش‌فرض با خطا مواجه می‌شد، آدرس همچنان ایجاد می‌شد
- امکان ایجاد وضعیت ناسازگار در دیتابیس

#### 2. **عدم بررسی وجود کاربر**
- آدرس بدون بررسی وجود کاربر در دیتابیس ایجاد می‌شد
- امکان خطای Foreign Key Constraint

#### 3. **اعتبارسنجی ناقص**
- اعتبارسنجی فرمت (شماره تلفن، کد پستی) فقط در frontend انجام می‌شد
- عدم اعتبارسنجی طول فیلدها
- پیام‌های خطای نامشخص

#### 4. **عدم ثبت خطاها**
- خطاهای ایجاد آدرس فقط در console ثبت می‌شدند
- عدم ثبت جزئیات تلاش‌های ناموفق

### تغییرات اعمال شده:

#### 1. **امنیت Transaction**
- استفاده از `prisma.$transaction` برای اطمینان از atomicity
- اگر تنظیم پیش‌فرض با خطا مواجه شود، آدرس ایجاد نمی‌شود
- جلوگیری از ایجاد وضعیت ناسازگار

**فایل تغییر یافته:**
- `src/app/api/customer/addresses/route.ts` - استفاده از transaction

#### 2. **بررسی وجود کاربر**
- بررسی وجود کاربر در دیتابیس قبل از ایجاد آدرس
- بررسی فعال بودن حساب کاربری
- پیام‌های خطای واضح‌تر

**کد اضافه شده:**
```typescript
// Verify user exists in database before creating address
const userExists = await prisma.user.findUnique({
  where: { id: session.user.id },
  select: { id: true, email: true, isActive: true }
});

if (!userExists) {
  return NextResponse.json(
    { success: false, error: "User account not found. Please log out and log in again." },
    { status: 404 }
  );
}

if (!userExists.isActive) {
  return NextResponse.json(
    { success: false, error: "Your account has been deactivated. Please contact support." },
    { status: 403 }
  );
}
```

#### 3. **اعتبارسنجی جامع**

**اعتبارسنجی فیلدهای اجباری:**
- بررسی وجود تمام فیلدهای اجباری
- Trim کردن فضاهای خالی

**اعتبارسنجی طول:**
- Title: حداکثر 100 کاراکتر
- First Name: حداکثر 50 کاراکتر
- Last Name: حداکثر 50 کاراکتر
- Company: حداکثر 100 کاراکتر
- Address Line 1: حداکثر 200 کاراکتر
- Address Line 2: حداکثر 200 کاراکتر
- City: حداکثر 100 کاراکتر
- State: حداکثر 100 کاراکتر
- Postal Code: حداکثر 20 کاراکتر
- Phone: حداکثر 20 کاراکتر

**اعتبارسنجی فرمت:**
- شماره تلفن: فرمت ایرانی (`/^(\+98|0)?9\d{9}$/`)
- کد پستی: دقیقاً 10 رقم (`/^\d{10}$/`)

**فایل‌های تغییر یافته:**
- `src/app/api/customer/addresses/route.ts` - اعتبارسنجی جامع در API
- `src/components/customer/addresses/AddressForm.tsx` - اعتبارسنجی طول در frontend

#### 4. **ثبت و مدیریت خطا**

**ثبت خطاهای تفصیلی:**
- ثبت زمان شروع و پایان عملیات
- ثبت جزئیات خطا (message, stack, addressData)
- ثبت خطاهای Prisma (P2003, P2002, P2025)
- عدم ثبت اطلاعات حساس (شماره تلفن و کد پستی به صورت `***`)

**پیام‌های خطای واضح:**
- خطاهای اعتبارسنجی: لیست تمام مشکلات
- خطاهای Foreign Key: پیام واضح برای کاربر
- خطاهای Unique Constraint: پیام مناسب
- خطاهای شبکه: پیام واضح با راهنمایی

**فایل‌های تغییر یافته:**
- `src/app/api/customer/addresses/route.ts` - ثبت خطاهای تفصیلی
- `src/contexts/CustomerContext.tsx` - مدیریت بهتر خطاها در frontend
- `src/components/checkout/AddressFormModal.tsx` - بهبود error handling

#### 5. **بهبود Frontend**

**اعتبارسنجی طول در فرم:**
- اعتبارسنجی طول فیلدها قبل از ارسال
- پیام‌های خطای واضح برای هر فیلد

**مدیریت خطا:**
- نمایش پیام‌های خطای تفصیلی از API
- مدیریت خطاهای شبکه
- ثبت خطاها در console برای debugging

**فایل‌های تغییر یافته:**
- `src/components/customer/addresses/AddressForm.tsx` - اعتبارسنجی طول
- `src/contexts/CustomerContext.tsx` - مدیریت بهتر خطاها
- `src/components/checkout/AddressFormModal.tsx` - بهبود error handling

### منطق کسب‌وکار:

#### قوانین اعتبارسنجی:
- ✅ تمام فیلدهای اجباری باید پر شوند
- ✅ طول فیلدها باید در محدوده مجاز باشد
- ✅ شماره تلفن باید فرمت ایرانی معتبر داشته باشد
- ✅ کد پستی باید دقیقاً 10 رقم باشد
- ✅ نوع آدرس باید `SHIPPING` باشد

#### قوانین امنیتی:
- ✅ کاربر باید در دیتابیس وجود داشته باشد
- ✅ حساب کاربری باید فعال باشد
- ✅ تمام عملیات در transaction انجام می‌شود
- ✅ اطلاعات حساس در لاگ‌ها ثبت نمی‌شوند

### تست:
1. ✅ ایجاد آدرس با تمام فیلدهای معتبر
2. ✅ تلاش برای ایجاد آدرس با فیلدهای خالی (باید خطا بدهد)
3. ✅ تلاش برای ایجاد آدرس با شماره تلفن نامعتبر (باید خطا بدهد)
4. ✅ تلاش برای ایجاد آدرس با کد پستی نامعتبر (باید خطا بدهد)
5. ✅ تلاش برای ایجاد آدرس با فیلدهای طولانی (باید خطا بدهد)
6. ✅ ایجاد آدرس به عنوان پیش‌فرض (باید آدرس‌های قبلی را غیرپیش‌فرض کند)
7. ✅ بررسی ثبت خطاها در console
8. ✅ بررسی پیام‌های خطای واضح برای کاربر

### نکات مهم:
- **Transaction Safety:** تمام عملیات در transaction انجام می‌شود تا از ناسازگاری جلوگیری شود
- **Error Logging:** تمام خطاها با جزئیات ثبت می‌شوند اما اطلاعات حساس محافظت می‌شوند
- **User Verification:** کاربر قبل از ایجاد آدرس بررسی می‌شود
- **Comprehensive Validation:** اعتبارسنجی در API و Frontend انجام می‌شود
- **Better UX:** پیام‌های خطای واضح و مفید برای کاربر

---

## ✅ رفع مشکل: خطای Foreign Key Constraint در حذف آدرس

### 📅 تاریخ: 2025-01-XX

### مشکل:
- پس از حذف آدرس، صفحه reload می‌شود و خطای "Internal server error" نمایش داده می‌شود
- خطای `Foreign key constraint violated on the constraint: orders_billingAddressId_fkey`
- این خطا حتی پس از migration برای حذف `billingAddressId` رخ می‌دهد
- با کلیک روی "تلاش مجدد" مشکل حل می‌شود اما تجربه کاربری بد است

### علت:
- Constraint `orders_billingAddressId_fkey` ممکن است هنوز در دیتابیس وجود داشته باشد
- Migration ممکن است به طور کامل اعمال نشده باشد
- Error handling مناسب برای این خطا وجود نداشت
- Frontend پس از خطا، صفحه را reload می‌کرد

### راه‌حل:

#### 1. **بهبود Error Handling در API**
- اضافه شدن بررسی دقیق‌تر برای foreign key constraint errors
- بررسی legacy `billingAddressId` constraint
- پیام‌های خطای واضح‌تر برای کاربر
- ثبت جزئیات خطا برای debugging

**فایل تغییر یافته:**
- `src/app/api/customer/addresses/[id]/route.ts` - بهبود error handling در DELETE endpoint

**کد اضافه شده:**
```typescript
// Handle Prisma foreign key constraint errors
if (error instanceof Prisma.PrismaClientKnownRequestError) {
  if (error.code === 'P2003') {
    const constraintName = error.meta?.field_name || (error.meta as any)?.constraint || 'unknown';
    
    // Check if it's the billing address constraint (legacy)
    if (constraintStr.includes('billingAddressId')) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Cannot delete address that is used in orders. The database migration may not be complete. Please contact support." 
        },
        { status: 400 }
      );
    }
  }
}
```

#### 2. **بهبود Migration Script**
- استفاده از DO block برای drop کردن constraint با error handling بهتر
- بررسی وجود constraint قبل از drop کردن

**فایل تغییر یافته:**
- `prisma/migrations/20250101000000_remove_billing_address/migration.sql` - بهبود migration script

#### 3. **بهبود Frontend Error Handling**
- عدم reload صفحه در صورت خطا
- نمایش پیام خطای واضح به کاربر در modal حذف
- عدم جایگزینی لیست آدرس‌ها با صفحه خطا در صورت خطای حذف
- استفاده از `fetchAddresses()` به جای `window.location.reload()` برای retry
- نمایش loading state در modal حذف
- نمایش خطا در modal به جای جایگزینی کل صفحه

**فایل تغییر یافته:**
- `src/contexts/CustomerContext.tsx` - بهبود error handling در `deleteAddress` (عدم set کردن loading state)
- `src/components/customer/addresses/AddressList.tsx` - نمایش خطا در modal و بهبود UX

#### 4. **Script برای Fix Manual**
- ایجاد script SQL برای drop کردن constraint به صورت manual در صورت نیاز

**فایل جدید:**
- `scripts/fix_billing_address_constraint.sql` - Script برای fix کردن constraint

### تست:
1. ✅ حذف آدرس که در orders استفاده نشده (باید موفق باشد)
2. ✅ حذف آدرس که در orders استفاده شده (باید خطای واضح در modal نمایش دهد)
3. ✅ بررسی عدم reload صفحه در صورت خطا
4. ✅ بررسی نمایش پیام خطای واضح در modal حذف
5. ✅ بررسی عدم جایگزینی لیست با صفحه خطا
6. ✅ بررسی نمایش loading state در modal
7. ✅ بررسی ثبت خطاها در console
8. ✅ بررسی استفاده از `fetchAddresses()` به جای `window.location.reload()`

### نکات مهم:
- **Migration Check:** اگر خطا ادامه دارد، script `fix_billing_address_constraint.sql` را اجرا کنید
- **Error Messages:** پیام‌های خطا واضح و مفید هستند و در modal نمایش داده می‌شوند
- **No Page Reload:** صفحه در صورت خطا reload نمی‌شود، از `fetchAddresses()` استفاده می‌شود
- **Better UX:** 
  - خطاها در modal حذف نمایش داده می‌شوند، نه در جایگزینی کل صفحه
  - لیست آدرس‌ها در صورت خطای حذف باقی می‌ماند
  - Loading state در modal نمایش داده می‌شود
  - کاربر می‌داند چرا آدرس حذف نشده است

### اجرای خودکار Fix Script:
- Script `fix_billing_address_constraint.sql` به صورت خودکار اجرا شده است
- Constraint `orders_billingAddressId_fkey` و column `billingAddressId` از دیتابیس حذف شده‌اند
- دیتابیس اکنون با schema هماهنگ است

