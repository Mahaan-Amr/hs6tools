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
  };
  navigation: Record<string, string>;
  auth: Record<string, string>;
  products: Record<string, string>;
  cart: Record<string, string>;
  checkout: Record<string, string>;
  footer: Record<string, string>;
  admin: Record<string, string>;
  homepage: HomepageMessages;
  search: Record<string, string>;
  reviews: Record<string, string>;
  wishlist: Record<string, string>;
  blog: Record<string, string>;
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
    const messages = await import(`../../messages/${locale}.json`);
    return messages.default;
  } catch {
    console.warn(`Failed to load messages for locale: ${locale}, falling back to default`);
    const defaultMessages = await import(`../../messages/${defaultLocale}.json`);
    return defaultMessages.default;
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
