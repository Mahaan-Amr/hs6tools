export const locales = ["fa", "en", "ar"] as const;
export const defaultLocale = "fa" as const;

export type Locale = (typeof locales)[number];

export interface HomepageMessages {
  hero: {
    tagline: string;
    description: string;
    viewProducts: string;
    aboutUs: string;
  };
  features: {
    title: string;
    subtitle: string;
    quality: {
      title: string;
      description: string;
    };
    technology: {
      title: string;
      description: string;
    };
    support: {
      title: string;
      description: string;
    };
  };
  categories: {
    title: string;
    subtitle: string;
    diamondDiscs: {
      title: string;
      description: string;
    };
    cylindricalCutters: {
      title: string;
      description: string;
    };
    holdingClamps: {
      title: string;
      description: string;
    };
    viewAllProducts: string;
  };
}

export interface Messages {
  common: {
    loading: string;
    saving: string;
    saveChanges: string;
    cancel: string;
    edit: string;
    delete: string;
    logout: string;
    locale: string;
    back: string;
    filter: string;
    search: string;
    reset: string;
    [key: string]: string;
  };
  navigation: Record<string, string>;
  auth: {
    login: string;
    register: string;
    logout: string;
    email: string;
    password: string;
    confirmPassword: string;
    forgotPassword: string;
    resetPassword: string;
    loginSuccess: string;
    registerSuccess: string;
    invalidCredentials: string;
    firstName: string;
    lastName: string;
    phone: string;
    company: string;
    position: string;
    welcomeBack: string;
    createAccount: string;
    dontHaveAccount: string;
    alreadyHaveAccount: string;
    signUp: string;
    signIn: string;
    loggingIn: string;
    creatingAccount: string;
    verifyPhoneNumber: string;
    enterVerificationCode: string;
    verificationCode: string;
    verificationCodeSent: string;
    enterCodeSentTo: string;
    enter6DigitCode: string;
    resendCode: string;
    resendCodeIn: string;
    sending: string;
    verifying: string;
    verifyPhoneNumberButton: string;
    skipVerification: string;
    phoneVerified: string;
    resetPasswordTitle: string;
    enterPhoneForReset: string;
    sendResetCode: string;
    sendingCode: string;
    resetCodeSent: string;
    redirecting: string;
    enterCodeAndNewPassword: string;
    newPassword: string;
    confirmNewPassword: string;
    passwordMustBe8Chars: string;
    passwordsDontMatch: string;
    allFieldsRequired: string;
    invalidPhoneFormat: string;
    invalidCodeFormat: string;
    passwordResetSuccess: string;
    backToLogin: string;
    resendCodeLink: string;
    invalidEmail: string;
    passwordRequired: string;
    firstNameRequired: string;
    lastNameRequired: string;
    passwordTooShort: string;
    [key: string]: unknown;
  };
  categories: {
    pageTitle: string;
    pageSubtitle: string;
    parentCategories: string;
    subcategories: string;
    noCategoriesFound: string;
    noCategoriesMessage: string;
    products: string;
    subcategoriesCount: string;
    viewCategory: string;
    parentCategory: string;
    [key: string]: unknown;
  };
  products: {
    addToCart: string;
    addingToCart: string;
    addToWishlist: string;
    removeFromWishlist: string;
    outOfStock: string;
    inStock: string;
    featured: string;
    viewDetails: string;
    errorLoading: string;
    retry: string;
    noProductsFound: string;
    noProductsMessage: string;
    sku: string;
    price: string;
    stock: string;
    stockAvailable: string;
    attributes: {
      color: string;
      size: string;
      material: string;
      weight: string;
      dimension: string;
    };
    shopTitle: string;
    shopSubtitle: string;
    viewProducts: string;
    diamondDiscs: string;
    diamondDiscsDesc: string;
    cylindricalCutters: string;
    cylindricalCuttersDesc: string;
    holdingClamps: string;
    holdingClampsDesc: string;
    latestProducts: string;
    loadMoreProducts: string;
    categories: string;
    selectVariant: string;
    discount: string;
    discountPercent: string;
    stockCount: string;
    productSpecs: string;
    brand: string;
    material: string;
    weight: string;
    weightUnit: string;
    warranty: string;
    productDescription: string;
    reviews: string;
    relatedProducts: string;
    [key: string]: unknown;
  };
  cart: {
    title: string;
    empty: string;
    emptyTitle: string;
    emptyMessage: string;
    items: string;
    itemsInCart: string;
    subtotal: string;
    shipping: string;
    tax: string;
    total: string;
    totalLabel: string;
    checkout: string;
    viewCart: string;
    continueShopping: string;
    removeItem: string;
    updateQuantity: string;
    pageTitle: string;
    itemsInYourCart: string;
    selectedProducts: string;
    clearCart: string;
    clearCartConfirm: string;
    delete: string;
    needMoreProducts: string;
    orderSummary: string;
    productCount: string;
    totalItemsCount: string;
    shippingInfo: string;
    shippingInfoText1: string;
    shippingInfoText2: string;
    shippingInfoText3: string;
    securePayment: string;
    viewProducts: string;
    categories: string;
    [key: string]: unknown;
  };
  checkout?: {
    billingAddress?: string;
    shippingAddress?: string;
    paymentMethod?: string;
    orderSummary?: string;
    placeOrder?: string;
    emptyCartTitle?: string;
    emptyCartMessage?: string;
    viewProducts?: string;
    checkoutTitle?: string;
    checkoutSubtitle?: string;
    step1Label?: string;
    step2Label?: string;
    step3Label?: string;
    shippingInfo?: string;
    enterNewAddress?: string;
    selectSavedAddress?: string;
    firstName?: string;
    firstNamePlaceholder?: string;
    lastName?: string;
    lastNamePlaceholder?: string;
    phone?: string;
    phonePlaceholder?: string;
    postalCode?: string;
    postalCodePlaceholder?: string;
    postalCodeLabel?: string;
    province?: string;
    provincePlaceholder?: string;
    city?: string;
    cityPlaceholder?: string;
    fullAddress?: string;
    fullAddressPlaceholder?: string;
    selectShippingMethod?: string;
    deliveryTime?: string;
    orderReview?: string;
    shippingInfoLabel?: string;
    shippingMethodLabel?: string;
    shippingCost?: string;
    orderItems?: string;
    processing?: string;
    couponCode?: string;
    couponPlaceholder?: string;
    apply?: string;
    remove?: string;
    discountApplied?: string;
    subtotal?: string;
    shippingCostLabel?: string;
    tax?: string;
    discount?: string;
    total?: string;
    securePayment?: string;
    termsAcceptance?: string;
    selectBillingShipping?: string;
    completeAddressFields?: string;
    enterCouponCode?: string;
    invalidCoupon?: string;
    couponValidationError?: string;
    orderError?: string;
    userAccountNotFound?: string;
    tryAgain?: string;
    previousStep?: string;
    nextStep?: string;
    shippingMethods?: {
      post?: {
        name?: string;
        description?: string;
        estimatedDays?: string;
      };
      tipax?: {
        name?: string;
        description?: string;
        estimatedDays?: string;
      };
    };
    [key: string]: unknown;
  };
  footer: {
    company: string;
    support: string;
    legal: string;
    social: string;
    newsletter: string;
    subscribe: string;
    privacyPolicy: string;
    termsOfService: string;
    companyDescription: string;
    faq: string;
    copyright: string;
    [key: string]: string;
  };
  faq: {
    knowledgeBase: string;
    fullCoverage: string;
    threeMainSections: string;
    updatedAnswers: string;
    twelveMonthWarranty: string;
    quickSupport: string;
    responseUnder24Hours: string;
    updatedDescription: string;
    [key: string]: string;
  };
  education?: {
    title: string;
    subtitle: string;
    loading: string;
    allCategories: string;
    contentTypeLabel: string;
    allTypes: string;
    contentTypes: {
      text: string;
      video: string;
      mixed: string;
      [key: string]: unknown;
    };
    difficultyLabel: string;
    allLevels: string;
    difficulty: {
      beginner: string;
      intermediate: string;
      advanced: string;
      expert: string;
      [key: string]: unknown;
    };
    featured: string;
    minutes: string;
    views: string;
    noLessonsFound: string;
    noLessonsMessage: string;
    breadcrumbs: {
      home: string;
      education: string;
      [key: string]: unknown;
    };
    lesson: {
      unknownAuthor: string;
      level: string;
      lessonInfo: string;
      contentType: string;
      levelLabel: string;
      duration: string;
      estimatedTime: string;
      viewsLabel: string;
      relatedLessons: string;
      browserNotSupported: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  admin: {
    dashboard: string;
    products: string;
    orders: string;
    customers: string;
    content: string;
    analytics: string;
    settings: string;
    users: string;
    categories: string;
    productsForm?: {
      skuRequired: string;
      nameRequired: string;
      slugRequired: string;
      priceRequired: string;
      stockRequired: string;
      categoryRequired: string;
      imagesRequired: string;
      basicInfo: string;
      sku: string;
      productName: string;
      slug: string;
      category: string;
      selectCategory: string;
      price: string;
      comparePrice: string;
      stock: string;
      lowStockThreshold: string;
      shortDescription: string;
      description: string;
      productImages: string;
      imagesRequiredMessage: string;
      translations: string;
      show: string;
      hide: string;
      english: string;
      arabic: string;
      nameEn: string;
      shortDescriptionEn: string;
      descriptionEn: string;
      nameAr: string;
      shortDescriptionAr: string;
      descriptionAr: string;
      advancedSettings: string;
      costPrice: string;
      weight: string;
      material: string;
      brand: string;
      warranty: string;
      cancel: string;
      saving: string;
      update: string;
      create: string;
      [key: string]: unknown;
    };
    categoriesForm?: {
      nameRequired: string;
      slugRequired: string;
      basicInfo: string;
      categoryName: string;
      slug: string;
      parentCategory: string;
      noParent: string;
      sortOrder: string;
      description: string;
      translations: string;
      show: string;
      hide: string;
      english: string;
      arabic: string;
      nameEn: string;
      descriptionEn: string;
      nameAr: string;
      descriptionAr: string;
      mediaSeo: string;
      image: string;
      icon: string;
      metaTitle: string;
      metaDescription: string;
      metaKeywords: string;
      status: string;
      active: string;
      cancel: string;
      saving: string;
      update: string;
      create: string;
      [key: string]: unknown;
    };
    quickActions?: {
      title: string;
      getStarted: string;
      quickStats: string;
      newOrders: string;
      lowStockProducts: string;
      newReviews: string;
      newMessages: string;
      addProductDesc: string;
      manageCategoriesDesc: string;
      manageUsersDesc: string;
      viewAnalyticsDesc: string;
      manageContentDesc: string;
      systemSettingsDesc: string;
      [key: string]: unknown;
    };
    dashboardStats?: {
      todayOrders: string;
      activeProducts: string;
      registeredUsers: string;
      monthlyRevenue: string;
      fromLastMonth: string;
      [key: string]: unknown;
    };
    dashboardPage?: {
      title: string;
      subtitle: string;
      systemStatus: string;
      server: string;
      online: string;
      database: string;
      authentication: string;
      platform: string;
      performanceMetrics: string;
      pageLoadSpeed: string;
      coreWebVitals: string;
      seoScore: string;
      recentActivity: string;
      systemStarted: string;
      platformReady: string;
      databaseConnected: string;
      postgresqlWithPrisma: string;
      authenticationActive: string;
      nextAuthWithJWT: string;
      platformReadyText: string;
      nextjsWithRouter: string;
      always: string;
      [key: string]: unknown;
    };
    usersPage?: {
      title: string;
      subtitle: string;
      [key: string]: unknown;
    };
    ordersPage?: {
      title: string;
      subtitle: string;
      [key: string]: unknown;
    };
    ordersForm?: {
      trackingRequired: string;
      shippedFirst: string;
      deliveredBeforeShipped: string;
      editOrder: string;
      orderInfo: string;
      orderNumber: string;
      createdAt: string;
      totalAmount: string;
      itemCount: string;
      items: string;
      customerInfo: string;
      fullName: string;
      email: string;
      phone: string;
      customerNote: string;
      orderItems: string;
      variant: string;
      quantity: string;
      unitPrice: string;
      orderManagement: string;
      orderStatus: string;
      paymentStatus: string;
      trackingNumber: string;
      trackingPlaceholder: string;
      shippedAt: string;
      deliveredAt: string;
      cancel: string;
      saving: string;
      update: string;
      statusPending: string;
      statusConfirmed: string;
      statusProcessing: string;
      statusShipped: string;
      statusDelivered: string;
      statusCancelled: string;
      statusRefunded: string;
      paymentPending: string;
      paymentPaid: string;
      paymentFailed: string;
      paymentRefunded: string;
      paymentPartiallyRefunded: string;
      [key: string]: unknown;
    };
    usersForm?: {
      emailRequired: string;
      emailInvalid: string;
      passwordRequired: string;
      passwordMinLength: string;
      phoneInvalid: string;
      firstNameRequired: string;
      lastNameRequired: string;
      editUser: string;
      createUser: string;
      basicInfo: string;
      firstName: string;
      firstNamePlaceholder: string;
      lastName: string;
      lastNamePlaceholder: string;
      email: string;
      emailPlaceholder: string;
      phone: string;
      phonePlaceholder: string;
      accountSettings: string;
      role: string;
      roleCustomer: string;
      roleAdmin: string;
      roleSuperAdmin: string;
      password: string;
      passwordPlaceholder: string;
      companyInfo: string;
      company: string;
      companyPlaceholder: string;
      position: string;
      positionPlaceholder: string;
      cancel: string;
      saving: string;
      update: string;
      create: string;
      [key: string]: unknown;
    };
    recentOrders?: {
      title: string;
      viewAll: string;
      noOrders: string;
      unknown: string;
      daysAgo: string;
      hoursAgo: string;
      minutesAgo: string;
      justNow: string;
      statusPending: string;
      statusProcessing: string;
      statusShipped: string;
      statusDelivered: string;
      statusCancelled: string;
      [key: string]: unknown;
    };
    analyticsPage?: Record<string, unknown>;
    analyticsPageHeader?: {
      title: string;
      subtitle: string;
      [key: string]: unknown;
    };
    settingsPage?: Record<string, unknown>;
    settingsPageHeader?: {
      title: string;
      subtitle: string;
      [key: string]: unknown;
    };
    contentPage?: {
      title: string;
      subtitle: string;
      [key: string]: unknown;
    };
    customersPage?: {
      title: string;
      subtitle: string;
      totalCustomers: string;
      showing: string;
      [key: string]: unknown;
    };
    customer360Page?: {
      title: string;
      subtitle: string;
      editCustomer: string;
      backToCustomers: string;
      [key: string]: unknown;
    };
    crm?: {
      title: string;
      customers: string;
      leadsLabel: string;
      quotesLabel: string;
      lifecycle: string;
      customerManagement: string;
      customerLifecycle: string;
      leadManagement: string;
      quotesManagement: string;
      customer360: {
        title: string;
        loading: string;
        error: string;
        customerNotFound: string;
        retry: string;
        healthScore: string;
        tier: string;
        stage: string;
        totalSpent: string;
        totalOrders: string;
        averageOrderValue: string;
        lastOrder: string;
        daysAgo: string;
        never: string;
        overviewTab: string;
        ordersTab: string;
        interactionsTab: string;
        quotesTab: string;
        activityTab: string;
        customerInfo: string;
        customerType: string;
        industry: string;
        companySize: string;
        leadSource: string;
        salesRep: string;
        unassigned: string;
        memberSince: string;
        lastLogin: string;
        tags: string;
        notes: string;
        recentActivity: string;
        recentOrders: string;
        recentInteractions: string;
        recentReviews: string;
        recentWishlist: string;
        topCategories: string;
        noOrders: string;
        noInteractions: string;
        noQuotes: string;
        addInteraction: string;
        orderNumber: string;
        quoteNumber: string;
        validUntil: string;
        unknown: string;
        interactionType: string;
        interactionSubject: string;
        interactionContent: string;
        activityTimelineComingSoon: string;
        averageOrder: string;
        [key: string]: unknown;
      };
      leads?: {
        title: string;
        createLead: string;
        editLead: string;
        leadDetails: string;
        personalInfo: string;
        companyInfo: string;
        leadInfo: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        company: string;
        position: string;
        industry: string;
        companySize: string;
        source: string;
        status: string;
        assignedTo: string;
        nextFollowUp: string;
        tags: string;
        notes: string;
        selectCompanySize: string;
        startup: string;
        small: string;
        medium: string;
        large: string;
        enterprise: string;
        sourceOptions: {
          website: string;
          referral: string;
          socialMedia: string;
          email: string;
          tradeShow: string;
          phone: string;
          partner: string;
          advertising: string;
          other: string;
        };
        statusOptions: {
          new: string;
          contacted: string;
          qualified: string;
          converted: string;
          lost: string;
        };
        tagsPlaceholder: string;
        notesPlaceholder: string;
        positionPlaceholder: string;
        assignedToPlaceholder: string;
        firstNameRequired: string;
        lastNameRequired: string;
        emailRequired: string;
        emailInvalid: string;
        phoneInvalid: string;
        cancel: string;
        save: string;
        saving: string;
        update: string;
        create: string;
        showLeads?: string;
        selectedCount?: string;
        deleteSelected?: string;
        page?: string;
        metrics?: {
          total?: string;
          new?: string;
          contacted?: string;
          qualified?: string;
          converted?: string;
          lost?: string;
          [key: string]: string | undefined;
        };
        [key: string]: unknown;
      };
      quotes: {
        title: string;
        createQuote: string;
        editQuote: string;
        quoteNumber: string;
        customer: string;
        status: string;
        totalAmount: string;
        validUntil: string;
        actions: string;
        baseInfo: string;
        selectCustomer: string;
        loadingCustomers: string;
        quoteItems: string;
        addProduct: string;
        noProducts: string;
        priceSummary: string;
        subtotal: string;
        tax: string;
        total: string;
        additionalSettings: string;
        validUntilLabel: string;
        statusLabel: string;
        statusOptions: {
          draft: string;
          sent: string;
          viewed: string;
          accepted: string;
          rejected: string;
          expired: string;
        };
        productSelector: {
          title: string;
          loading: string;
          sku: string;
          price: string;
          inStock: string;
          outOfStock: string;
        };
        showQuotes?: string;
        selectedCount?: string;
        deleteSelected?: string;
        cancel: string;
        save: string;
        saving: string;
        update: string;
        create: string;
        loading: string;
        error: string;
        createError: string;
        updateError: string;
        deleteError?: string;
        searchQuotes?: string;
        allStatuses?: string;
        allCustomers?: string;
        resetFilters?: string;
        viewDetails?: string;
        sendQuote?: string;
        convertQuote?: string;
        page?: string;
        of?: string;
        metrics?: {
          total?: string;
          totalValue?: string;
          conversionRate?: string;
        };
        [key: string]: unknown;
      };
      adminLayout: {
        title: string;
        menu: string;
        dashboard: string;
        products: string;
        categories: string;
        orders: string;
        users: string;
        content: string;
        analytics: string;
        customerManagement: string;
        customerLifecycle: string;
        leadManagement: string;
        quotes: string;
        settings: string;
        backToSite: string;
        logout: string;
        openMenu: string;
        closeMenu: string;
        toggleMenu?: string;
        showMenu?: string;
        superAdmin: string;
        admin: string;
        [key: string]: unknown;
      };
    };
  };
  homepage: HomepageMessages;
  search: Record<string, string>;
  reviews: {
    title: string;
    outOf: string;
    review: string;
    reviews: string;
    writeReview: string;
    cancel: string;
    writeReviewTitle: string;
    reviewTitle: string;
    reviewTitlePlaceholder: string;
    rating: string;
    reviewContent: string;
    reviewContentPlaceholder: string;
    submitting: string;
    submitReview: string;
    noReviewsYet: string;
    beFirstToReview: string;
    [key: string]: unknown;
  };
  wishlist: {
    title: string;
    empty: string;
    emptyMessage: string;
    addToWishlist: string;
    removeFromWishlist: string;
    addedToWishlist: string;
    removedFromWishlist: string;
    loginRequired: string;
    loginRequiredTitle: string;
    loginRequiredMessage: string;
    loginButton: string;
    viewWishlist: string;
    browseProducts: string;
    [key: string]: unknown;
  };
  blog: {
    title: string;
    subtitle: string;
    readMore: string;
    [key: string]: unknown;
  };
  contact: {
    pageTitle: string;
    pageSubtitle: string;
    contactForm: string;
    contactInfo: string;
    firstName: string;
    firstNamePlaceholder: string;
    lastName: string;
    lastNamePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    subject: string;
    subjectPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    sendMessage: string;
    address: string;
    phone: string;
    workingHours: string;
    saturdayToWednesday: string;
    thursday: string;
    friday: string;
    [key: string]: unknown;
  };
  about: {
    pageTitle: string;
    pageSubtitle: string;
    companyHistory: string;
    historyText1: string;
    historyText2: string;
    yearsExperience: string;
    inIndustrialTools: string;
    guaranteedQuality: string;
    qualityDescription: string;
    advancedTechnology: string;
    technologyDescription: string;
    support247: string;
    supportDescription: string;
    [key: string]: unknown;
  };
  customer: {
    account: {
      title: string;
      subtitle: string;
      personalInfo: string;
      recentOrders: string;
      orderHistory: string;
      addresses: string;
      wishlist: string;
      settings: string;
      logout: string;
      orders: string;
      security: string;
    };
    profile: {
      title: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      company: string;
      position: string;
      saveChanges: string;
      resetForm: string;
      updateSuccess: string;
      updateError: string;
      requiredField: string;
      errorLoadingProfile: string;
    };
    orders: {
      title: string;
      recentOrders: string;
      viewAllOrders: string;
      orderNumber: string;
      orderDate: string;
      orderStatus: string;
      paymentStatus: string;
      totalAmount: string;
      itemCount: string;
      viewDetails: string;
      reorder: string;
      downloadInvoice: string;
      trackOrder: string;
      noOrders: string;
      noOrdersMessage: string;
      loadingOrders: string;
      errorLoadingOrders: string;
      retry: string;
      filters: {
        title: string;
        filterStatus: string;
        dateRange: string;
        sortBy: string;
        sortOrder: string;
        allStatuses: string;
        pending: string;
        confirmed: string;
        processing: string;
        shipped: string;
        delivered: string;
        cancelled: string;
        refunded: string;
        allTimes: string;
        last7Days: string;
        last30Days: string;
        last90Days: string;
        lastYear: string;
        orderDate: string;
        orderNumber: string;
        totalAmount: string;
        sortStatus: string;
        ascending: string;
        descending: string;
      };
      pagination: {
        previous: string;
        next: string;
        page: string;
      };
      orderStatuses: {
        pending: string;
        confirmed: string;
        processing: string;
        shipped: string;
        delivered: string;
        cancelled: string;
        refunded: string;
      };
      paymentStatuses: {
        pending: string;
        paid: string;
        failed: string;
        refunded: string;
        partiallyRefunded: string;
      };
      paymentMethod: {
        zarinpal: string;
        bankTransfer: string;
        cashOnDelivery: string;
      };
      shippingMethod: {
        tipax: string;
        post: string;
        express: string;
      };
      currency: string;
      yesterday: string;
      daysAgo: string;
      weeksAgo: string;
      monthsAgo: string;
      yearsAgo: string;
    };
    orderDetails: {
      title: string;
      orderSummary: string;
      orderItems: string;
      paymentInfo: string;
      shippingInfo: string;
      billingAddress: string;
      shippingAddress: string;
      customerNote: string;
      backToOrders: string;
      subtotal: string;
      shipping: string;
      tax: string;
      discount: string;
      total: string;
      discountApplied: string;
      orderActions: string;
      reorder: string;
      downloadInvoice: string;
      trackOrder: string;
      orderNotFound: string;
      errorLoadingOrder: string;
      loadingOrder: string;
      // Status labels
      statusPending: string;
      statusConfirmed: string;
      statusProcessing: string;
      statusShipped: string;
      statusDelivered: string;
      statusCancelled: string;
      statusRefunded: string;
      // Payment status labels
      paymentStatusPending: string;
      paymentStatusPaid: string;
      paymentStatusFailed: string;
      paymentStatusRefunded: string;
      paymentStatusPartiallyRefunded: string;
      // Payment method labels
      paymentMethodZarinpal: string;
      paymentMethodBankTransfer: string;
      paymentMethodCashOnDelivery: string;
      // Shipping method labels
      shippingMethodTipax: string;
      shippingMethodPost: string;
      shippingMethodExpress: string;
      // Other labels
      orderNumber: string;
      orderCreatedAt: string;
      reorderButton: string;
      downloadInvoiceButton: string;
      trackOrderButton: string;
      backButton: string;
      totalAmount: string;
      shippingAmount: string;
      taxAmount: string;
      sku: string;
      quantity: string;
      unitPrice: string;
      paymentInformation: string;
      paymentMethod: string;
      paymentStatus: string;
      paymentDate: string;
      paymentId: string;
      shippingInformation: string;
      shippingMethod: string;
      trackingNumber: string;
      shippedAt: string;
      deliveredAt: string;
      phone: string;
      backToOrdersButton: string;
      breadcrumb: {
        account: string;
        orders: string;
        orderDetails: string;
      };
    };
    addresses: {
      title: string;
      addNewAddress: string;
      editAddress: string;
      deleteAddress: string;
      setAsDefault: string;
      addressType: string;
      billing: string;
      shipping: string;
      both: string;
      addressTitle: string;
      firstName: string;
      lastName: string;
      company: string;
      addressLine1: string;
      addressLine2: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      phone: string;
      isDefault: string;
      noAddresses: string;
      noAddressesMessage: string;
      errorLoadingAddresses: string;
      retry: string;
      deleteConfirmMessage: string;
      companyOptional: string;
      addressLine2Optional: string;
      countries: {
        iran: string;
        afghanistan: string;
        iraq: string;
        turkey: string;
        other: string;
      };
      comingSoon: string;
      comingSoonMessage: string;
      validation: {
        required: string;
        invalid: string;
      };
    };
    checkout: {
      billingAddress: string;
      shippingAddress: string;
      paymentMethod: string;
      orderSummary: string;
      placeOrder: string;
      orderConfirmation: string;
      orderNumber: string;
      estimatedDelivery: string;
      useSameAddress: string;
      selectAddress: string;
      addNewAddress: string;
      addressSelection: string;
      billingAddressRequired: string;
      shippingAddressRequired: string;
      addressValidationError: string;
      step1: string;
      step2: string;
      step3: string;
      step4: string;
      nextStep: string;
      previousStep: string;
      completeOrder: string;
      orderProcessing: string;
      orderSuccess: string;
      orderError: string;
      guestCheckout: string;
      loginToCheckout: string;
      saveAddressForFuture: string;
      addressSaved: string;
      addressSaveError: string;
    };
    wishlist: {
      title: string;
      addToCart: string;
      removeFromWishlist: string;
      moveToCart: string;
      noItems: string;
      noItemsMessage: string;
      comingSoon: string;
      comingSoonMessage: string;
      browseProducts: string;
      itemCount: string;
      inStock: string;
      outOfStock: string;
      totalItems: string;
      continueShopping: string;
      addAllToCart: string;
    };
    settings: {
      title: string;
      comingSoon: string;
      comingSoonMessage: string;
      saveSuccess: string;
      saveError: string;
      networkError: string;
      generalTab: string;
      notificationsTab: string;
      privacyTab: string;
      displayTab: string;
      languageAndRegion: string;
      language: string;
      currency: string;
      timezone: string;
      orderNotifications: string;
      orderUpdates: string;
      orderUpdatesDesc: string;
      smsNotifications: string;
      smsNotificationsDesc: string;
      marketingNotifications: string;
      promotionalEmails: string;
      promotionalEmailsDesc: string;
      newProductAlerts: string;
      newProductAlertsDesc: string;
      priceDropAlerts: string;
      priceDropAlertsDesc: string;
      accountPrivacy: string;
      showOnlineStatus: string;
      showOnlineStatusDesc: string;
      allowDataSharing: string;
      allowDataSharingDesc: string;
      showPurchaseHistory: string;
      showPurchaseHistoryDesc: string;
      displayPreferences: string;
      itemsPerPage: string;
      dateFormat: string;
      theme: string;
      themeAuto: string;
      themeLight: string;
      themeDark: string;
      currencies: {
        irr: string;
        usd: string;
        eur: string;
      };
      timezones: {
        tehran: string;
        utc: string;
        london: string;
      };
      dateFormats: {
        persian: string;
        gregorian: string;
        islamic: string;
      };
    };
    security: {
      title: string;
      passwordManagement: string;
      changePassword: string;
      currentPassword: string;
      currentPasswordPlaceholder: string;
      newPassword: string;
      newPasswordPlaceholder: string;
      confirmPassword: string;
      confirmPasswordPlaceholder: string;
      passwordTooShort: string;
      passwordsDoNotMatch: string;
      passwordChanged: string;
      passwordChangeError: string;
      networkError: string;
      changing: string;
      saveChanges: string;
      cancel: string;
      securityInfo: string;
      lastLogin: string;
      emailVerified: string;
      phoneVerified: string;
      verified: string;
      notVerified: string;
      unknown: string;
      advancedSecurity: string;
      twoFactorAuth: string;
      twoFactorAuthDesc: string;
      loginHistory: string;
      loginHistoryDesc: string;
      deviceManagement: string;
      deviceManagementDesc: string;
      comingSoon: string;
    };
  };
}

export async function getMessages(locale: string): Promise<Messages> {
  try {
    // Use Promise.race with timeout to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('getMessages timeout')), 5000);
    });
    
    const importPromise = import(`../../messages/${locale}.json`).then(m => m.default);
    
    const messages = await Promise.race([importPromise, timeoutPromise]);
    return messages;
  } catch (error) {
    console.warn(`Failed to load messages for locale: ${locale}, falling back to default:`, error);
    try {
    const defaultMessages = await import(`../../messages/${defaultLocale}.json`);
    return defaultMessages.default;
    } catch (fallbackError) {
      console.error('Failed to load default messages:', fallbackError);
      // Return a minimal messages object to prevent complete failure
      // Using 'unknown' first to bypass strict type checking for this emergency fallback
      return {
        common: { loading: "در حال بارگذاری...", error: "خطا" },
        navigation: {},
        auth: {},
        categories: {},
        products: {},
        cart: {},
        footer: {},
        faq: {},
        admin: {},
        homepage: {
          hero: { tagline: "", description: "", viewProducts: "", aboutUs: "" },
          features: { title: "", subtitle: "", quality: { title: "", description: "" }, technology: { title: "", description: "" }, support: { title: "", description: "" } },
          categories: { title: "", subtitle: "", diamondDiscs: { title: "", description: "" }, cylindricalCutters: { title: "", description: "" }, holdingClamps: { title: "", description: "" }, viewAllProducts: "" }
        },
        search: {},
        reviews: {},
        wishlist: {},
        blog: {},
        contact: {},
        about: {},
        customer: {},
        education: {}
      } as unknown as Messages;
    }
  }
}

export function getLocaleDirection(locale: string): "ltr" | "rtl" {
  return locale === "ar" || locale === "fa" ? "rtl" : "ltr";
}

export function getLocaleName(locale: string): string {
  const names: Record<string, string> = {
    fa: "فارسی",
    en: "English",
    ar: "العربية",
  };
  return names[locale] || names[defaultLocale];
}

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
