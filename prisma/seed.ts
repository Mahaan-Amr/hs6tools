import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
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
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  
  // Clear System Settings data
  await prisma.paymentSettings.deleteMany();
  await prisma.emailSettings.deleteMany();
  await prisma.systemSettings.deleteMany();

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

  // Create System Settings
  console.log('⚙️ Creating system settings...');
  
  await prisma.systemSettings.create({
    data: {
      siteName: 'HS6Tools',
      siteDescription: 'پلتفرم جامع ابزارهای صنعتی و حرفه‌ای',
      siteUrl: 'http://localhost:3000',
      contactEmail: 'support@hs6tools.com',
      contactPhone: '+98-21-12345678',
      businessAddress: 'تهران، خیابان ولیعصر، پلاک 123',
      currency: 'IRR',
      language: 'fa',
      timezone: 'Asia/Tehran',
      maintenanceMode: false,
      allowRegistration: true,
      requireEmailVerification: false,
      requirePhoneVerification: false,
    },
  });

  await prisma.emailSettings.create({
    data: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: 'noreply@hs6tools.com',
      smtpPassword: 'your-email-password-here',
      fromEmail: 'noreply@hs6tools.com',
      fromName: 'HS6Tools',
      enableSSL: true,
      isActive: false,
    },
  });

  await prisma.paymentSettings.create({
    data: {
      zarinpalMerchantId: 'your-merchant-id-here',
      zarinpalApiKey: 'your-api-key-here',
      zarinpalSandbox: true,
      allowBankTransfer: true,
      allowCashOnDelivery: true,
      minimumOrderAmount: 100000, // 100,000 IRR
      maximumOrderAmount: 1000000000, // 1,000,000,000 IRR
    },
  });

  console.log('✅ System settings created successfully');

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
      image: 'https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?w=400&h=300&fit=crop',
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
          image: 'https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?w=400&h=300&fit=crop',
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
          image: 'https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?w=400&h=300&fit=crop',
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
      image: 'https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?w=400&h=300&fit=crop',
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
          image: 'https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?w=400&h=300&fit=crop',
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
      image: 'https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?w=400&h=300&fit=crop',
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
          image: 'https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?w=400&h=300&fit=crop',
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

  // Create Content Categories for Blog
  console.log('📝 Creating content categories...');
  
  const contentCategories = [
    {
      name: 'آموزش ابزارها',
      slug: 'tool-tutorials',
      description: 'آموزش استفاده صحیح از ابزارهای صنعتی',
      image: 'https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?w=400&h=300&fit=crop',
    },
    {
      name: 'تکنیک‌های نجاری',
      slug: 'woodworking-techniques',
      description: 'تکنیک‌های پیشرفته نجاری و کار با چوب',
      image: 'https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?w=400&h=300&fit=crop',
    },
    {
      name: 'ایمنی کار',
      slug: 'workplace-safety',
      description: 'راهنمای ایمنی در محیط کار',
      image: 'https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?w=400&h=300&fit=crop',
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
        'https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?w=400&h=400&fit=crop',
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
        'https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?w=400&h=400&fit=crop',
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
        'https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?w=400&h=400&fit=crop',
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

  // Create Sample Orders for Testing
  console.log('📦 Creating sample orders...');
  
  const orders = [
    {
      orderNumber: 'ORD-2024-001',
      status: 'CONFIRMED' as const,
      paymentStatus: 'PAID' as const,
      paymentMethod: 'ZARINPAL' as const,
      shippingMethod: 'TIPAX' as const,
      subtotal: 730000,
      taxAmount: 73000,
      totalAmount: 853000,
      customerEmail: 'user@hs6tools.com',
      customerPhone: '+989123456788',
      billingAddress: {
        title: 'آدرس صورتحساب',
        firstName: 'کاربر',
        lastName: 'تست',
        company: 'شرکت تست',
        addressLine1: 'تهران، خیابان ولیعصر',
        addressLine2: 'پلاک 456',
        city: 'تهران',
        state: 'تهران',
        postalCode: '12345-67890',
        country: 'ایران',
        phone: '+989123456788',
        type: 'BILLING' as const,
      },
      shippingAddress: {
        title: 'آدرس ارسال',
        firstName: 'کاربر',
        lastName: 'تست',
        company: 'شرکت تست',
        addressLine1: 'تهران، خیابان ولیعصر',
        addressLine2: 'پلاک 456',
        city: 'تهران',
        state: 'تهران',
        postalCode: '12345-67890',
        country: 'ایران',
        phone: '+989123456788',
        type: 'SHIPPING' as const,
      },
      items: [
        {
          productId: '', // Will be filled after product creation
          variantId: '', // Will be filled after product creation
          quantity: 1,
          unitPrice: 450000,
          totalPrice: 450000,
        },
        {
          productId: '', // Will be filled after product creation
          variantId: '', // Will be filled after product creation
          quantity: 1,
          unitPrice: 280000,
          totalPrice: 280000,
        }
      ]
    }
  ];

  // Create addresses and orders
  for (const orderData of orders) {
    const { billingAddress, shippingAddress, items, ...orderFields } = orderData;
    
    // Create billing address
    const billingAddr = await prisma.address.create({
      data: {
        ...billingAddress,
        userId: testUser.id,
      },
    });

    // Create shipping address
    const shippingAddr = await prisma.address.create({
      data: {
        ...shippingAddress,
        userId: testUser.id,
      },
    });

    // Create order
    const order = await prisma.order.create({
      data: {
        ...orderFields,
        userId: testUser.id, // Ensure userId is set correctly
        billingAddressId: billingAddr.id,
        shippingAddressId: shippingAddr.id,
        shippingAmount: 50000,
        discountAmount: 0,
      },
    });

    // Create order items (using first product and variant for simplicity)
    const firstProduct = await prisma.product.findFirst();
    const firstVariant = await prisma.productVariant.findFirst();
    const firstProductImage = await prisma.productImage.findFirst({
      where: { productId: firstProduct?.id, isPrimary: true }
    });
    
    if (firstProduct && firstVariant) {
      for (const itemData of items) {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: firstProduct.id,
            variantId: firstVariant.id,
            sku: firstProduct.sku,
            name: firstProduct.name,
            description: firstProduct.shortDescription || '',
            image: firstProductImage?.url || '',
            quantity: itemData.quantity,
            unitPrice: itemData.unitPrice,
            totalPrice: itemData.totalPrice,
          },
        });
      }
    }
  }

  console.log('✅ Sample orders created');

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
      featuredImage: 'https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?w=800&h=400&fit=crop',
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
      featuredImage: 'https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?w=800&h=400&fit=crop',
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

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`- Users: 2 (Admin + Test User)`);
  console.log(`- System Settings: 3 (System, Email, Payment)`);
  console.log(`- Product Categories: ${createdCategories.length}`);
  console.log(`- Content Categories: ${createdContentCategories.length}`);
  console.log(`- Products: ${products.length}`);
  console.log(`- Articles: ${articles.length}`);
  console.log(`- Sample Orders: ${orders.length}`);
  
  console.log('\n🔑 Admin Account Credentials:');
  console.log('Email: admin@hs6tools.com');
  console.log('Password: Admin123!');
  console.log('Role: SUPER_ADMIN');
  
  console.log('\n👤 Test User Account Credentials:');
  console.log('Email: user@hs6tools.com');
  console.log('Password: User123!');
  console.log('Role: CUSTOMER');
  
  console.log('\n🌐 You can now test the platform with real data!');
  console.log('🚀 Admin Panel: http://localhost:3000/fa/admin');
  console.log('🏪 Main Store: http://localhost:3000/fa');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
