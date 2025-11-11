export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQSection {
  title: string;
  items: FAQItem[];
}

export interface FAQContent {
  title: string;
  subtitle: string;
  sections: FAQSection[];
  contactTitle: string;
  contactDescription: string;
  contactCta: string;
}

export const FAQ_CONTENT: Record<string, FAQContent> = {
  fa: {
    title: "سوالات متداول",
    subtitle:
      "پاسخ به رایج‌ترین پرسش‌ها درباره محصولات، سفارش‌ها و خدمات پشتیبانی HS6Tools.",
    sections: [
      {
        title: "محصولات و موجودی",
        items: [
          {
            question: "چطور از موجود بودن محصول مطمئن شوم؟",
            answer:
              "وضعیت موجودی هر محصول در صفحه همان محصول قابل مشاهده است. همچنین می‌توانید از طریق دکمه «تماس با ما» با تیم فروش در ارتباط باشید و از موجودی لحظه‌ای مطلع شوید.",
          },
          {
            question: "آیا امکان سفارش محصولات سفارشی وجود دارد؟",
            answer:
              "بله، در صورت نیاز به ابعاد یا ویژگی‌های خاص، تیم پشتیبانی ما می‌تواند در ثبت سفارش سفارشی به شما کمک کند. فرم درخواست محصولات سفارشی در بخش تماس موجود است.",
          },
          {
            question: "چطور از اصالت و کیفیت محصولات مطمئن باشم؟",
            answer:
              "تمام محصولات HS6Tools با ضمانت اصالت و کیفیت عرضه می‌شوند و پیش از ارسال، تحت بررسی کنترل کیفیت قرار می‌گیرند.",
          },
        ],
      },
      {
        title: "پرداخت و ارسال",
        items: [
          {
            question: "چه روش‌های پرداختی پشتیبانی می‌شود؟",
            answer:
              "در حال حاضر پرداخت از طریق درگاه بانکی امن امکان‌پذیر است. برای سفارش‌های سازمانی می‌توانید با تیم فروش تماس بگیرید تا روش‌های پرداخت جایگزین بررسی شود.",
          },
          {
            question: "زمان پردازش و ارسال سفارش چقدر است؟",
            answer:
              "سفارش‌ها معمولاً طی ۲۴ ساعت کاری پردازش می‌شوند و بسته به شهر مقصد، بین ۲ تا ۵ روز کاری تحویل داده خواهند شد.",
          },
          {
            question: "آیا امکان پیگیری وضعیت ارسال وجود دارد؟",
            answer:
              "بله، پس از ارسال سفارش، کد رهگیری برای شما ارسال می‌شود که از طریق آن می‌توانید وضعیت سفارش را به صورت آنلاین دنبال کنید.",
          },
        ],
      },
      {
        title: "خدمات پس از فروش",
        items: [
          {
            question: "شرایط ضمانت محصولات چگونه است؟",
            answer:
              "تمام محصولات HS6Tools دارای ضمانت تعویض قطعات معیوب به مدت ۱۲ ماه هستند. جزئیات کامل ضمانت در صفحه محصول درج شده است.",
          },
          {
            question: "چطور درخواست بازگشت یا تعمیر ثبت کنم؟",
            answer:
              "با مراجعه به صفحه تماس با ما و انتخاب گزینه «خدمات پس از فروش» می‌توانید درخواست خود را ثبت کنید. تیم ما ظرف ۲۴ ساعت کاری با شما تماس خواهد گرفت.",
          },
          {
            question: "آیا آموزش استفاده از محصول ارائه می‌شود؟",
            answer:
              "بله، در بخش آموزش می‌توانید ویدئوها و مقالات تخصصی مرتبط با هر محصول را مشاهده کنید. همچنین امکان درخواست دوره حضوری برای سازمان‌ها وجود دارد.",
          },
        ],
      },
    ],
    contactTitle: "سوالی دارید که در اینجا پاسخ داده نشده است؟",
    contactDescription:
      "تیم پشتیبانی ما آماده است تا راهنمایی شخصی‌سازی‌شده برای نیازهای شما ارائه دهد. می‌توانید از طریق فرم تماس یا تماس تلفنی با ما در ارتباط باشید.",
    contactCta: "تماس با پشتیبانی",
  },
  en: {
    title: "Frequently Asked Questions",
    subtitle:
      "Answers to the most common questions about our products, ordering process, and customer support.",
    sections: [
      {
        title: "Products & Availability",
        items: [
          {
            question: "How can I check product availability?",
            answer:
              "Each product page shows its live stock status. For bulk orders or urgent timelines, contact our sales team for real-time availability.",
          },
          {
            question: "Do you offer custom tooling solutions?",
            answer:
              "Yes. Our engineering team can manufacture tooling to your specifications. Share your requirements through the contact form and we will prepare a proposal.",
          },
          {
            question: "Are all products quality assured?",
            answer:
              "Absolutely. Every HS6Tools product undergoes multi-stage quality inspection before shipping and is covered by our warranty program.",
          },
        ],
      },
      {
        title: "Payments & Shipping",
        items: [
          {
            question: "What payment methods are accepted?",
            answer:
              "We currently support secure online payments. Corporate clients can coordinate alternative methods directly with our sales representatives.",
          },
          {
            question: "How long does delivery take?",
            answer:
              "Orders are processed within 24 business hours. Delivery typically takes 2–5 business days depending on your city and carrier capacity.",
          },
          {
            question: "Can I track my shipment?",
            answer:
              "Yes. As soon as your order ships, we email you a tracking number so you can monitor progress in real time.",
          },
        ],
      },
      {
        title: "Support & Warranty",
        items: [
          {
            question: "What warranty coverage is included?",
            answer:
              "All HS6Tools equipment includes a 12-month warranty covering manufacturing defects. Product pages list specific coverage details.",
          },
          {
            question: "How do I request a return or repair?",
            answer:
              "Submit a request through the contact page and choose “After-Sales Support.” Our specialists will follow up within one business day.",
          },
          {
            question: "Do you provide training resources?",
            answer:
              "Yes. Visit the education section for tutorials, guides, and videos. We also offer on-site training for enterprise customers.",
          },
        ],
      },
    ],
    contactTitle: "Need extra help?",
    contactDescription:
      "Our support engineers are ready to answer detailed questions about compatibility, maintenance, and deployment.",
    contactCta: "Contact Support",
  },
  ar: {
    title: "الأسئلة الشائعة",
    subtitle:
      "إجابات على أكثر الأسئلة شيوعًا حول منتجات HS6Tools وعمليات الطلب والدعم الفني.",
    sections: [
      {
        title: "المنتجات والتوافر",
        items: [
          {
            question: "كيف أتحقق من توفر المنتج؟",
            answer:
              "تعرض صفحة كل منتج حالة المخزون. للطلبات الكبيرة يمكنك التواصل مع فريق المبيعات للحصول على تحديث فوري.",
          },
          {
            question: "هل توفرون حلولًا مخصصة للأدوات؟",
            answer:
              "نعم، يمكن لفريقنا الهندسي تصنيع أدوات حسب المواصفات المطلوبة. يرجى إرسال التفاصيل عبر نموذج الاتصال لنتواصل معك.",
          },
          {
            question: "هل منتجاتكم مضمونة الجودة؟",
            answer:
              "جميع منتجات HS6Tools تمر بمراحل فحص جودة متعددة قبل الشحن وتشملها برامج الضمان الخاصة بنا.",
          },
        ],
      },
      {
        title: "الدفع والشحن",
        items: [
          {
            question: "ما هي طرق الدفع المتاحة؟",
            answer:
              "نوفر حاليًا الدفع الإلكتروني الآمن. يمكن للعملاء من الشركات التنسيق مع فريق المبيعات لطرق دفع بديلة.",
          },
          {
            question: "ما مدة معالجة وتسليم الطلب؟",
            answer:
              "يتم معالجة الطلبات خلال 24 ساعة عمل، ويستغرق التسليم عادة من 2 إلى 5 أيام عمل حسب المدينة.",
          },
          {
            question: "هل يمكنني تتبع شحنتي؟",
            answer:
              "نعم، عند شحن الطلب نسترسل لك رقم تتبع لتتابع حالة الشحنة لحظة بلحظة.",
          },
        ],
      },
      {
        title: "الدعم وخدمة ما بعد البيع",
        items: [
          {
            question: "ما هي شروط الضمان؟",
            answer:
              "تشمل جميع المنتجات ضمانًا لمدة 12 شهرًا ضد عيوب التصنيع. راجع صفحة المنتج لمعرفة تفاصيل التغطية.",
          },
          {
            question: "كيف أطلب إرجاع أو صيانة؟",
            answer:
              "يمكنك إرسال طلب عبر صفحة الاتصال مع اختيار خيار «خدمة ما بعد البيع». سيتواصل فريقنا خلال يوم عمل واحد.",
          },
          {
            question: "هل تقدمون مواد تدريبية؟",
            answer:
              "نعم، ستجد في قسم التعليم مقاطع فيديو ومقالات تعليمية. كما نوفر جلسات تدريب ميداني للعملاء المؤسسيين.",
          },
        ],
      },
    ],
    contactTitle: "لم تجد إجابتك هنا؟",
    contactDescription:
      "فريق الدعم لدينا جاهز لتقديم استشارات مفصلة حول الاستخدام والصيانة وخيارات الشراء.",
    contactCta: "تواصل مع الدعم",
  },
};

