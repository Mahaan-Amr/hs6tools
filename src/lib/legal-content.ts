export interface LegalDocument {
  title: string;
  description: string;
  updatedLabel: string;
  updatedAt: string;
  sections: Array<{
    title: string;
    paragraphs: string[];
    items?: string[];
  }>;
}

type LegalLocale = "fa" | "en" | "ar";

const documents: Record<LegalLocale, { privacy: LegalDocument; terms: LegalDocument }> = {
  fa: {
    privacy: {
      title: "سیاست حفظ حریم خصوصی",
      description: "نحوه جمع‌آوری، استفاده و محافظت HS6Tools از اطلاعات کاربران فروشگاه.",
      updatedLabel: "آخرین به‌روزرسانی",
      updatedAt: "۲۰ مرداد ۱۴۰۵",
      sections: [
        {
          title: "اطلاعاتی که دریافت می‌کنیم",
          paragraphs: ["اطلاعات فقط برای ارائه خدمات فروشگاه، پشتیبانی و انجام سفارش‌ها دریافت می‌شود."],
          items: ["اطلاعات حساب و تماس", "نشانی‌های ارسال و اطلاعات سفارش", "پیام‌های پشتیبانی، علاقه‌مندی‌ها و دیدگاه‌ها", "اطلاعات فنی ضروری برای امنیت و عملکرد سایت"],
        },
        {
          title: "نحوه استفاده از اطلاعات",
          paragraphs: ["از اطلاعات برای مدیریت حساب، پردازش و پیگیری سفارش، پاسخ‌گویی به درخواست‌ها، پیشگیری از سوءاستفاده و بهبود فروشگاه استفاده می‌کنیم."],
        },
        {
          title: "پرداخت و ارائه‌دهندگان خدمات",
          paragraphs: ["پرداخت‌ها از طریق ارائه‌دهنده پرداخت معرفی‌شده در فرایند خرید انجام می‌شوند. اطلاعات فقط در حد لازم برای انجام پرداخت، ارسال، میزبانی و پشتیبانی با ارائه‌دهندگان مرتبط تبادل می‌شود."],
        },
        {
          title: "نگهداری و امنیت",
          paragraphs: ["اطلاعات تا زمانی نگهداری می‌شود که برای ارائه خدمات، سوابق سفارش، الزامات قانونی یا رسیدگی به اختلاف‌ها لازم باشد. اقدامات فنی و دسترسی‌های محدود برای محافظت از داده‌ها به‌کار گرفته می‌شود."],
        },
        {
          title: "انتخاب‌ها و تماس",
          paragraphs: ["برای مشاهده، اصلاح یا درخواست حذف اطلاعات قابل حذف، از صفحه تماس یا ایمیل info@hs6tools.com با ما ارتباط بگیرید."],
        },
      ],
    },
    terms: {
      title: "شرایط استفاده",
      description: "شرایط استفاده از فروشگاه، حساب کاربری و خدمات HS6Tools.",
      updatedLabel: "آخرین به‌روزرسانی",
      updatedAt: "۲۰ مرداد ۱۴۰۵",
      sections: [
        {
          title: "پذیرش شرایط",
          paragraphs: ["با استفاده از سایت یا ثبت سفارش، این شرایط و سیاست حفظ حریم خصوصی را می‌پذیرید. اگر با آن‌ها موافق نیستید، از ثبت سفارش خودداری کنید."],
        },
        {
          title: "محصولات، قیمت و موجودی",
          paragraphs: ["تلاش می‌کنیم مشخصات، تصاویر، قیمت و موجودی دقیق باشند. در صورت خطای آشکار یا تغییر موجودی پیش از نهایی‌شدن سفارش، برای اصلاح یا لغو سفارش با مشتری هماهنگ می‌شود."],
        },
        {
          title: "حساب و سفارش",
          paragraphs: ["کاربر مسئول صحت اطلاعات حساب و سفارش و حفظ امنیت دسترسی خود است. ثبت سفارش به معنی دریافت درخواست است و تأیید نهایی پس از تأیید پرداخت و امکان تأمین انجام می‌شود."],
        },
        {
          title: "پرداخت، ارسال و خدمات پس از فروش",
          paragraphs: ["روش‌ها و هزینه‌های قابل اعمال در فرایند خرید یا هنگام هماهنگی سفارش اعلام می‌شوند. پرسش‌های مربوط به ارسال، ضمانت، مرجوعی یا محصول آسیب‌دیده از طریق پشتیبانی بررسی می‌شوند."],
        },
        {
          title: "استفاده مجاز و مالکیت محتوا",
          paragraphs: ["اختلال در سایت، دسترسی غیرمجاز، سوءاستفاده از حساب‌ها و استفاده گمراه‌کننده از محتوای HS6Tools مجاز نیست. علائم، تصاویر و محتوای اختصاصی متعلق به صاحبان قانونی آن‌هاست."],
        },
        {
          title: "تغییرات و تماس",
          paragraphs: ["ممکن است این شرایط با تغییر خدمات یا الزامات به‌روزرسانی شود. نسخه جاری در همین صفحه منتشر می‌شود. پرسش‌ها را از طریق صفحه تماس یا info@hs6tools.com ارسال کنید."],
        },
      ],
    },
  },
  en: {
    privacy: {
      title: "Privacy Policy",
      description: "How HS6Tools collects, uses, and protects storefront customer information.",
      updatedLabel: "Last updated",
      updatedAt: "11 August 2026",
      sections: [
        { title: "Information we receive", paragraphs: ["We receive information needed to operate the storefront, provide support, and fulfil orders."], items: ["Account and contact details", "Shipping addresses and order information", "Support messages, wishlists, and reviews", "Technical information required for security and site operation"] },
        { title: "How information is used", paragraphs: ["Information is used to manage accounts, process and track orders, respond to requests, prevent abuse, and improve the storefront."] },
        { title: "Payments and service providers", paragraphs: ["Payments are handled by the provider shown during checkout. Information is shared with relevant payment, delivery, hosting, and support providers only as needed to provide the service."] },
        { title: "Retention and security", paragraphs: ["Information is retained while needed for services, order records, legal obligations, or dispute handling. Technical safeguards and limited access are used to protect it."] },
        { title: "Choices and contact", paragraphs: ["To access, correct, or request deletion of eligible information, use the contact page or email info@hs6tools.com."] },
      ],
    },
    terms: {
      title: "Terms of Service",
      description: "Terms governing use of the HS6Tools storefront, accounts, and services.",
      updatedLabel: "Last updated",
      updatedAt: "11 August 2026",
      sections: [
        { title: "Acceptance", paragraphs: ["By using the site or placing an order, you accept these terms and the Privacy Policy. Do not place an order if you disagree."] },
        { title: "Products, prices, and availability", paragraphs: ["We aim to keep descriptions, images, prices, and availability accurate. If an obvious error or stock change occurs before confirmation, we will coordinate a correction or cancellation."] },
        { title: "Accounts and orders", paragraphs: ["Customers are responsible for accurate account and order information and for securing account access. An order is a request; final acceptance depends on payment confirmation and fulfilment availability."] },
        { title: "Payment, delivery, and after-sales support", paragraphs: ["Applicable methods and costs are shown during checkout or order coordination. Delivery, warranty, return, and damaged-product requests are reviewed through support."] },
        { title: "Acceptable use and content", paragraphs: ["Site disruption, unauthorized access, account abuse, and misleading use of HS6Tools content are prohibited. Brand assets, images, and original content belong to their lawful owners."] },
        { title: "Changes and contact", paragraphs: ["These terms may be updated as services or requirements change. The current version appears here. Send questions through the contact page or info@hs6tools.com."] },
      ],
    },
  },
  ar: {
    privacy: {
      title: "سياسة الخصوصية",
      description: "كيفية جمع HS6Tools لمعلومات مستخدمي المتجر واستخدامها وحمايتها.",
      updatedLabel: "آخر تحديث",
      updatedAt: "11 أغسطس 2026",
      sections: [
        { title: "المعلومات التي نستلمها", paragraphs: ["نستلم المعلومات اللازمة لتشغيل المتجر وتقديم الدعم وتنفيذ الطلبات."], items: ["بيانات الحساب والاتصال", "عناوين الشحن ومعلومات الطلب", "رسائل الدعم وقوائم الرغبات والمراجعات", "المعلومات التقنية اللازمة للأمان وتشغيل الموقع"] },
        { title: "كيفية استخدام المعلومات", paragraphs: ["تُستخدم المعلومات لإدارة الحسابات ومعالجة الطلبات وتتبعها والرد على الطلبات ومنع إساءة الاستخدام وتحسين المتجر."] },
        { title: "الدفع ومقدمو الخدمات", paragraphs: ["تتم معالجة الدفع عبر المزود المعروض أثناء إتمام الشراء، ولا تُشارك المعلومات إلا بالقدر اللازم للدفع والتوصيل والاستضافة والدعم."] },
        { title: "الاحتفاظ والأمان", paragraphs: ["نحتفظ بالمعلومات ما دامت لازمة للخدمات أو سجلات الطلبات أو الالتزامات القانونية أو معالجة النزاعات، مع تطبيق وسائل حماية تقنية وتقييد الوصول."] },
        { title: "الخيارات والتواصل", paragraphs: ["لطلب الوصول إلى المعلومات المؤهلة أو تصحيحها أو حذفها، استخدم صفحة الاتصال أو راسل info@hs6tools.com."] },
      ],
    },
    terms: {
      title: "شروط الخدمة",
      description: "الشروط المنظمة لاستخدام متجر HS6Tools والحسابات والخدمات.",
      updatedLabel: "آخر تحديث",
      updatedAt: "11 أغسطس 2026",
      sections: [
        { title: "قبول الشروط", paragraphs: ["باستخدام الموقع أو تقديم طلب، فإنك توافق على هذه الشروط وسياسة الخصوصية."] },
        { title: "المنتجات والأسعار والتوافر", paragraphs: ["نسعى إلى دقة الأوصاف والصور والأسعار والتوافر. عند وجود خطأ واضح أو تغير المخزون قبل التأكيد، سنتواصل لتصحيح الطلب أو إلغائه."] },
        { title: "الحسابات والطلبات", paragraphs: ["يتحمل المستخدم مسؤولية دقة بيانات الحساب والطلب وحماية الوصول. الطلب هو طلب شراء ويعتمد قبوله النهائي على تأكيد الدفع وإمكانية التنفيذ."] },
        { title: "الدفع والتوصيل وخدمة ما بعد البيع", paragraphs: ["تظهر الطرق والتكاليف المطبقة أثناء الدفع أو تنسيق الطلب. تُراجع طلبات التوصيل والضمان والإرجاع والمنتجات التالفة عبر الدعم."] },
        { title: "الاستخدام المقبول والمحتوى", paragraphs: ["يُحظر تعطيل الموقع أو الوصول غير المصرح أو إساءة استخدام الحسابات أو استخدام محتوى HS6Tools بشكل مضلل."] },
        { title: "التغييرات والتواصل", paragraphs: ["قد تتغير هذه الشروط مع تغير الخدمات أو المتطلبات، وتُنشر النسخة الحالية هنا. أرسل الأسئلة عبر صفحة الاتصال أو info@hs6tools.com."] },
      ],
    },
  },
};

export function getLegalDocument(locale: string, type: "privacy" | "terms") {
  const resolvedLocale: LegalLocale = locale === "en" || locale === "ar" ? locale : "fa";
  return documents[resolvedLocale][type];
}
