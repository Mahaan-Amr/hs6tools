"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface QuoteFormData extends Record<string, unknown> {
  customerId: string;
  opportunityId: string;
  items: Array<{
    productId: string;
    productName: string;
    productSku: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  validUntil: string;
  status: string;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
}

interface Opportunity {
  id: string;
  title: string;
  stage: string;
  value: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
  isInStock: boolean;
}

interface Quote {
  id?: string;
  customerId?: string;
  opportunityId?: string;
  items?: Array<{
    productId: string;
    productName: string;
    productSku: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal?: number;
  tax?: number;
  total?: number;
  validUntil?: string;
  status?: string;
}

interface QuoteFormProps {
  quote?: Quote;
  onSubmit: (data: QuoteFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function QuoteForm({
  quote,
  onSubmit,
  onCancel,
  isLoading = false
}: QuoteFormProps) {
  const [formData, setFormData] = useState<QuoteFormData>({
    customerId: "",
    opportunityId: "",
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    validUntil: "",
    status: "DRAFT"
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingOpportunities, setLoadingOpportunities] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);

  useEffect(() => {
    if (quote) {
      setFormData({
        customerId: quote.customerId || "",
        opportunityId: quote.opportunityId || "",
        items: quote.items || [],
        subtotal: quote.subtotal || 0,
        tax: quote.tax || 0,
        total: quote.total || 0,
        validUntil: quote.validUntil || "",
        status: quote.status || "DRAFT"
      });
    } else {
      // Set default valid until date (30 days from now)
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 30);
      setFormData(prev => ({
        ...prev,
        validUntil: defaultDate.toISOString().split('T')[0]
      }));
    }
  }, [quote]);

  useEffect(() => {
    fetchCustomers();
    fetchOpportunities();
    fetchProducts();
  }, []);

  useEffect(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.09; // 9% tax rate
    const total = subtotal + tax;

    setFormData(prev => {
      // Only update if values changed to avoid infinite loop
      if (prev.subtotal === subtotal && prev.tax === tax && prev.total === total) {
        return prev;
      }
      return {
        ...prev,
        subtotal,
        tax,
        total
      };
    });
  }, [formData.items]);

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const response = await fetch("/api/analytics?type=customers&period=365");
      const result = await response.json();
      
      if (result.success) {
        setCustomers(result.data.customers || []);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchOpportunities = async () => {
    try {
      setLoadingOpportunities(true);
      const response = await fetch("/api/crm/opportunities?limit=100");
      const result = await response.json();
      
      if (result.success) {
        setOpportunities(result.data.opportunities || []);
      }
    } catch (error) {
      console.error("Error fetching opportunities:", error);
    } finally {
      setLoadingOpportunities(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await fetch("/api/products?limit=100");
      const result = await response.json();
      
      if (result.success) {
        setProducts(result.data.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "subtotal" || name === "tax" || name === "total" ? parseFloat(value) || 0 : value
    }));
  };

  const handleAddProduct = (product: Product) => {
    const existingItemIndex = formData.items.findIndex(item => item.productId === product.id);
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...formData.items];
      updatedItems[existingItemIndex].quantity += 1;
      updatedItems[existingItemIndex].total = updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].price;
      setFormData(prev => ({ ...prev, items: updatedItems }));
    } else {
      // Add new item
      const newItem = {
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        quantity: 1,
        price: product.price,
        total: product.price
      };
      setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    }
    
    setShowProductSelector(false);
  };

