"use client";

import { useCartStore } from "@/contexts/CartContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

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

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "post",
    name: "پست ایران",
    description: "ارسال از طریق پست رسمی ایران",
    price: 50000,
    estimatedDays: "3-5 روز کاری"
  },
  {
    id: "tipax",
    name: "تیپاکس",
    description: "ارسال سریع از طریق تیپاکس",
    price: 80000,
    estimatedDays: "2-3 روز کاری"
  }
];

export default function CheckoutPageClient({ locale }: CheckoutPageClientProps) {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {
      style: "currency",
      currency: locale === "fa" ? "IRR" : "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const selectedShippingMethod = SHIPPING_METHODS.find(m => m.id === selectedShipping);
  const shippingCost = selectedShippingMethod?.price || 0;
  const totalWithShipping = totalPrice + shippingCost;

  const handleAddressChange = (field: keyof Address, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !isAddressValid()) {
      alert("لطفاً تمام فیلدهای آدرس را تکمیل کنید");
      return;
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

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear cart and redirect to success page
      clearCart();
      router.push(`/${locale}/checkout/success`);
    } catch (error) {
      console.error("Error placing order:", error);
      alert("خطا در ثبت سفارش. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-black via-gray-900 to-primary-black pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">سبد خرید خالی است</h1>
          <p className="text-gray-400 text-lg mb-8">
            برای تکمیل خرید، ابتدا محصولی به سبد خرید اضافه کنید.
          </p>
          <button
            onClick={() => router.push(`/${locale}/shop`)}
            className="bg-gradient-to-r from-primary-orange to-orange-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-glass-orange hover:scale-105 transition-all duration-200"
          >
            مشاهده محصولات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-black via-gray-900 to-primary-black pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">تکمیل خرید</h1>
          <p className="text-gray-400 text-lg">
            مراحل تکمیل سفارش خود را دنبال کنید
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg ${
                  currentStep >= step 
                    ? "bg-primary-orange text-white" 
                    : "bg-white/10 text-gray-400"
                }`}>
                  {step}
                </div>
                <span className={`ml-3 text-lg font-medium ${
                  currentStep >= step ? "text-white" : "text-gray-400"
                }`}>
                  {step === 1 ? "اطلاعات ارسال" : step === 2 ? "روش ارسال" : "بررسی نهایی"}
                </span>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-4 ${
                    currentStep > step ? "bg-primary-orange" : "bg-white/10"
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
                <h2 className="text-2xl font-bold text-white mb-6">اطلاعات ارسال</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">نام</label>
                    <input
                      type="text"
                      value={address.firstName}
                      onChange={(e) => handleAddressChange("firstName", e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-orange transition-colors duration-200"
                      placeholder="نام خود را وارد کنید"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">نام خانوادگی</label>
                    <input
                      type="text"
                      value={address.lastName}
                      onChange={(e) => handleAddressChange("lastName", e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-orange transition-colors duration-200"
                      placeholder="نام خانوادگی خود را وارد کنید"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">شماره تماس</label>
                    <input
                      type="tel"
                      value={address.phone}
                      onChange={(e) => handleAddressChange("phone", e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-orange transition-colors duration-200"
                      placeholder="شماره تماس خود را وارد کنید"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">کد پستی</label>
                    <input
                      type="text"
                      value={address.postalCode}
                      onChange={(e) => handleAddressChange("postalCode", e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-orange transition-colors duration-200"
                      placeholder="کد پستی را وارد کنید"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">استان</label>
                    <input
                      type="text"
                      value={address.province}
                      onChange={(e) => handleAddressChange("province", e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-orange transition-colors duration-200"
                      placeholder="استان را وارد کنید"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">شهر</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => handleAddressChange("city", e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-orange transition-colors duration-200"
                      placeholder="شهر را وارد کنید"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-white font-medium mb-2">آدرس کامل</label>
                    <textarea
                      value={address.address}
                      onChange={(e) => handleAddressChange("address", e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-orange transition-colors duration-200 resize-none"
                      placeholder="آدرس کامل خود را وارد کنید"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Shipping Method */}
            {currentStep === 2 && (
              <div className="glass rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">انتخاب روش ارسال</h2>
                
                <div className="space-y-4">
                  {SHIPPING_METHODS.map((method) => (
                    <div
                      key={method.id}
                      className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedShipping === method.id
                          ? "border-primary-orange bg-primary-orange/10"
                          : "border-white/20 bg-white/5 hover:border-white/40"
                      }`}
                      onClick={() => setSelectedShipping(method.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-5 h-5 rounded-full border-2 ${
                            selectedShipping === method.id
                              ? "border-primary-orange bg-primary-orange"
                              : "border-white/40"
                          }`}>
                            {selectedShipping === method.id && (
                              <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{method.name}</h3>
                            <p className="text-gray-400 text-sm">{method.description}</p>
                            <p className="text-primary-orange text-sm mt-1">
                              زمان تحویل: {method.estimatedDays}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-white">
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
                <h2 className="text-2xl font-bold text-white mb-6">بررسی نهایی سفارش</h2>
                
                {/* Address Summary */}
                <div className="mb-8 p-6 bg-white/5 rounded-2xl">
                  <h3 className="text-lg font-semibold text-white mb-4">اطلاعات ارسال</h3>
                  <div className="text-gray-300">
                    <p>{address.firstName} {address.lastName}</p>
                    <p>{address.phone}</p>
                    <p>{address.province}، {address.city}</p>
                    <p>{address.address}</p>
                    <p>کد پستی: {address.postalCode}</p>
                  </div>
                </div>

                {/* Shipping Summary */}
                <div className="mb-8 p-6 bg-white/5 rounded-2xl">
                  <h3 className="text-lg font-semibold text-white mb-4">روش ارسال</h3>
                  <div className="text-gray-300">
                    <p>{selectedShippingMethod?.name}</p>
                    <p>زمان تحویل: {selectedShippingMethod?.estimatedDays}</p>
                    <p>هزینه: {formatPrice(selectedShippingMethod?.price || 0)}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-8 p-6 bg-white/5 rounded-2xl">
                  <h3 className="text-lg font-semibold text-white mb-4">محصولات سفارش</h3>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-300">{item.name}</span>
                          <span className="text-gray-500">× {item.quantity}</span>
                        </div>
                        <span className="text-white font-medium">
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
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "glass border border-white/20 text-white hover:bg-white/10"
                }`}
              >
                مرحله قبل
              </button>
              
              {currentStep < 3 ? (
                <button
                  onClick={handleNextStep}
                  className="px-8 py-3 bg-gradient-to-r from-primary-orange to-orange-500 text-white rounded-xl font-semibold hover:shadow-glass-orange hover:scale-105 transition-all duration-200"
                >
                  مرحله بعد
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="px-8 py-3 bg-gradient-to-r from-primary-orange to-orange-500 text-white rounded-xl font-semibold hover:shadow-glass-orange hover:scale-105 transition-all duration-200 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>در حال پردازش...</span>
                    </div>
                  ) : (
                    "ثبت سفارش و پرداخت"
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass rounded-3xl p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-white mb-6">خلاصه سفارش</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-400">
                  <span>جمع جزء:</span>
                  <span className="text-white">{formatPrice(totalPrice)}</span>
                </div>
                
                <div className="flex justify-between text-gray-400">
                  <span>هزینه ارسال:</span>
                  <span className="text-white">{formatPrice(shippingCost)}</span>
                </div>
                
                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between text-lg font-semibold text-white">
                    <span>مجموع کل:</span>
                    <span className="text-primary-orange">{formatPrice(totalWithShipping)}</span>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-400 mb-4">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>پرداخت امن با ZarinPal</span>
                </div>
                
                <p className="text-xs text-gray-500 leading-relaxed">
                  با تکمیل خرید، شما شرایط و قوانین ما را می‌پذیرید. 
                  اطلاعات شما محفوظ و امن خواهد بود.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
