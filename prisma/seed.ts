import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data (only existing tables)
    console.log('🧹 Clearing existing data...');
    await prisma.homepageFeaturedCategory.deleteMany();
    await prisma.homepageSlide.deleteMany();
    await prisma.homepageContent.deleteMany();
    await prisma.wishlistItem.deleteMany();
    await prisma.review.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.article.deleteMany();
    await prisma.contentCategory.deleteMany();
    await prisma.educationLesson.deleteMany();
    await prisma.educationCategory.deleteMany();
    await prisma.address.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Data cleared successfully');

    // Create Admin User
    console.log('👤 Creating admin user...');
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@hs6tools.com',
        phone: '+989123456789',
        firstName: 'مدیر',
        lastName: 'سیستم',
        passwordHash: adminPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        company: 'HS6Tools',
        position: 'System Administrator',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      },
    });

    console.log('✅ Admin user created:', adminUser.email);

    // Create Regular User for Testing
    console.log('👤 Creating test user...');
    const userPassword = await bcrypt.hash('User123!', 12);
    
    const testUser = await prisma.user.create({
      data: {
        email: 'user@hs6tools.com',
        phone: '+989123456788',
        firstName: 'کاربر',
        lastName: 'تست',
        passwordHash: userPassword,
        role: 'CUSTOMER',
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      },
    });

    console.log('✅ Test user created:', testUser.email);

    // Create Product Categories with Multilingual Support
    console.log('📂 Creating product categories...');
    
    const mainCategories = [
      {
        name: 'ابزارهای برش',
        nameEn: 'Cutting Tools',
        nameAr: 'أدوات القطع',
        slug: 'cutting-tools',
        description: 'ابزارهای تخصصی برای برش انواع مواد',
        descriptionEn: 'Professional tools for cutting various materials',
        descriptionAr: 'أدوات متخصصة لقطع المواد المختلفة',
        icon: '🔪',
        image: '/api/uploads/products/1755653459043-ttnhnv7cwxi.jpg',
        children: [
          {
            name: 'دیسک‌های الماسه',
            nameEn: 'Diamond Discs',
            nameAr: 'أقراص الماس',
            slug: 'diamond-discs',
            description: 'دیسک‌های الماسه برای برش سخت‌ترین مواد',
            descriptionEn: 'Diamond discs for cutting the hardest materials',
            descriptionAr: 'أقراص الماس لقطع أصعب المواد',
            icon: '💎',
            image: '/api/uploads/products/1755653459043-ttnhnv7cwxi.jpg',
          },
          {
            name: 'تیغه‌های اره',
            nameEn: 'Saw Blades',
            nameAr: 'شفرات المنشار',
            slug: 'saw-blades',
            description: 'تیغه‌های اره برای برش چوب و فلز',
            descriptionEn: 'Saw blades for cutting wood and metal',
            descriptionAr: 'شفرات المنشار لقطع الخشب والمعادن',
            icon: '🪚',
            image: '/api/uploads/products/1755653459043-ttnhnv7cwxi.jpg',
          }
        ]
      },
      {
        name: 'ابزارهای نجاری',
        nameEn: 'Woodworking Tools',
        nameAr: 'أدوات النجارة',
        slug: 'woodworking-tools',
        description: 'ابزارهای تخصصی نجاری و کار با چوب',
        descriptionEn: 'Professional woodworking tools',
        descriptionAr: 'أدوات النجارة المتخصصة',
        icon: '🪵',
        image: '/api/uploads/products/1755653459043-ttnhnv7cwxi.jpg',
        children: [
          {
            name: 'اره‌های دستی',
            nameEn: 'Hand Saws',
            nameAr: 'مناشير يدوية',
            slug: 'hand-saws',
            description: 'اره‌های دستی برای برش دقیق چوب',
            descriptionEn: 'Hand saws for precise wood cutting',
            descriptionAr: 'مناشير يدوية للقطع الدقيق للخشب',
            icon: '🪚',
            image: '/api/uploads/products/1755653459043-ttnhnv7cwxi.jpg',
          }
        ]
      },
      {
        name: 'ابزارهای اندازه‌گیری',
        nameEn: 'Measuring Tools',
        nameAr: 'أدوات القياس',
        slug: 'measuring-tools',
        description: 'ابزارهای دقیق اندازه‌گیری و ترسیم',
        descriptionEn: 'Precise measuring and drawing tools',
        descriptionAr: 'أدوات قياس ورسم دقيقة',
        icon: '📏',
        image: '/api/uploads/products/1755653459043-ttnhnv7cwxi.jpg',
        children: [
          {
            name: 'کولیس‌ها',
            nameEn: 'Calipers',
            nameAr: 'الفرجار',
            slug: 'calipers',
            description: 'کولیس‌های دیجیتال و آنالوگ',
            descriptionEn: 'Digital and analog calipers',
            descriptionAr: 'فرجار رقمي وتناظري',
            icon: '📐',
            image: '/api/uploads/products/1755653459043-ttnhnv7cwxi.jpg',
          }
        ]
      }
    ];

    const createdCategories: Array<{ id: string; slug: string }> = [];

    for (const mainCat of mainCategories) {
      const { children, ...mainCatData } = mainCat;
      
      const createdMainCat = await prisma.category.create({
        data: mainCatData,
      });
      createdCategories.push(createdMainCat);

      for (const childCat of children) {
        const createdChildCat = await prisma.category.create({
          data: {
            ...childCat,
            parentId: createdMainCat.id,
          },
        });
        createdCategories.push(createdChildCat);
      }
    }

    console.log('✅ Product categories created:', createdCategories.length);

    // Create Homepage CMS demo content
    console.log('🏠 Creating homepage CMS demo content...');

    const homepageCategory1 = createdCategories.find((category) => category.slug === 'diamond-discs');
    const homepageCategory2 = createdCategories.find((category) => category.slug === 'hand-saws');
    const homepageCategory3 = createdCategories.find((category) => category.slug === 'calipers');

    if (!homepageCategory1 || !homepageCategory2 || !homepageCategory3) {
      throw new Error('Required homepage categories were not created successfully.');
    }

    const homepageLocales = [
      {
        locale: 'fa',
        heroTagline: 'ابزار حرفه‌ای برای برش، نجاری و اندازه‌گیری دقیق',
        heroDescription: 'صفحه اصلی چندزبانه حالا از طریق پنل مدیریت کنترل می‌شود. این داده آزمایشی برای بررسی هیرو، اسلایدر و دسته‌بندی‌های منتخب ساخته شده تا بتوانید رفتار کامل CMS را در عمل ببینید.',
        heroPrimaryCtaLabel: 'مشاهده محصولات',
        heroPrimaryCtaHref: '/fa/shop',
        heroSecondaryCtaLabel: 'درباره ما',
        heroSecondaryCtaHref: '/fa/about',
        categorySectionTitle: 'دسته‌بندی‌های منتخب صفحه اصلی',
        categorySectionSubtitle: 'سه دسته نمونه زیر از دسته‌بندی‌های واقعی فروشگاه می‌آیند و متن هر کارت در صورت نیاز از اینجا قابل بازنویسی است.',
        categoryViewAllLabel: 'مشاهده همه محصولات',
        featuredCategory1Id: homepageCategory1.id,
        featuredCategory2Id: homepageCategory2.id,
        featuredCategory3Id: homepageCategory3.id,
        featuredCategory1Title: 'دیسک‌های الماسه پرفروش',
        featuredCategory1Description: 'برای برش بتن، سنگ و سرامیک با تمرکز روی سرعت، دوام و دقت.',
        featuredCategory2Title: 'اره‌های دستی نجاری',
        featuredCategory2Description: 'برای برش‌های دقیق چوب با حس حرفه‌ای در کارگاه و پروژه‌های سفارشی.',
        featuredCategory3Title: 'کولیس‌های دقیق',
        featuredCategory3Description: 'برای اندازه‌گیری مطمئن قطعات صنعتی و کنترل کیفیت روزانه.',
        slides: [
          {
            title: 'دیسک الماسه برای برش‌های سنگین',
            subtitle: 'نمونه اسلاید فقط با تصویر و متن برای تست حالت اطلاع‌رسانی ساده.',
            desktopImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1600&h=900&fit=crop',
            mobileImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=900&h=1200&fit=crop',
            bannerHref: null,
            buttonLabel: null,
            buttonHref: null,
            isActive: true,
            sortOrder: 0,
          },
          {
            title: 'ورود مستقیم به دسته دیسک الماسه',
            subtitle: 'این اسلاید کل بنر را به صفحه دسته‌بندی متصل می‌کند.',
            desktopImage: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1600&h=900&fit=crop',
            mobileImage: null,
            bannerHref: '/fa/categories/diamond-discs',
            buttonLabel: null,
            buttonHref: null,
            isActive: true,
            sortOrder: 1,
          },
          {
            title: 'اره دستی برای برش‌های تمیز',
            subtitle: 'نمونه اسلاید با دکمه مستقل برای بررسی CTA.',
            desktopImage: 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=1600&h=900&fit=crop',
            mobileImage: 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=900&h=1200&fit=crop',
            bannerHref: null,
            buttonLabel: 'مشاهده اره‌ها',
            buttonHref: '/fa/categories/hand-saws',
            isActive: true,
            sortOrder: 2,
          },
          {
            title: 'کولیس دیجیتال برای کنترل کیفیت',
            subtitle: 'این اسلاید هم لینک کامل بنر دارد و هم دکمه جداگانه.',
            desktopImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&h=900&fit=crop',
            mobileImage: null,
            bannerHref: '/fa/shop',
            buttonLabel: 'رفتن به فروشگاه',
            buttonHref: '/fa/shop',
            isActive: true,
            sortOrder: 3,
          },
          {
            title: 'اسلاید غیرفعال برای تست فیلتر',
            subtitle: 'این مورد باید فقط در پنل مدیریت دیده شود و در صفحه اصلی نمایش داده نشود.',
            desktopImage: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600&h=900&fit=crop',
            mobileImage: null,
            bannerHref: '/fa/about',
            buttonLabel: 'درباره شرکت',
            buttonHref: '/fa/about',
            isActive: false,
            sortOrder: 4,
          },
        ],
      },
      {
        locale: 'en',
        heroTagline: 'Professional tools for precise cutting, woodworking, and measurement',
        heroDescription: 'This demo homepage content is seeded to help you review the new CMS workflow. Use the admin panel to switch locale, edit hero copy, manage banners, and test category overrides independently.',
        heroPrimaryCtaLabel: 'View Products',
        heroPrimaryCtaHref: '/en/shop',
        heroSecondaryCtaLabel: 'About Us',
        heroSecondaryCtaHref: '/en/about',
        categorySectionTitle: 'Featured Homepage Categories',
        categorySectionSubtitle: 'These cards are connected to real seeded categories so you can verify localized storefront links and optional override copy.',
        categoryViewAllLabel: 'Browse All Products',
        featuredCategory1Id: homepageCategory1.id,
        featuredCategory2Id: homepageCategory2.id,
        featuredCategory3Id: homepageCategory3.id,
        featuredCategory1Title: 'Diamond Discs for Heavy Cutting',
        featuredCategory1Description: 'A strong homepage category sample for concrete, stone, and ceramic cutting.',
        featuredCategory2Title: null,
        featuredCategory2Description: null,
        featuredCategory3Title: 'Precision Calipers',
        featuredCategory3Description: 'Ideal for showing category text overrides next to direct category-backed data.',
        slides: [
          {
            title: 'Homepage CMS demo for English',
            subtitle: 'Image-only banner to verify informational rendering with no links.',
            desktopImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&h=900&fit=crop',
            mobileImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&h=1200&fit=crop',
            bannerHref: null,
            buttonLabel: null,
            buttonHref: null,
            isActive: true,
            sortOrder: 0,
          },
          {
            title: 'Jump straight into Diamond Discs',
            subtitle: 'Full banner link example for the localized category page.',
            desktopImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1600&h=900&fit=crop',
            mobileImage: null,
            bannerHref: '/en/categories/diamond-discs',
            buttonLabel: null,
            buttonHref: null,
            isActive: true,
            sortOrder: 1,
          },
          {
            title: 'Measure with confidence',
            subtitle: 'CTA button example pointing visitors into the shop flow.',
            desktopImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&h=900&fit=crop',
            mobileImage: null,
            bannerHref: null,
            buttonLabel: 'Shop Now',
            buttonHref: '/en/shop',
            isActive: true,
            sortOrder: 2,
          },
          {
            title: 'Hand saws for cleaner cuts',
            subtitle: 'Combined banner link and CTA button example for storefront review.',
            desktopImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&h=900&fit=crop',
            mobileImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=900&h=1200&fit=crop',
            bannerHref: '/en/categories/hand-saws',
            buttonLabel: 'Explore Category',
            buttonHref: '/en/categories/hand-saws',
            isActive: true,
            sortOrder: 3,
          },
          {
            title: 'Inactive review banner',
            subtitle: 'Seeded to confirm inactive banners stay visible in admin only.',
            desktopImage: 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=1600&h=900&fit=crop',
            mobileImage: null,
            bannerHref: '/en/about',
            buttonLabel: null,
            buttonHref: null,
            isActive: false,
            sortOrder: 4,
          },
        ],
      },
      {
        locale: 'ar',
        heroTagline: 'أدوات احترافية للقطع والنجارة والقياس الدقيق',
        heroDescription: 'تمت إضافة هذه البيانات التجريبية حتى تتمكن من مراجعة نظام إدارة الصفحة الرئيسية الجديد بسرعة، مع محتوى مستقل لكل لغة في الهيرو والسلايدر وبطاقات الفئات.',
        heroPrimaryCtaLabel: 'عرض المنتجات',
        heroPrimaryCtaHref: '/ar/shop',
        heroSecondaryCtaLabel: 'من نحن',
        heroSecondaryCtaHref: '/ar/about',
        categorySectionTitle: 'فئات مختارة للصفحة الرئيسية',
        categorySectionSubtitle: 'البطاقات التالية مرتبطة بفئات حقيقية من قاعدة البيانات ويمكن تعديل نصوصها من لوحة التحكم بشكل مستقل لكل لغة.',
        categoryViewAllLabel: 'عرض جميع المنتجات',
        featuredCategory1Id: homepageCategory1.id,
        featuredCategory2Id: homepageCategory2.id,
        featuredCategory3Id: homepageCategory3.id,
        featuredCategory1Title: null,
        featuredCategory1Description: null,
        featuredCategory2Title: 'مناشير يدوية للأعمال الدقيقة',
        featuredCategory2Description: 'مثال جيد لاختبار نص تسويقي مخصص فوق بيانات الفئة الحقيقية.',
        featuredCategory3Title: null,
        featuredCategory3Description: null,
        slides: [
          {
            title: 'واجهة عربية جاهزة للمراجعة',
            subtitle: 'بانر بصري فقط لاختبار العرض بدون روابط أو أزرار.',
            desktopImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&h=900&fit=crop',
            mobileImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&h=1200&fit=crop',
            bannerHref: null,
            buttonLabel: null,
            buttonHref: null,
            isActive: true,
            sortOrder: 0,
          },
          {
            title: 'الانتقال إلى فئة أدوات القياس',
            subtitle: 'مثال على بانر قابل للنقر بالكامل.',
            desktopImage: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=1600&h=900&fit=crop',
            mobileImage: null,
            bannerHref: '/ar/categories/calipers',
            buttonLabel: null,
            buttonHref: null,
            isActive: true,
            sortOrder: 1,
          },
          {
            title: 'حلول النجارة لورش العمل',
            subtitle: 'مثال على زر دعوة لاتخاذ إجراء داخل السلايدر.',
            desktopImage: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1600&h=900&fit=crop',
            mobileImage: null,
            bannerHref: null,
            buttonLabel: 'تصفح الفئة',
            buttonHref: '/ar/categories/hand-saws',
            isActive: true,
            sortOrder: 2,
          },
          {
            title: 'الدخول إلى المتجر مباشرة',
            subtitle: 'مثال يجمع بين رابط كامل للبانر وزر مستقل.',
            desktopImage: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=1600&h=900&fit=crop',
            mobileImage: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=900&h=1200&fit=crop',
            bannerHref: '/ar/shop',
            buttonLabel: 'ابدأ التسوق',
            buttonHref: '/ar/shop',
            isActive: true,
            sortOrder: 3,
          },
          {
            title: 'شريحة غير مفعلة للمراجعة',
            subtitle: 'يجب ألا تظهر هذه الشريحة في الصفحة الرئيسية.',
            desktopImage: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600&h=900&fit=crop',
            mobileImage: null,
            bannerHref: '/ar/about',
            buttonLabel: 'تعرف علينا',
            buttonHref: '/ar/about',
            isActive: false,
            sortOrder: 4,
          },
        ],
      },
    ];

    for (const homepageLocale of homepageLocales) {
      const { slides, ...homepageContentData } = homepageLocale;

      const homepageContent = await prisma.homepageContent.create({
        data: homepageContentData,
      });

      for (const slide of slides) {
        await prisma.homepageSlide.create({
          data: {
            ...slide,
            locale: homepageLocale.locale,
            homepageContentId: homepageContent.id,
          },
        });
      }
    }

    console.log('✅ Homepage CMS demo content created:', homepageLocales.length);

    // Create Content Categories for Blog
    console.log('📝 Creating content categories...');
    
    const contentCategories = [
      {
        name: 'آموزش ابزارها',
        slug: 'tool-tutorials',
        description: 'آموزش استفاده صحیح از ابزارهای صنعتی',
        image: '/api/uploads/products/1755653459043-ttnhnv7cwxi.jpg',
      },
      {
        name: 'تکنیک‌های نجاری',
        slug: 'woodworking-techniques',
        description: 'تکنیک‌های پیشرفته نجاری و کار با چوب',
        image: '/api/uploads/products/1755653459043-ttnhnv7cwxi.jpg',
      },
      {
        name: 'ایمنی کار',
        slug: 'workplace-safety',
        description: 'راهنمای ایمنی در محیط کار',
        image: '/api/uploads/products/1755653459043-ttnhnv7cwxi.jpg',
      }
    ];

    const createdContentCategories = await Promise.all(
      contentCategories.map(cat => 
        prisma.contentCategory.create({ data: cat })
      )
    );

    console.log('✅ Content categories created:', createdContentCategories.length);

    // Create Sample Products with Multilingual Support
    console.log('🛍️ Creating sample products...');
    
    const products = [
      {
        name: 'دیسک الماسه 115 میلیمتری',
        nameEn: '115mm Diamond Disc',
        nameAr: 'قرص ماسي 115 مم',
        sku: 'DD-115-001',
        slug: 'diamond-disc-115mm',
        description: 'دیسک الماسه با کیفیت بالا برای برش سخت‌ترین مواد شامل بتن، سنگ، سرامیک و فلزات',
        descriptionEn: 'High-quality diamond disc for cutting the hardest materials including concrete, stone, ceramic and metals',
        descriptionAr: 'قرص ماسي عالي الجودة لقطع أصعب المواد بما في ذلك الخرسانة والحجر والسيراميك والمعادن',
        shortDescription: 'دیسک الماسه 115 میلیمتری برای برش مواد سخت',
        shortDescriptionEn: '115mm diamond disc for cutting hard materials',
        shortDescriptionAr: 'قرص ماسي 115 مم لقطع المواد الصلبة',
        price: 450000,
        comparePrice: 520000,
        costPrice: 380000,
        stockQuantity: 50,
        isInStock: true,
        weight: 0.8,
        dimensions: { length: 115, width: 115, height: 3.2 },
        material: 'الماس صنعتی',
        warranty: '2 سال',
        brand: 'HS6Tools',
        categorySlug: 'diamond-discs',
        isFeatured: true,
        images: [
          '/api/uploads/products/1755653481076-1brpzye0ztpg.jpg',
          '/api/uploads/products/1755653481076-1brpzye0ztpg.jpg',
        ],
        variants: [
          {
            name: 'دانه ریز',
            sku: 'DD-115-001-F',
            attributes: { grain: 'Fine', thickness: '3.2mm' },
            price: 450000,
            stockQuantity: 25,
          },
          {
            name: 'دانه متوسط',
            sku: 'DD-115-001-M',
            attributes: { grain: 'Medium', thickness: '3.2mm' },
            price: 480000,
            stockQuantity: 15,
          }
        ]
      },
      {
        name: 'اره دستی نجاری 24 اینچی',
        nameEn: '24-inch Hand Saw',
        nameAr: 'منشار يدوي 24 بوصة',
        sku: 'HS-24-001',
        slug: 'hand-saw-24inch',
        description: 'اره دستی با کیفیت بالا برای برش دقیق چوب، مناسب برای نجاران حرفه‌ای و آماتور',
        descriptionEn: 'High-quality hand saw for precise wood cutting, suitable for professional and amateur carpenters',
        descriptionAr: 'منشار يدوي عالي الجودة للقطع الدقيق للخشب، مناسب للنجارين المحترفين والهواة',
        shortDescription: 'اره دستی نجاری 24 اینچی با کیفیت حرفه‌ای',
        shortDescriptionEn: '24-inch hand saw with professional quality',
        shortDescriptionAr: 'منشار يدوي 24 بوصة بجودة احترافية',
        price: 280000,
        comparePrice: 320000,
        costPrice: 240000,
        stockQuantity: 30,
        isInStock: true,
        weight: 0.6,
        dimensions: { length: 610, width: 120, height: 2.5 },
        material: 'فولاد کربنی',
        warranty: '1 سال',
        brand: 'HS6Tools',
        categorySlug: 'hand-saws',
        isFeatured: true,
        images: [
          '/api/uploads/products/1755653481076-1brpzye0ztpg.jpg',
          '/api/uploads/products/1755653481076-1brpzye0ztpg.jpg',
        ],
        variants: [
          {
            name: 'دندان ریز',
            sku: 'HS-24-001-F',
            attributes: { teeth: 'Fine', tpi: '12' },
            price: 280000,
            stockQuantity: 15,
          },
          {
            name: 'دندان متوسط',
            sku: 'HS-24-001-M',
            attributes: { teeth: 'Medium', tpi: '8' },
            price: 300000,
            stockQuantity: 10,
          }
        ]
      },
      {
        name: 'کولیس دیجیتال 150 میلیمتری',
        nameEn: '150mm Digital Caliper',
        nameAr: 'فرجار رقمي 150 مم',
        sku: 'DC-150-001',
        slug: 'digital-caliper-150mm',
        description: 'کولیس دیجیتال با دقت 0.01 میلیمتر برای اندازه‌گیری دقیق قطعات صنعتی',
        descriptionEn: 'Digital caliper with 0.01mm accuracy for precise measurement of industrial parts',
        descriptionAr: 'فرجار رقمي بدقة 0.01 مم للقياس الدقيق للأجزاء الصناعية',
        shortDescription: 'کولیس دیجیتال 150 میلیمتری با دقت بالا',
        shortDescriptionEn: '150mm digital caliper with high precision',
        shortDescriptionAr: 'فرجار رقمي 150 مم بدقة عالية',
        price: 850000,
        comparePrice: 950000,
        costPrice: 720000,
        stockQuantity: 20,
        isInStock: true,
        weight: 0.3,
        dimensions: { length: 200, width: 50, height: 25 },
        material: 'فولاد ضد زنگ',
        warranty: '3 سال',
        brand: 'HS6Tools',
        categorySlug: 'calipers',
        isFeatured: true,
        images: [
          '/api/uploads/products/1755653481076-1brpzye0ztpg.jpg',
          '/api/uploads/products/1755653481076-1brpzye0ztpg.jpg',
        ],
        variants: [
          {
            name: 'استاندارد',
            sku: 'DC-150-001-S',
            attributes: { accuracy: '0.01mm', battery: 'CR2032' },
            price: 850000,
            stockQuantity: 15,
          },
          {
            name: 'پیشرفته',
            sku: 'DC-150-001-P',
            attributes: { accuracy: '0.005mm', battery: 'CR2032', bluetooth: true },
            price: 1200000,
            stockQuantity: 5,
          }
        ]
      }
    ];

    for (const productData of products) {
      const { categorySlug, images, variants, ...productFields } = productData;
      
      // Find category by slug
      const category = createdCategories.find(cat => cat.slug === categorySlug);
      if (!category) {
        console.warn(`Category not found for slug: ${categorySlug}`);
        continue;
      }

      // Create product
      const product = await prisma.product.create({
        data: {
          ...productFields,
          categoryId: category.id,
        },
      });

      // Create product images
      for (let i = 0; i < images.length; i++) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: images[i],
            alt: `${product.name} - تصویر ${i + 1}`,
            title: product.name,
            sortOrder: i,
            isPrimary: i === 0,
          },
        });
      }

      // Create product variants
      for (const variantData of variants) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            ...variantData,
          },
        });
      }
    }

    console.log('✅ Products created:', products.length);

    // Create Sample Articles
    console.log('📝 Creating sample articles...');
    
    const articles = [
      {
        title: 'راهنمای انتخاب دیسک الماسه مناسب',
        slug: 'diamond-disc-selection-guide',
        excerpt: 'انتخاب دیسک الماسه مناسب برای کار شما می‌تواند تفاوت زیادی در کیفیت و سرعت کار ایجاد کند.',
        content: `
          <h2>مقدمه</h2>
          <p>دیسک‌های الماسه یکی از مهم‌ترین ابزارهای برش در صنعت هستند. انتخاب صحیح این ابزار می‌تواند تأثیر مستقیمی بر کیفیت کار و بهره‌وری شما داشته باشد.</p>
          
          <h2>انواع دانه‌بندی</h2>
          <h3>دانه ریز (Fine)</h3>
          <p>دانه‌های ریز برای برش‌های دقیق و صاف مناسب هستند. این نوع دیسک‌ها برای کارهای ظریف و نهایی استفاده می‌شوند.</p>
          
          <h3>دانه متوسط (Medium)</h3>
          <p>دانه‌های متوسط تعادل خوبی بین سرعت و دقت دارند. برای اکثر کارهای روزمره مناسب هستند.</p>
          
          <h2>نکات مهم در انتخاب</h2>
          <ul>
            <li>نوع ماده مورد برش</li>
            <li>ضخامت ماده</li>
            <li>کیفیت مورد نیاز</li>
            <li>سرعت کار</li>
          </ul>
        `,
        categorySlug: 'tool-tutorials',
        featuredImage: '/api/uploads/products/1755654786294-6bwy3jmz85g.jpg',
        status: 'PUBLISHED' as const,
        publishedAt: new Date(),
        isFeatured: true,
        authorId: adminUser.id,
      },
      {
        title: 'تکنیک‌های پیشرفته نجاری',
        slug: 'advanced-woodworking-techniques',
        excerpt: 'آشنایی با تکنیک‌های پیشرفته نجاری که می‌تواند مهارت شما را به سطح حرفه‌ای ارتقا دهد.',
        content: `
          <h2>مقدمه</h2>
          <p>نجاری هنری است که نیاز به مهارت، صبر و استفاده صحیح از ابزارها دارد. در این مقاله با تکنیک‌های پیشرفته آشنا خواهید شد.</p>
          
          <h2>تکنیک اتصال دوبل</h2>
          <p>اتصال دوبل یکی از قوی‌ترین روش‌های اتصال در نجاری است. این تکنیک نیاز به دقت بالا و ابزارهای مناسب دارد.</p>
          
          <h2>نکات ایمنی</h2>
          <p>همیشه از تجهیزات ایمنی مناسب استفاده کنید. کلاه ایمنی، دستکش و عینک محافظ از ضروریات هستند.</p>
        `,
        categorySlug: 'woodworking-techniques',
        featuredImage: '/api/uploads/products/1755654786294-6bwy3jmz85g.jpg',
        status: 'PUBLISHED' as const,
        publishedAt: new Date(),
        isFeatured: true,
        authorId: adminUser.id,
      }
    ];

    for (const articleData of articles) {
      const { categorySlug, ...articleFields } = articleData;
      
      // Find content category by slug
      const contentCategory = createdContentCategories.find(cat => cat.slug === categorySlug);
      
      await prisma.article.create({
        data: {
          ...articleFields,
          categoryId: contentCategory?.id || null,
        },
      });
    }

    console.log('✅ Articles created:', articles.length);

    // Create Education Categories
    console.log('📚 Creating education categories...');
    
    const educationCategories = [
      {
        name: 'آموزش ابزارهای برش',
        slug: 'cutting-tools-education',
        description: 'آموزش‌های تخصصی برای استفاده صحیح از ابزارهای برش',
        icon: '🔪',
        image: '/api/uploads/products/1755653459043-ttnhnv7cwxi.jpg',
        sortOrder: 1,
        children: [
          {
            name: 'دیسک‌های الماسه',
            slug: 'diamond-discs-education',
            description: 'آموزش استفاده از دیسک‌های الماسه برای برش مواد سخت',
            icon: '💎',
            image: '/api/uploads/products/1755653459043-ttnhnv7cwxi.jpg',
            sortOrder: 1,
          },
          {
            name: 'تیغه‌های اره',
            slug: 'saw-blades-education',
            description: 'آموزش انتخاب و استفاده از تیغه‌های اره',
            icon: '🪚',
            image: '/api/uploads/products/1755653459043-ttnhnv7cwxi.jpg',
            sortOrder: 2,
          }
        ]
      },
      {
        name: 'آموزش نجاری',
        slug: 'woodworking-education',
        description: 'آموزش تکنیک‌های نجاری و کار با چوب',
        icon: '🪵',
        image: '/api/uploads/products/1755653459043-ttnhnv7cwxi.jpg',
        sortOrder: 2,
        children: [
          {
            name: 'تکنیک‌های اتصال',
            slug: 'joinery-techniques',
            description: 'آموزش روش‌های مختلف اتصال در نجاری',
            icon: '🔗',
            image: '/api/uploads/products/1755653459043-ttnhnv7cwxi.jpg',
            sortOrder: 1,
          },
          {
            name: 'پرداخت و رنگ‌آمیزی',
            slug: 'finishing-techniques',
            description: 'آموزش پرداخت و رنگ‌آمیزی چوب',
            icon: '🎨',
            image: '/api/uploads/products/1755653459043-ttnhnv7cwxi.jpg',
            sortOrder: 2,
          }
        ]
      },
      {
        name: 'ایمنی و نگهداری',
        slug: 'safety-maintenance',
        description: 'آموزش ایمنی در کار و نگهداری ابزارها',
        icon: '🛡️',
        image: '/api/uploads/products/1755653459043-ttnhnv7cwxi.jpg',
        sortOrder: 3,
        children: []
      }
    ];

    const createdEducationCategories: Array<{ id: string; slug: string }> = [];

    for (const mainCat of educationCategories) {
      const { children, ...mainCatData } = mainCat;
      
      const createdMainCat = await prisma.educationCategory.create({
        data: mainCatData,
      });
      createdEducationCategories.push(createdMainCat);

      for (const childCat of children) {
        const createdChildCat = await prisma.educationCategory.create({
          data: {
            ...childCat,
            parentId: createdMainCat.id,
          },
        });
        createdEducationCategories.push(createdChildCat);
      }
    }

    console.log('✅ Education categories created:', createdEducationCategories.length);

    // Create Education Lessons
    console.log('📖 Creating education lessons...');
    
    const educationLessons = [
      // TEXT-based lessons
      {
        title: 'راهنمای کامل استفاده از دیسک الماسه',
        slug: 'complete-guide-diamond-disc',
        excerpt: 'آموزش جامع استفاده صحیح از دیسک‌های الماسه برای برش مواد مختلف',
        content: `
          <h2>مقدمه</h2>
          <p>دیسک‌های الماسه یکی از مهم‌ترین ابزارهای برش در صنعت هستند. در این آموزش با نحوه استفاده صحیح از این ابزارها آشنا خواهید شد.</p>
          
          <h2>انتخاب دیسک مناسب</h2>
          <p>انتخاب دیسک الماسه مناسب بستگی به نوع ماده مورد برش دارد:</p>
          <ul>
            <li><strong>بتن و سنگ:</strong> از دیسک‌های با دانه‌بندی متوسط استفاده کنید</li>
            <li><strong>سرامیک و کاشی:</strong> دیسک‌های با دانه ریز مناسب‌تر هستند</li>
            <li><strong>فلزات:</strong> دیسک‌های مخصوص فلزات را انتخاب کنید</li>
          </ul>
          
          <h2>نحوه نصب</h2>
          <ol>
            <li>مطمئن شوید دستگاه خاموش است</li>
            <li>دیسک را روی محور قرار دهید</li>
            <li>فلنج را محکم کنید</li>
            <li>با آچار مخصوص پیچ را سفت کنید</li>
          </ol>
          
          <h2>نکات ایمنی</h2>
          <ul>
            <li>همیشه از عینک محافظ استفاده کنید</li>
            <li>دستکش مناسب بپوشید</li>
            <li>از ماسک گرد و غبار استفاده کنید</li>
            <li>محیط کار را تمیز نگه دارید</li>
          </ul>
          
          <h2>نگهداری</h2>
          <p>برای افزایش عمر دیسک الماسه:</p>
          <ul>
            <li>بعد از هر استفاده آن را تمیز کنید</li>
            <li>در جای خشک و خنک نگهداری کنید</li>
            <li>از ضربه زدن به دیسک خودداری کنید</li>
            <li>قبل از استفاده از سلامت آن اطمینان حاصل کنید</li>
          </ul>
        `,
        contentType: 'TEXT' as const,
        categorySlug: 'diamond-discs-education',
        difficulty: 'BEGINNER' as const,
        estimatedTime: 15,
        status: 'PUBLISHED' as const,
        publishedAt: new Date(),
        isFeatured: true,
        sortOrder: 1,
        authorId: adminUser.id,
        thumbnail: '/api/uploads/products/1765013721128-e0h57wtwvvv.jpg',
      },
      {
        title: 'تکنیک‌های پیشرفته اتصال در نجاری',
        slug: 'advanced-joinery-techniques',
        excerpt: 'آموزش تکنیک‌های پیشرفته اتصال چوب برای ساخت‌های حرفه‌ای',
        content: `
          <h2>مقدمه</h2>
          <p>اتصال‌های چوبی یکی از اساسی‌ترین مهارت‌های نجاری هستند. در این آموزش با تکنیک‌های پیشرفته آشنا می‌شوید.</p>
          
          <h2>اتصال دوبل (Mortise and Tenon)</h2>
          <p>این یکی از قوی‌ترین روش‌های اتصال است:</p>
          <ol>
            <li>سوراخ (mortise) را در قطعه اول ایجاد کنید</li>
            <li>زائده (tenon) را در قطعه دوم بسازید</li>
            <li>اندازه‌ها باید دقیقاً مطابقت داشته باشند</li>
            <li>با چسب چوب محکم کنید</li>
          </ol>
          
          <h2>اتصال داوود (Dovetail)</h2>
          <p>اتصال داوود برای کشوها و جعبه‌ها ایده‌آل است:</p>
          <ul>
            <li>نیاز به دقت بسیار بالا دارد</li>
            <li>از اره داوود استفاده کنید</li>
            <li>قبل از برش، خطوط را به دقت علامت‌گذاری کنید</li>
          </ul>
          
          <h2>نکات مهم</h2>
          <ul>
            <li>همیشه از چوب خشک استفاده کنید</li>
            <li>اندازه‌گیری دقیق کلید موفقیت است</li>
            <li>قبل از چسب‌کاری، قطعات را تست کنید</li>
          </ul>
        `,
        contentType: 'TEXT' as const,
        categorySlug: 'joinery-techniques',
        difficulty: 'ADVANCED' as const,
        estimatedTime: 45,
        status: 'PUBLISHED' as const,
        publishedAt: new Date(),
        isFeatured: true,
        sortOrder: 1,
        authorId: adminUser.id,
        thumbnail: '/api/uploads/products/1765013721128-e0h57wtwvvv.jpg',
      },
      // VIDEO-based lessons
      {
        title: 'ویدیو: آموزش استفاده از اره دستی',
        slug: 'video-hand-saw-tutorial',
        excerpt: 'ویدیو آموزشی کامل برای استفاده صحیح از اره دستی در نجاری',
        content: null,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Example YouTube embed URL
        videoDuration: 720, // 12 minutes in seconds
        contentType: 'VIDEO' as const,
        categorySlug: 'woodworking-education',
        difficulty: 'BEGINNER' as const,
        estimatedTime: 12,
        status: 'PUBLISHED' as const,
        publishedAt: new Date(),
        isFeatured: false,
        sortOrder: 1,
        authorId: adminUser.id,
        thumbnail: '/api/uploads/products/1765013721128-e0h57wtwvvv.jpg',
      },
      {
        title: 'ویدیو: تکنیک‌های برش با دیسک الماسه',
        slug: 'video-diamond-disc-cutting',
        excerpt: 'ویدیو آموزشی تکنیک‌های حرفه‌ای برش با دیسک الماسه',
        content: null,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        videoDuration: 900, // 15 minutes
        contentType: 'VIDEO' as const,
        categorySlug: 'diamond-discs-education',
        difficulty: 'INTERMEDIATE' as const,
        estimatedTime: 15,
        status: 'PUBLISHED' as const,
        publishedAt: new Date(),
        isFeatured: true,
        sortOrder: 2,
        authorId: adminUser.id,
        thumbnail: '/api/uploads/products/1765013721128-e0h57wtwvvv.jpg',
      },
      // MIXED content lessons
      {
        title: 'راهنمای کامل پرداخت چوب (ویدیو + متن)',
        slug: 'complete-wood-finishing-guide',
        excerpt: 'آموزش جامع پرداخت و رنگ‌آمیزی چوب با محتوای متنی و ویدیویی',
        content: `
          <h2>مقدمه</h2>
          <p>پرداخت چوب آخرین مرحله در ساخت یک پروژه نجاری است. این مرحله می‌تواند کیفیت نهایی کار را به شدت تحت تأثیر قرار دهد.</p>
          
          <h2>مراحل آماده‌سازی</h2>
          <ol>
            <li>سطح چوب را با کاغذ سنباده صاف کنید</li>
            <li>گرد و غبار را کاملاً پاک کنید</li>
            <li>اگر نیاز به پر کردن ترک‌ها دارید، این کار را انجام دهید</li>
            <li>سطح را با پارچه مرطوب تمیز کنید</li>
          </ol>
          
          <h2>انواع پرداخت</h2>
          <h3>روغن طبیعی</h3>
          <p>روغن طبیعی برای چوب‌های با بافت زیبا مناسب است. این روش بافت طبیعی چوب را حفظ می‌کند.</p>
          
          <h3>ورنی</h3>
          <p>ورنی محافظت بیشتری ایجاد می‌کند و برای سطوحی که استفاده زیادی دارند مناسب است.</p>
          
          <h3>رنگ</h3>
          <p>رنگ علاوه بر محافظت، ظاهر چوب را نیز تغییر می‌دهد.</p>
          
          <h2>نکات مهم</h2>
          <ul>
            <li>همیشه در محیط با تهویه مناسب کار کنید</li>
            <li>از برس‌های با کیفیت استفاده کنید</li>
            <li>لایه‌ها را نازک بزنید</li>
            <li>بین لایه‌ها زمان کافی برای خشک شدن بدهید</li>
          </ul>
        `,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        videoDuration: 600, // 10 minutes
        contentType: 'MIXED' as const,
        categorySlug: 'finishing-techniques',
        difficulty: 'INTERMEDIATE' as const,
        estimatedTime: 25,
        status: 'PUBLISHED' as const,
        publishedAt: new Date(),
        isFeatured: true,
        sortOrder: 1,
        authorId: adminUser.id,
        thumbnail: '/api/uploads/products/1765013721128-e0h57wtwvvv.jpg',
      },
      {
        title: 'ایمنی در کارگاه نجاری',
        slug: 'workshop-safety-guide',
        excerpt: 'راهنمای کامل ایمنی در کارگاه نجاری و استفاده از ابزارها',
        content: `
          <h2>مقدمه</h2>
          <p>ایمنی در کارگاه نجاری از اهمیت بالایی برخوردار است. رعایت نکات ایمنی می‌تواند از حوادث جدی جلوگیری کند.</p>
          
          <h2>تجهیزات حفاظت فردی</h2>
          <ul>
            <li><strong>عینک محافظ:</strong> همیشه هنگام کار با ابزارهای برش استفاده کنید</li>
            <li><strong>دستکش:</strong> برای محافظت از دست‌ها در برابر بریدگی</li>
            <li><strong>ماسک:</strong> برای جلوگیری از استنشاق گرد و غبار</li>
            <li><strong>گوشی محافظ:</strong> هنگام استفاده از ابزارهای پر سر و صدا</li>
            <li><strong>کفش ایمنی:</strong> برای محافظت از پاها</li>
          </ul>
          
          <h2>ایمنی ابزارها</h2>
          <ul>
            <li>همیشه قبل از استفاده از سلامت ابزار اطمینان حاصل کنید</li>
            <li>از ابزارهای تیز و تمیز استفاده کنید</li>
            <li>ابزارها را بعد از استفاده تمیز و در جای مناسب نگهداری کنید</li>
            <li>از استفاده از ابزارهای معیوب خودداری کنید</li>
          </ul>
          
          <h2>ایمنی محیط کار</h2>
          <ul>
            <li>کارگاه را تمیز و مرتب نگه دارید</li>
            <li>از روشنایی کافی اطمینان حاصل کنید</li>
            <li>کابل‌های برق را از مسیر عبور و مرور دور نگه دارید</li>
            <li>مواد قابل اشتعال را در جای مناسب نگهداری کنید</li>
          </ul>
          
          <h2>در صورت بروز حادثه</h2>
          <ol>
            <li>آرامش خود را حفظ کنید</li>
            <li>در صورت نیاز کمک بخواهید</li>
            <li>کیت کمک‌های اولیه را در دسترس داشته باشید</li>
            <li>شماره‌های اضطراری را بدانید</li>
          </ol>
        `,
        contentType: 'TEXT' as const,
        categorySlug: 'safety-maintenance',
        difficulty: 'BEGINNER' as const,
        estimatedTime: 20,
        status: 'PUBLISHED' as const,
        publishedAt: new Date(),
        isFeatured: false,
        sortOrder: 1,
        authorId: adminUser.id,
        thumbnail: '/api/uploads/products/1765013721128-e0h57wtwvvv.jpg',
      },
      {
        title: 'نگهداری و تعمیر ابزارهای برش',
        slug: 'cutting-tools-maintenance',
        excerpt: 'آموزش نگهداری صحیح ابزارهای برش برای افزایش عمر مفید آنها',
        content: `
          <h2>مقدمه</h2>
          <p>نگهداری صحیح ابزارهای برش می‌تواند عمر مفید آنها را به شدت افزایش دهد و کیفیت کار را بهبود بخشد.</p>
          
          <h2>تمیز کردن</h2>
          <p>بعد از هر استفاده:</p>
          <ol>
            <li>گرد و غبار و باقیمانده مواد را پاک کنید</li>
            <li>با پارچه مرطوب سطح را تمیز کنید</li>
            <li>برای جلوگیری از زنگ زدگی، سطح را خشک کنید</li>
            <li>در صورت نیاز از روغن محافظ استفاده کنید</li>
          </ol>
          
          <h2>تیز کردن</h2>
          <p>ابزارهای برش باید همیشه تیز باشند:</p>
          <ul>
            <li>از سنگ تیزکنی مناسب استفاده کنید</li>
            <li>زاویه تیزی را حفظ کنید</li>
            <li>به صورت منظم تیز کنید</li>
          </ul>
          
          <h2>نگهداری</h2>
          <ul>
            <li>در جای خشک و خنک نگهداری کنید</li>
            <li>از ضربه زدن خودداری کنید</li>
            <li>از تماس با مواد خورنده جلوگیری کنید</li>
            <li>به صورت دوره‌ای بازرسی کنید</li>
          </ul>
        `,
        contentType: 'TEXT' as const,
        categorySlug: 'safety-maintenance',
        difficulty: 'INTERMEDIATE' as const,
        estimatedTime: 18,
        status: 'PUBLISHED' as const,
        publishedAt: new Date(),
        isFeatured: false,
        sortOrder: 2,
        authorId: adminUser.id,
        thumbnail: '/api/uploads/products/1765013721128-e0h57wtwvvv.jpg',
      },
      {
        title: 'ویدیو: تکنیک‌های پیشرفته برش زاویه‌دار',
        slug: 'video-advanced-angle-cutting',
        excerpt: 'ویدیو آموزشی تکنیک‌های پیشرفته برش زاویه‌دار در نجاری',
        content: null,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        videoDuration: 1080, // 18 minutes
        contentType: 'VIDEO' as const,
        categorySlug: 'woodworking-education',
        difficulty: 'ADVANCED' as const,
        estimatedTime: 18,
        status: 'PUBLISHED' as const,
        publishedAt: new Date(),
        isFeatured: false,
        sortOrder: 2,
        authorId: adminUser.id,
        thumbnail: '/api/uploads/products/1765013721128-e0h57wtwvvv.jpg',
      },
      {
        title: 'راهنمای انتخاب تیغه اره مناسب',
        slug: 'saw-blade-selection-guide',
        excerpt: 'آموزش انتخاب تیغه اره مناسب برای انواع کارهای برش',
        content: `
          <h2>مقدمه</h2>
          <p>انتخاب تیغه اره مناسب می‌تواند تفاوت زیادی در کیفیت و سرعت کار ایجاد کند.</p>
          
          <h2>انواع تیغه اره</h2>
          <h3>تیغه اره چوب</h3>
          <p>برای برش چوب و مواد چوبی طراحی شده است. دارای دندانه‌های بزرگ و فاصله‌دار است.</p>
          
          <h3>تیغه اره فلز</h3>
          <p>برای برش فلزات استفاده می‌شود. دندانه‌های ریز و محکم دارد.</p>
          
          <h3>تیغه اره الماسه</h3>
          <p>برای برش مواد سخت مانند بتن و سنگ مناسب است.</p>
          
          <h2>عوامل انتخاب</h2>
          <ul>
            <li>نوع ماده مورد برش</li>
            <li>ضخامت ماده</li>
            <li>کیفیت برش مورد نیاز</li>
            <li>سرعت کار</li>
          </ul>
          
          <h2>نکات مهم</h2>
          <ul>
            <li>همیشه از تیغه مناسب برای ماده استفاده کنید</li>
            <li>تیغه را به درستی نصب کنید</li>
            <li>از تیغه‌های تیز استفاده کنید</li>
            <li>تیغه را به صورت منظم تمیز کنید</li>
          </ul>
        `,
        contentType: 'TEXT' as const,
        categorySlug: 'saw-blades-education',
        difficulty: 'BEGINNER' as const,
        estimatedTime: 12,
        status: 'PUBLISHED' as const,
        publishedAt: new Date(),
        isFeatured: false,
        sortOrder: 1,
        authorId: adminUser.id,
        thumbnail: '/api/uploads/products/1765013721128-e0h57wtwvvv.jpg',
      },
      // Draft lesson (not published)
      {
        title: 'تکنیک‌های حرفه‌ای ساخت مبلمان (در حال تکمیل)',
        slug: 'professional-furniture-making',
        excerpt: 'این درس در حال تکمیل است و به زودی منتشر خواهد شد',
        content: `
          <h2>این درس در حال تکمیل است</h2>
          <p>محتوای کامل به زودی اضافه خواهد شد.</p>
        `,
        contentType: 'TEXT' as const,
        categorySlug: 'woodworking-education',
        difficulty: 'EXPERT' as const,
        estimatedTime: 60,
        status: 'DRAFT' as const,
        publishedAt: null,
        isFeatured: false,
        sortOrder: 3,
        authorId: adminUser.id,
        thumbnail: null,
      }
    ];

    for (const lessonData of educationLessons) {
      const { categorySlug, ...lessonFields } = lessonData;
      
      // Find education category by slug
      const educationCategory = createdEducationCategories.find(cat => cat.slug === categorySlug);
      
      await prisma.educationLesson.create({
        data: {
          ...lessonFields,
          categoryId: educationCategory?.id || null,
        },
      });
    }

    console.log('✅ Education lessons created:', educationLessons.length);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Users: 2 (Admin + Test User)`);
    console.log(`- Product Categories: ${createdCategories.length}`);
    console.log(`- Content Categories: ${createdContentCategories.length}`);
    console.log(`- Education Categories: ${createdEducationCategories.length}`);
    console.log(`- Products: ${products.length}`);
    console.log(`- Articles: ${articles.length}`);
    console.log(`- Education Lessons: ${educationLessons.length}`);
    
    console.log('\n🔑 Admin Account Credentials:');
    console.log('Email: admin@hs6tools.com');
    console.log('Password: Admin123!');
    console.log('Role: SUPER_ADMIN');
    
    console.log('\n👤 Test User Account Credentials:');
    console.log('Email: user@hs6tools.com');
    console.log('Password: User123!');
    console.log('Role: CUSTOMER');
    
    console.log('\n🌐 You can now test the platform with real data!');
    console.log('🚀 Admin Panel: https://hs6tools.com/fa/admin');
    console.log('🏪 Main Store: https://hs6tools.com/fa');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