  const handleUpdateItemQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(index);
      return;
    }

    const updatedItems = [...formData.items];
    updatedItems[index].quantity = quantity;
    updatedItems[index].total = quantity * updatedItems[index].price;
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const statusOptions = [
    { value: "DRAFT", label: "پیش‌نویس" },
    { value: "SENT", label: "ارسال شده" },
    { value: "VIEWED", label: "مشاهده شده" },
    { value: "ACCEPTED", label: "پذیرفته شده" },
    { value: "REJECTED", label: "رد شده" },
    { value: "EXPIRED", label: "منقضی شده" }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: 'IRR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {quote ? "ویرایش پیشنهاد" : "ایجاد پیشنهاد جدید"}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer and Opportunity Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">اطلاعات پایه</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                مشتری *
              </label>
              <select
                name="customerId"
                value={formData.customerId}
                onChange={handleInputChange}
                required
                disabled={loadingCustomers}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loadingCustomers ? "در حال بارگذاری..." : "انتخاب مشتری"}
                </option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.firstName} {customer.lastName} - {customer.email}
                    {customer.company && ` (${customer.company})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                فرصت فروش
              </label>
              <select
                name="opportunityId"
                value={formData.opportunityId}
                onChange={handleInputChange}
                disabled={loadingOpportunities}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loadingOpportunities ? "در حال بارگذاری..." : "انتخاب فرصت (اختیاری)"}
                </option>
                {opportunities.map((opportunity) => (
                  <option key={opportunity.id} value={opportunity.id}>
                    {opportunity.title} - {formatCurrency(opportunity.value)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quote Items */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">آیتم‌های پیشنهاد</h3>
            <button
              type="button"
              onClick={() => setShowProductSelector(true)}
              className="px-6 py-2 bg-primary-orange text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors duration-200"
            >
              افزودن محصول
            </button>
          </div>

          {formData.items.length > 0 ? (
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-gray-900 dark:text-white font-medium">{item.productName}</div>
                      <div className="text-gray-600 dark:text-gray-400 text-sm">SKU: {item.productSku}</div>
                      <div className="text-gray-600 dark:text-gray-400 text-sm">قیمت: {formatCurrency(item.price)}</div>
                    </div>
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQuantity(index, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
                        >
                          -
                        </button>
                        <span className="text-gray-900 dark:text-white font-medium w-8 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQuantity(index, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-gray-900 dark:text-white font-medium w-24 text-left">
                        {formatCurrency(item.total)}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400">هیچ محصولی اضافه نشده است</p>
            </div>
          )}
        </div>

        {/* Quote Totals */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">خلاصه قیمت</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>جمع کل:</span>
              <span className="font-medium">{formatCurrency(formData.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>مالیات (9%):</span>
              <span className="font-medium">{formatCurrency(formData.tax)}</span>
            </div>
            <div className="flex justify-between text-gray-900 dark:text-white font-bold text-lg border-t-2 border-gray-200 dark:border-gray-700 pt-3">
              <span>مبلغ نهایی:</span>
              <span>{formatCurrency(formData.total)}</span>
            </div>
          </div>
        </div>

        {/* Additional Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">تنظیمات اضافی</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                اعتبار تا *
              </label>
              <input
                type="date"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
              />
            </div>

            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                وضعیت
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={isLoading || formData.items.length === 0}
            className="px-8 py-3 bg-primary-orange text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-orange/30"
          >
            {isLoading ? "در حال ذخیره..." : quote ? "به‌روزرسانی" : "ایجاد"}
          </button>
        </div>
      </form>

      {/* Product Selector Modal */}
      {showProductSelector && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowProductSelector(false);
            }
          }}
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxHeight: '90vh',
              margin: 'auto'
            }}
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">انتخاب محصول</h3>
              <button
                onClick={() => setShowProductSelector(false)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              {loadingProducts ? (
                <div className="text-center text-gray-600 dark:text-gray-400 py-8">در حال بارگذاری محصولات...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => handleAddProduct(product)}
                    >
                      <div className="text-gray-900 dark:text-white font-medium">{product.name}</div>
                      <div className="text-gray-600 dark:text-gray-400 text-sm">SKU: {product.sku}</div>
                      <div className="text-primary-orange font-semibold mt-2">{formatCurrency(product.price)}</div>
                      <div className={`text-xs mt-1 ${product.isInStock ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {product.isInStock ? `موجود (${product.stockQuantity})` : 'ناموجود'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
