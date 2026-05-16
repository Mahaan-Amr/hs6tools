# SMS.ir Template Setup

زبان اصلی پیامک‌ها فارسی است و SMS.ir برای ارسال سریع از قالب‌های تاییدشده استفاده می‌کند.

## مراحل ساخت قالب‌ها

1. وارد پنل SMS.ir شوید و به `https://app.sms.ir/fast-send/template` بروید.
2. برای هر پیام زیر یک قالب جدا بسازید.
3. نام پارامترها را دقیقاً مثل جدول وارد کنید. در متن قالب از فرمت `#OTP#` استفاده کنید.
4. همه قالب‌ها باید خط لینک ثابت `https://hs6tools.com/fa` را در انتهای متن داشته باشند، مثل قالب تایید فعلی.
5. صبر کنید قالب‌ها توسط SMS.ir تایید شوند.
6. شناسه هر قالب را در متغیر محیطی متناظر قرار دهید.
7. برنامه را ری‌استارت یا دیپلوی کنید تا PM2/Next env جدید را بخواند.
8. ابتدا `/api/admin/sms/test` را بررسی کنید، سپس ثبت‌نام، بازیابی رمز، ثبت سفارش، پرداخت موفق، و تغییر وضعیت سفارش را تست کنید.

## قالب‌ها و متغیرها

| Env var | عنوان پیشنهادی | Parameters | متن دقیق قالب |
| --- | --- | --- | --- |
| `SMSIR_SIGNUP_VERIFY_TEMPLATE_ID` | `signup_verify` | `OTP` | `کد تایید شما #OTP# می‌باشد. این کد ۵ دقیقه اعتبار دارد.`<br>`https://hs6tools.com/fa` |
| `SMSIR_WELCOME_SIMPLE_TEMPLATE_ID` | `welcome_simple` | `CUSTOMER` | `#CUSTOMER# عزیز، به فروشگاه HS6Tools خوش آمدید. از همراهی شما بسیار خوشحالیم.`<br>`https://hs6tools.com/fa` |
| `SMSIR_WELCOME_INFO_TEMPLATE_ID` | `welcome_info` | `CUSTOMER` | `#CUSTOMER# جان، خوش اومدی!`<br>`ثبت‌نام شما در HS6Tools با موفقیت انجام شد. همیشه با جدیدترین تخفیف‌ها و پیشنهادات ویژه در جریان باشید. ممنون که به ما اعتماد کردید!`<br>`https://hs6tools.com/fa` |
| `SMSIR_LOGIN_OTP_TEMPLATE_ID` | `login_otp` | `OTP` | `کد ورود شما به HS6Tools: #OTP#`<br>`این کد تا ۲ دقیقه اعتبار دارد.`<br>`https://hs6tools.com/fa` |
| `SMSIR_PASSWORD_RESET_TEMPLATE_ID` | `password_reset` | `OTP` | `کد بازیابی رمز عبور شما: #OTP#`<br>`لطفا این کد را در صفحه بازیابی HS6Tools وارد کنید.`<br>`https://hs6tools.com/fa` |
| `SMSIR_PURCHASE_CONFIRMED_TEMPLATE_ID` | `purchase_confirmed` | `ORDER` | `خرید شما با موفقیت ثبت شد. سفارش شماره #ORDER# در حال پردازش است. به‌زودی مراحل بعدی از طریق پیامک اطلاع‌رسانی می‌شود. از اعتماد شما سپاسگزاریم.`<br>`https://hs6tools.com/fa` |
| `SMSIR_INVOICE_TEMPLATE_ID` | `invoice` | `INVOICE`, `AMOUNT` | `فاکتور شماره #INVOICE# به مبلغ #AMOUNT# ریال صادر شد.`<br>`https://hs6tools.com/fa` |
| `SMSIR_POST_TRACKING_TEMPLATE_ID` | `post_tracking` | `CUSTOMER`, `ORDER`, `ADDRESS`, `TRACKING` | `#CUSTOMER# عزیز، سفارش شما با شماره #ORDER# از طریق پست به آدرس #ADDRESS# ارسال شد.`<br>`کد رهگیری پستی: #TRACKING#`<br>`https://hs6tools.com/fa` |
| `SMSIR_ORDER_PROCESSING_TEMPLATE_ID` | `order_processing` | `ORDER` | `وضعیت سفارش #ORDER# به "در حال پردازش" تغییر کرد. به محض ارسال، کد رهگیری برایتان پیامک خواهد شد.`<br>`https://hs6tools.com/fa` |

`SMSIR_LOGIN_OTP_TEMPLATE_ID` فعلاً فقط برای آماده بودن قالب و تابع است و به فرایند ورود وصل نشده است.
