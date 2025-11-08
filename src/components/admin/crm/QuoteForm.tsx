"use client";

import { useState, useEffect } from "react";

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
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          {quote ? "ویرایش پیشنهاد" : "ایجاد پیشنهاد جدید"}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer and Opportunity Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              مشتری *
            </label>
            <select
              name="customerId"
              value={formData.customerId}
              onChange={handleInputChange}
              required
              disabled={loadingCustomers}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-300 mb-2">
              فرصت فروش
            </label>
            <select
              name="opportunityId"
              value={formData.opportunityId}
              onChange={handleInputChange}
              disabled={loadingOpportunities}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
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

        {/* Quote Items */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-300">
              آیتم‌های پیشنهاد
            </label>
            <button
              type="button"
              onClick={() => setShowProductSelector(true)}
              className="px-4 py-2 bg-primary-orange text-white rounded-lg hover:bg-primary-orange-dark transition-colors"
            >
              افزودن محصول
            </button>
          </div>

          {formData.items.length > 0 ? (
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-white font-medium">{item.productName}</div>
                      <div className="text-gray-400 text-sm">SKU: {item.productSku}</div>
                      <div className="text-gray-400 text-sm">قیمت: {formatCurrency(item.price)}</div>
                    </div>
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQuantity(index, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          -
                        </button>
                        <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQuantity(index, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-white font-medium w-24 text-left">
                        {formatCurrency(item.total)}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
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
            <div className="bg-white/5 rounded-lg p-8 text-center text-gray-400">
              هیچ محصولی اضافه نشده است
            </div>
          )}
        </div>

        {/* Quote Totals */}
        <div className="bg-white/5 rounded-lg p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-gray-300">
              <span>جمع کل:</span>
              <span>{formatCurrency(formData.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>مالیات (9%):</span>
              <span>{formatCurrency(formData.tax)}</span>
            </div>
            <div className="flex justify-between text-white font-bold text-lg border-t border-white/10 pt-2">
              <span>مبلغ نهایی:</span>
              <span>{formatCurrency(formData.total)}</span>
            </div>
          </div>
        </div>

        {/* Valid Until and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              اعتبار تا *
            </label>
            <input
              type="date"
              name="validUntil"
              value={formData.validUntil}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              وضعیت
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 space-x-reverse pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={isLoading || formData.items.length === 0}
            className="px-6 py-3 bg-primary-orange text-white rounded-xl hover:bg-primary-orange-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "در حال ذخیره..." : quote ? "به‌روزرسانی" : "ایجاد پیشنهاد"}
          </button>
        </div>
      </form>

      {/* Product Selector Modal */}
      {showProductSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-3xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">انتخاب محصول</h3>
              <button
                onClick={() => setShowProductSelector(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-96">
              {loadingProducts ? (
                <div className="text-center text-gray-400 py-8">در حال بارگذاری محصولات...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => handleAddProduct(product)}
                    >
                      <div className="text-white font-medium">{product.name}</div>
                      <div className="text-gray-400 text-sm">SKU: {product.sku}</div>
                      <div className="text-primary-orange font-medium">{formatCurrency(product.price)}</div>
                      <div className={`text-xs ${product.isInStock ? 'text-green-400' : 'text-red-400'}`}>
                        {product.isInStock ? `موجود (${product.stockQuantity})` : 'ناموجود'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
