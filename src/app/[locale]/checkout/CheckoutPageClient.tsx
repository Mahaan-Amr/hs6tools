"use client";

import { useCartStore } from "@/contexts/CartContext";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import CheckoutAddressSelector from "@/components/checkout/CheckoutAddressSelector";
import { getMessages, Messages } from "@/lib/i18n";

interface CheckoutPageClientProps {
  locale: string;
}

interface Address {
  firstName: string;
  lastName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
}

interface CustomerAddress {
  id: string;
  type: string;
  title: string;
  firstName: string;
  lastName: string;
  company: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

interface OrderItem {
  id: string;
  name: string;
  image: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

interface FailedOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  shippingMethod: string;
  items: OrderItem[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    phone: string;
    state: string;
    city: string;
    addressLine1: string;
    postalCode: string;
  };
}

export default function CheckoutPageClient({ locale }: CheckoutPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, clearCart } = useCartStore();
  const { status } = useSession();
  const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const [messages, setMessages] = useState<Messages | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  // Retry payment state
  const [failedOrder, setFailedOrder] = useState<FailedOrder | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);

  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await getMessages(locale);
      setMessages(msgs);
    };
    loadMessages();
  }, [locale]);

  // Check authentication status and redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return; // Wait for session to load
    
    if (status === "unauthenticated") {
      // Redirect to login with callback URL to return to checkout
      const callbackUrl = encodeURIComponent(`/${locale}/checkout`);
      router.push(`/${locale}/auth/login?callbackUrl=${callbackUrl}`);
    }
  }, [status, router, locale]);

  // Check for payment success (orderNumber and refId without error) - redirect to success page
  useEffect(() => {
    const orderNumber = searchParams.get("orderNumber");
    const refId = searchParams.get("refId");
    const error = searchParams.get("error");
    
    console.log('🔄 [Checkout] Checking for payment success redirect:', {
      orderNumber,
      refId,
      error,
      hasOrderNumber: !!orderNumber,
      hasRefId: !!refId,
      hasError: !!error,
    });
    
    // If we have orderNumber and refId without error, redirect to success page
    if (orderNumber && refId && !error) {
      console.log('✅ [Checkout] Redirecting to success page:', {
        orderNumber,
        refId,
        locale,
      });
      router.replace(`/${locale}/checkout/success?orderNumber=${orderNumber}&refId=${refId}`);
      return;
    }
  }, [searchParams, locale, router]);

  // Check for payment errors and load failed order for retry
  useEffect(() => {
    const error = searchParams.get("error");
    const errorMessage = searchParams.get("message");
    const orderNumber = searchParams.get("orderNumber");
    
    if (error && orderNumber) {
      let errorText = "";
      switch (error) {
        case "payment_cancelled":
          errorText = String(messages?.checkout?.paymentCancelled || "پرداخت لغو شد");
          break;
        case "payment_failed":
          errorText = errorMessage 
            ? decodeURIComponent(errorMessage)
            : String(messages?.checkout?.paymentFailed || "پرداخت ناموفق بود");
          break;
        case "payment_request_failed":
          errorText = String(messages?.checkout?.paymentRequestFailed || "خطا در ایجاد درخواست پرداخت");
          break;
        case "order_not_found":
          errorText = String(messages?.checkout?.orderNotFound || "سفارش یافت نشد");
          break;
        default:
          errorText = String(messages?.checkout?.paymentError || "خطا در پرداخت");
      }
      setPaymentError(errorText);
      
      // Fetch the failed order details for retry
      const fetchFailedOrder = async () => {
        setIsLoadingOrder(true);
        try {
          console.log('🔄 [Checkout] Fetching failed order:', orderNumber);
          const response = await fetch(`/api/customer/orders/${orderNumber}`);
          const result = await response.json();
          
          if (result.success && result.data) {
            console.log('✅ [Checkout] Failed order loaded:', result.data);
            setFailedOrder(result.data);
          } else {
            console.error('❌ [Checkout] Failed to load order:', result.error);
          }
        } catch (error) {
          console.error('❌ [Checkout] Error loading order:', error);
        } finally {
          setIsLoadingOrder(false);
        }
      };
      
      fetchFailedOrder();
      
      // Clear error from URL after displaying (but keep orderNumber for retry)
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("error");
      newSearchParams.delete("message");
      router.replace(`/${locale}/checkout?${newSearchParams.toString()}`, { scroll: false });
    }
  }, [searchParams, messages, locale, router]);

  // Get shipping methods from translations
  const getShippingMethods = (): ShippingMethod[] => {
    if (!messages?.checkout?.shippingMethods) {
      return [];
    }
    const shippingMethods = messages.checkout.shippingMethods;
    return [
      {
        id: "post",
        name: shippingMethods?.post?.name || "",
        description: shippingMethods?.post?.description || "",
        price: 50000,
        estimatedDays: shippingMethods?.post?.estimatedDays || ""
      },
      {
        id: "tipax",
        name: shippingMethods?.tipax?.name || "",
        description: shippingMethods?.tipax?.description || "",
        price: 80000,
        estimatedDays: shippingMethods?.tipax?.estimatedDays || ""
      }
    ];
  };

  const SHIPPING_METHODS = getShippingMethods();
  const [currentStep, setCurrentStep] = useState(1);
  const [address, setAddress] = useState<Address>({
    firstName: "",
    lastName: "",
    phone: "",
    province: "",
    city: "",
    address: "",
    postalCode: ""
  });
  const [selectedShipping, setSelectedShipping] = useState<string>("post");
  const [isProcessing, setIsProcessing] = useState(false);
  const [useSavedAddresses, setUseSavedAddresses] = useState(false);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<CustomerAddress | null>(null);
  const [couponCode, setCouponCode] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {
      style: "currency",
      currency: locale === "fa" ? "IRR" : "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Use failed order data if retrying payment, otherwise use cart
  const isRetryMode = !!failedOrder;
  const displayItems = isRetryMode 
    ? failedOrder.items.map(item => ({
        id: item.id,
        productId: item.id,
        variantId: null,
        sku: '',
        name: item.name,
        category: '',
        image: item.image || '',
        price: item.unitPrice,
        quantity: item.quantity
      }))
    : items;
  
  const selectedShippingMethod = SHIPPING_METHODS.find(m => m.id === selectedShipping);
  const shippingCost = isRetryMode ? failedOrder.shippingAmount : (selectedShippingMethod?.price || 0);
  const taxAmount = isRetryMode ? failedOrder.taxAmount : Math.round(totalPrice * 0.09);
  const discountAmount = isRetryMode ? failedOrder.discountAmount : (appliedCoupon?.discountAmount || 0);
  const totalWithShipping = isRetryMode ? failedOrder.totalAmount : (totalPrice + shippingCost + taxAmount - discountAmount);

  const handleAddressChange = (field: keyof Address, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  if (!messages?.checkout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-20">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-gray-900 dark:text-white">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-orange mx-auto"></div>
            <p className="mt-4 text-xl">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const t = messages.checkout;

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Check if using saved addresses or manual form
      if (useSavedAddresses) {
        if (!selectedShippingAddress) {
          alert(String(t.shippingAddressRequired || 'لطفاً آدرس ارسال را انتخاب کنید'));
          return;
        }
      } else {
        if (!isAddressValid()) {
          alert(String(t.completeAddressFields));
          return;
        }
      }
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isAddressValid = () => {
    return Object.values(address).every(value => value.trim() !== "");
  };

  const handleAddressSelect = (address: CustomerAddress) => {
      setSelectedShippingAddress(address);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError(String(t.enterCouponCode));
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError(null);

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode.trim(),
          subtotal: totalPrice,
          items: items.map(item => ({
            productId: item.productId,
          })),
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setAppliedCoupon({
          code: result.data.coupon.code,
          discountAmount: result.data.discountAmount,
        });
        setCouponCode("");
        setCouponError(null);
      } else {
        setCouponError(result.error || String(t.invalidCoupon));
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      setCouponError(String(t.couponValidationError));
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
  };

  const handleRetryPayment = async () => {
    if (!failedOrder) return;
    
    setIsProcessing(true);
    
    try {
      console.log('🔄 [Checkout] Retrying payment for order:', failedOrder.id);
      
      // Request payment for existing order
      const paymentResponse = await fetch('/api/payment/zarinpal/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: failedOrder.id
        })
      });

      const paymentResult = await paymentResponse.json();

      if (!paymentResponse.ok || !paymentResult.success || !paymentResult.paymentUrl) {
        console.error('❌ Payment request failed:', paymentResult.error);
        throw new Error(paymentResult.error || String(t.paymentRequestFailed || 'Failed to create payment request'));
      }

      console.log('✅ Payment URL received, redirecting to Zarinpal');
      
      // Redirect to Zarinpal payment page
      window.location.href = paymentResult.paymentUrl;
      return;
    } catch (error) {
      console.error("Error retrying payment:", error);
      alert(`${String(t.orderError)}: ${error instanceof Error ? error.message : String(t.tryAgain)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    try {
      // Prepare order data - use saved addresses or manual form
      let shippingAddressData;
      
      if (useSavedAddresses && selectedShippingAddress) {
        // Use saved address - include addressId to prevent duplication
        shippingAddressData = {
          addressId: selectedShippingAddress.id, // Use existing address
          firstName: selectedShippingAddress.firstName,
          lastName: selectedShippingAddress.lastName,
          phone: selectedShippingAddress.phone,
          province: selectedShippingAddress.state,
          city: selectedShippingAddress.city,
          address: selectedShippingAddress.addressLine1,
          postalCode: selectedShippingAddress.postalCode
        };
      } else {
        // Use manual form data - no addressId means create new
        shippingAddressData = {
          firstName: address.firstName,
          lastName: address.lastName,
          phone: address.phone,
          province: address.province,
          city: address.city,
          address: address.address,
          postalCode: address.postalCode
        };
      }

      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          variantId: item.variantId || null,
          sku: item.sku,
          name: item.name,
          description: item.category,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          attributes: {}
        })),
        shippingAddress: shippingAddressData,
        shippingMethod: selectedShipping,
        paymentMethod: "ZARINPAL", // Default to ZarinPal
        customerNote: "",
        subtotal: totalPrice,
        shippingAmount: shippingCost,
        taxAmount: Math.round(totalPrice * 0.09), // 9% VAT for Iran
        discountAmount: discountAmount,
        couponCode: appliedCoupon?.code || null,
        totalAmount: totalWithShipping
      };

      console.log('🛒 Creating order with data:', orderData);

      // Create order via API
      const response = await fetch('/api/customer/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
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
        throw new Error(result.error || 'Failed to create order');
      }

      console.log('🛒 Order created successfully:', result.data);

      // Request payment from Zarinpal
      if (orderData.paymentMethod === "ZARINPAL") {
        console.log('💳 Requesting payment for order:', result.data.id);
        
        const paymentResponse = await fetch('/api/payment/zarinpal/request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: result.data.id
          })
        });

        const paymentResult = await paymentResponse.json();

        if (!paymentResponse.ok || !paymentResult.success || !paymentResult.paymentUrl) {
          console.error('❌ Payment request failed:', paymentResult.error);
          throw new Error(paymentResult.error || String(t.paymentRequestFailed || 'Failed to create payment request'));
        }

        console.log('✅ Payment URL received, redirecting to Zarinpal');
        
        // Clear cart before redirecting to payment (order is created)
        clearCart();
        
        // Redirect to Zarinpal payment page
        window.location.href = paymentResult.paymentUrl;
        return;
      }

      // For non-Zarinpal payment methods (bank transfer, COD), redirect to success
      clearCart();
      router.push(`/${locale}/checkout/success?orderNumber=${result.data.orderNumber}`);
    } catch (error) {
      console.error("Error placing order:", error);
      alert(`${String(t.orderError)}: ${error instanceof Error ? error.message : String(t.tryAgain)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading state while fetching failed order
  if (isLoadingOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-20">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-gray-900 dark:text-white">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-orange mx-auto"></div>
            <p className="mt-4 text-xl">در حال بارگذاری سفارش...</p>
          </div>
        </div>
      </div>
    );
  }

  // Only show empty cart if not in retry mode
  if (items.length === 0 && !isRetryMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{String(t.emptyCartTitle)}</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 text-justify leading-relaxed">
            {String(t.emptyCartMessage)}
          </p>
          <button
            onClick={() => router.push(`/${locale}/shop`)}
            className="bg-gradient-to-r from-primary-orange to-orange-500 text-gray-900 dark:text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-glass-orange hover:scale-105 transition-all duration-200"
          >
            {String(t.viewProducts)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{String(t.checkoutTitle)}</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg text-justify leading-relaxed">
            {String(t.checkoutSubtitle)}
          </p>
        </div>

        {/* Retry Payment Banner */}
        {isRetryMode && failedOrder && (
          <div className="mb-6 p-6 bg-blue-50 dark:bg-blue-500/10 border-2 border-blue-200 dark:border-blue-500/30 rounded-xl">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <div className="flex-1">
                <h3 className="text-blue-800 dark:text-blue-300 font-semibold mb-2">
                  تلاش مجدد برای پرداخت
                </h3>
                <p className="text-blue-700 dark:text-blue-400 text-sm mb-2">
                  شماره سفارش: <span className="font-semibold">{failedOrder.orderNumber}</span>
                </p>
                <p className="text-blue-600 dark:text-blue-500 text-sm">
                  می‌توانید مجدداً برای این سفارش پرداخت کنید یا آن را لغو کنید.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Error Alert */}
        {paymentError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border-2 border-red-200 dark:border-red-500/30 rounded-xl">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-red-800 dark:text-red-300 font-semibold mb-1">
                  {String(messages?.checkout?.paymentErrorTitle || "خطا در پرداخت")}
                </h3>
                <p className="text-red-700 dark:text-red-400 text-sm">{paymentError}</p>
              </div>
              <button
                onClick={() => setPaymentError(null)}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg ${
                  currentStep >= step 
                    ? "bg-primary-orange text-white" 
                    : "bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400"
                }`}>
                  {step}
                </div>
                <span className={`ml-3 text-lg font-medium ${
                  currentStep >= step ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"
                }`}>
                  {step === 1 ? String(t.step1Label) : step === 2 ? String(t.step2Label) : String(t.step3Label)}
                </span>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-4 ${
                    currentStep > step ? "bg-primary-orange" : "bg-gray-200 dark:bg-gray-50 dark:bg-white/10"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Address Information */}
            {currentStep === 1 && (
              <div className="glass rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{String(t.shippingInfo)}</h2>
                
                {/* Show read-only address in retry mode */}
                {isRetryMode && failedOrder ? (
                  <div className="p-6 bg-blue-50 dark:bg-blue-500/10 border-2 border-blue-200 dark:border-blue-500/30 rounded-xl">
                    <div className="flex items-start mb-4">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-blue-700 dark:text-blue-400 text-sm">
                        آدرس ارسال از سفارش قبلی شما استفاده می‌شود. برای تغییر آدرس، لطفاً سفارش را لغو کرده و مجدداً ثبت کنید.
                      </p>
                    </div>
                    <div className="text-gray-900 dark:text-white">
                      <p className="font-semibold mb-2">آدرس ارسال:</p>
                      <p>{failedOrder.shippingAddress.firstName} {failedOrder.shippingAddress.lastName}</p>
                      <p>{failedOrder.shippingAddress.phone}</p>
                      <p>{failedOrder.shippingAddress.state}، {failedOrder.shippingAddress.city}</p>
                      <p>{failedOrder.shippingAddress.addressLine1}</p>
                      <p>کد پستی: {failedOrder.shippingAddress.postalCode}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Address Selection Toggle */}
                    <div className="mb-6">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setUseSavedAddresses(false)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                            !useSavedAddresses
                              ? "bg-primary-orange text-white"
                              : "bg-gray-200 dark:bg-gray-50 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                          }`}
                        >
                          {String(t.enterNewAddress)}
                        </button>
                        <button
                          onClick={() => setUseSavedAddresses(true)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                            useSavedAddresses
                              ? "bg-primary-orange text-white"
                              : "bg-gray-200 dark:bg-gray-50 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                          }`}
                        >
                          {String(t.selectSavedAddress)}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {!isRetryMode && (useSavedAddresses ? (
                  <CheckoutAddressSelector
                    locale={locale}
                    onAddressSelect={handleAddressSelect}
                    selectedShippingAddress={selectedShippingAddress}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-900 dark:text-white font-medium mb-2">{String(t.firstName)}</label>
                    <input
                      type="text"
                      value={address.firstName}
                      onChange={(e) => handleAddressChange("firstName", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-primary-orange transition-colors duration-200"
                      placeholder={String(t.firstNamePlaceholder)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-900 dark:text-white font-medium mb-2">{String(t.lastName)}</label>
                    <input
                      type="text"
                      value={address.lastName}
                      onChange={(e) => handleAddressChange("lastName", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-primary-orange transition-colors duration-200"
                      placeholder={String(t.lastNamePlaceholder)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-900 dark:text-white font-medium mb-2">{String(t.phone)}</label>
                    <input
                      type="tel"
                      value={address.phone}
                      onChange={(e) => handleAddressChange("phone", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-primary-orange transition-colors duration-200"
                      placeholder={String(t.phonePlaceholder)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-900 dark:text-white font-medium mb-2">{String(t.postalCode)}</label>
                    <input
                      type="text"
                      value={address.postalCode}
                      onChange={(e) => handleAddressChange("postalCode", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-primary-orange transition-colors duration-200"
                      placeholder={String(t.postalCodePlaceholder)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-900 dark:text-white font-medium mb-2">{String(t.province)}</label>
                    <input
                      type="text"
                      value={address.province}
                      onChange={(e) => handleAddressChange("province", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-primary-orange transition-colors duration-200"
                      placeholder={String(t.provincePlaceholder)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-900 dark:text-white font-medium mb-2">{String(t.city)}</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => handleAddressChange("city", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-primary-orange transition-colors duration-200"
                      placeholder={String(t.cityPlaceholder)}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-gray-900 dark:text-white font-medium mb-2">{String(t.fullAddress)}</label>
                    <textarea
                      value={address.address}
                      onChange={(e) => handleAddressChange("address", e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-primary-orange transition-colors duration-200 resize-none"
                      placeholder={String(t.fullAddressPlaceholder)}
                    />
                  </div>
                </div>
                ))}
              </div>
            )}

            {/* Step 2: Shipping Method */}
            {currentStep === 2 && (
              <div className="glass rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{String(t.selectShippingMethod)}</h2>
                
                <div className="space-y-4">
                  {SHIPPING_METHODS.map((method) => (
                    <div
                      key={method.id}
                      className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedShipping === method.id
                          ? "border-primary-orange bg-primary-orange/10"
                          : "border-gray-300 dark:border-white/20 bg-gray-100 dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/40"
                      }`}
                      onClick={() => setSelectedShipping(method.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-5 h-5 rounded-full border-2 ${
                            selectedShipping === method.id
                              ? "border-primary-orange bg-primary-orange"
                              : "border-gray-300 dark:border-gray-300 dark:border-white/40"
                          }`}>
                            {selectedShipping === method.id && (
                              <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{method.name}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{method.description}</p>
                            <p className="text-primary-orange text-sm mt-1">
                              {String(t.deliveryTime)}: {method.estimatedDays}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatPrice(method.price)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Order Review */}
            {currentStep === 3 && (
              <div className="glass rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{String(t.orderReview)}</h2>
                
                {/* Address Summary */}
                <div className="mb-8 p-6 bg-gray-100 dark:bg-white/5 rounded-2xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{String(t.shippingInfoLabel || t.shippingAddress || 'آدرس ارسال')}</h3>
                  <div className="text-gray-600 dark:text-gray-300">
                    {useSavedAddresses && selectedShippingAddress ? (
                      <>
                        <p>{selectedShippingAddress.firstName} {selectedShippingAddress.lastName}</p>
                        <p>{selectedShippingAddress.phone}</p>
                        <p>{selectedShippingAddress.state}، {selectedShippingAddress.city}</p>
                        <p>{selectedShippingAddress.addressLine1}</p>
                        {selectedShippingAddress.addressLine2 && <p>{selectedShippingAddress.addressLine2}</p>}
                        <p>{String(t.postalCodeLabel)}: {selectedShippingAddress.postalCode}</p>
                      </>
                    ) : (
                      <>
                        <p>{address.firstName} {address.lastName}</p>
                        <p>{address.phone}</p>
                        <p>{address.province}، {address.city}</p>
                        <p>{address.address}</p>
                        <p>{String(t.postalCodeLabel)}: {address.postalCode}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Shipping Summary */}
                <div className="mb-8 p-6 bg-gray-100 dark:bg-white/5 rounded-2xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{String(t.shippingMethodLabel)}</h3>
                  <div className="text-gray-600 dark:text-gray-300">
                    <p>{selectedShippingMethod?.name}</p>
                    <p>{String(t.deliveryTime)}: {selectedShippingMethod?.estimatedDays}</p>
                    <p>{String(t.shippingCost)}: {formatPrice(selectedShippingMethod?.price || 0)}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-8 p-6 bg-gray-100 dark:bg-white/5 rounded-2xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{String(t.orderItems)}</h3>
                  <div className="space-y-3">
                    {displayItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-600 dark:text-gray-300">{item.name}</span>
                          <span className="text-gray-500">× {item.quantity}</span>
                        </div>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  currentStep === 1
                    ? "bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                    : "glass border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-50 dark:bg-white/10"
                }`}
              >
                {String(t.previousStep)}
              </button>
              
              {currentStep < 3 ? (
                <button
                  onClick={handleNextStep}
                  className="px-8 py-3 bg-gradient-to-r from-primary-orange to-orange-500 text-gray-900 dark:text-white rounded-xl font-semibold hover:shadow-glass-orange hover:scale-105 transition-all duration-200"
                >
                  {String(t.nextStep)}
                </button>
              ) : (
                <button
                  onClick={isRetryMode ? handleRetryPayment : handlePlaceOrder}
                  disabled={isProcessing}
                  className="px-8 py-3 bg-gradient-to-r from-primary-orange to-orange-500 text-gray-900 dark:text-white rounded-xl font-semibold hover:shadow-glass-orange hover:scale-105 transition-all duration-200 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{String(t.processing)}</span>
                    </div>
                  ) : (
                    isRetryMode ? "تلاش مجدد برای پرداخت" : String(t.placeOrder)
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass rounded-3xl p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{String(t.orderSummary)}</h2>
              
              {/* Coupon Code Section */}
              <div className="mb-6 p-4 bg-gray-100 dark:bg-white/5 rounded-xl">
                {!appliedCoupon ? (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-900 dark:text-white">
                      {String(t.couponCode)}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError(null);
                        }}
                        placeholder={String(t.couponPlaceholder)}
                        className="flex-1 px-4 py-2 bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleApplyCoupon();
                          }
                        }}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isValidatingCoupon || !couponCode.trim()}
                        className="px-6 py-2 bg-primary-orange text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isValidatingCoupon ? "..." : String(t.apply)}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-sm text-red-600 dark:text-red-400">{couponError}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {String(t.discountApplied)}: {appliedCoupon.code}
                      </span>
                      <span className="text-green-600 dark:text-green-400">
                        (-{formatPrice(appliedCoupon.discountAmount)})
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
                    >
                      {String(t.remove)}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{String(t.subtotal)}:</span>
                  <span className="text-gray-900 dark:text-white">{formatPrice(totalPrice)}</span>
                </div>
                
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{String(t.shippingCostLabel)}:</span>
                  <span className="text-gray-900 dark:text-white">{formatPrice(shippingCost)}</span>
                </div>
                
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{String(t.tax)}:</span>
                  <span className="text-gray-900 dark:text-white">{formatPrice(taxAmount)}</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>{String(t.discount)}:</span>
                    <span className="font-semibold">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                
                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between text-lg font-semibold text-gray-900 dark:text-white">
                    <span>{String(t.total)}:</span>
                    <span className="text-primary-orange">{formatPrice(totalWithShipping)}</span>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>{String(t.securePayment)}</span>
                </div>
                
                <p className="text-xs text-gray-500 leading-relaxed">
                  {String(t.termsAcceptance)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
