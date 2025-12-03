"use client";

import { useState, useEffect } from "react";
import { AdminProduct, CreateProductData, UpdateProductData, AdminCategory } from "@/types/admin";
import { formatPrice } from "@/utils/format";
import ImageUpload from "@/components/admin/common/ImageUpload";
import { getMessages, Messages } from "@/lib/i18n";

interface ImageFile {
  id: string;
  name: string;
  originalName: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  isPrimary?: boolean;
  alt?: string;
  title?: string;
}

interface ProductFormProps {
  product?: AdminProduct;
  categories: AdminCategory[];
  onSave: (data: CreateProductData | UpdateProductData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  locale: string;
}

export default function ProductForm({ 
  product, 
  categories, 
  onSave, 
  onCancel, 
  isLoading = false,
  locale
}: ProductFormProps) {
  const isEditing = !!product;
  
  const [messages, setMessages] = useState<Messages | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await getMessages(locale);
      setMessages(msgs);
    };
    loadMessages();
  }, [locale]);

  const [formData, setFormData] = useState<CreateProductData>({
    sku: product?.sku || '',
    name: product?.name || '',                    // Persian name (for admin)
    slug: product?.slug || '',
    description: product?.description || '',       // Persian description (for admin)
    shortDescription: product?.shortDescription || '', // Persian short description (for admin)
    price: product?.price || 0,
    comparePrice: product?.comparePrice || 0,
    costPrice: product?.costPrice || 0,
    stockQuantity: product?.stockQuantity || 0,
    lowStockThreshold: product?.lowStockThreshold || 5,
    isInStock: product?.isInStock ?? true,
    allowBackorders: product?.allowBackorders ?? false,
    weight: product?.weight || 0,
    dimensions: product?.dimensions || {},
    material: product?.material || '',
    warranty: product?.warranty || '',
    brand: product?.brand || '',
    categoryId: product?.categoryId || '',
    metaTitle: product?.metaTitle || '',
    metaDescription: product?.metaDescription || '',
    metaKeywords: product?.metaKeywords || '',
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
    sortOrder: product?.sortOrder || 0,
    // Multilingual fields for customer-facing website
    nameEn: product?.nameEn || '',
    nameAr: product?.nameAr || '',
    descriptionEn: product?.descriptionEn || '',
    descriptionAr: product?.descriptionAr || '',
    shortDescriptionEn: product?.shortDescriptionEn || '',
    shortDescriptionAr: product?.shortDescriptionAr || ''
  });

  const [images, setImages] = useState<ImageFile[]>([]);

  // Load existing images when editing
  useEffect(() => {
    if (product?.images) {
      const existingImages: ImageFile[] = product.images.map(img => ({
        id: img.id,
        name: img.url.split('/').pop() || 'image',
        originalName: img.alt || img.title || 'image',
        url: img.url,
        size: 0, // We don't have size info for existing images
        type: 'image/jpeg', // Default type for existing images
        uploadedAt: img.createdAt,
        isPrimary: img.isPrimary,
        alt: img.alt,
        title: img.title
      }));
      setImages(existingImages);
    }
  }, [product]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showMultilingual, setShowMultilingual] = useState(false);

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  if (!messages || !messages.admin?.productsForm) {
    return <div className="text-white p-4">Loading...</div>;
  }

  const t = messages.admin.productsForm;

  const handleInputChange = (field: keyof CreateProductData, value: string | number | boolean | Record<string, unknown>) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Auto-generate slug from name
    if (field === 'name' && !isEditing && typeof value === 'string') {
      setFormData(prev => ({ ...prev, slug: generateSlug(value) }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.sku.trim()) {
      newErrors.sku = String(t.skuRequired);
    }

    if (!formData.name.trim()) {
      newErrors.name = String(t.nameRequired);
    }

    if (!formData.slug.trim()) {
      newErrors.slug = String(t.slugRequired);
    }

    if (formData.price <= 0) {
      newErrors.price = String(t.priceRequired);
    }

    if (formData.stockQuantity < 0) {
      newErrors.stockQuantity = String(t.stockRequired);
    }

    if (!formData.categoryId) {
      newErrors.categoryId = String(t.categoryRequired);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Validate that at least one image is uploaded
    if (images.length === 0) {
      setErrors(prev => ({ ...prev, images: String(t.imagesRequired) }));
      return;
    }

    // Convert images to the format expected by the API
    const productImages = images.map((image, index) => ({
      id: image.id,
      productId: '', // Will be set by the API
      url: image.url,
      alt: image.alt || image.originalName,
      title: image.title || image.originalName,
      sortOrder: index,
      isPrimary: index === 0, // First image is primary
      createdAt: image.uploadedAt
    }));

    const submitData = isEditing 
      ? { ...formData, id: product.id, images: productImages } as UpdateProductData
      : { ...formData, images: productImages };

    onSave(submitData);
  };

  const handleDimensionsChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [field]: numValue
      }
    }));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{String(t.basicInfo)}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SKU */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                SKU <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange ${
                  errors.sku ? 'border-red-500' : ''
                }`}
                placeholder="مثال: DISC-001"
                disabled={isEditing} // SKU cannot be changed after creation
              />
              {errors.sku && <p className="mt-1 text-sm text-red-400">{errors.sku}</p>}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {String(t.productName)} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange ${
                  errors.name ? 'border-red-500' : ''
                }`}
                placeholder={String(t.productName)}
              />
              {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {String(t.slug)} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange ${
                  errors.slug ? 'border-red-500' : ''
                }`}
                placeholder={String(t.slug)}
              />
              {errors.slug && <p className="mt-1 text-sm text-red-400">{errors.slug}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {String(t.category)} <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => handleInputChange('categoryId', e.target.value)}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange ${
                  errors.categoryId ? 'border-red-500' : ''
                }`}
              >
                <option value="">{String(t.selectCategory)}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="mt-1 text-sm text-red-400">{errors.categoryId}</p>}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {String(t.price)} <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange ${
                  errors.price ? 'border-red-500' : ''
                }`}
                placeholder="0"
                min="0"
                step="1000"
              />
              {errors.price && <p className="mt-1 text-sm text-red-400">{errors.price}</p>}
              {formData.price > 0 && (
                <p className="mt-1 text-sm text-gray-400">
                  {formatPrice(formData.price)}
                </p>
              )}
            </div>

            {/* Compare Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {String(t.comparePrice)}
              </label>
              <input
                type="number"
                value={formData.comparePrice}
                onChange={(e) => handleInputChange('comparePrice', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange"
                placeholder="0"
                min="0"
                step="1000"
              />
              {formData.comparePrice && formData.comparePrice > 0 && (
                <p className="mt-1 text-sm text-gray-400">
                  {formatPrice(formData.comparePrice)}
                </p>
              )}
            </div>

            {/* Stock Quantity */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {String(t.stock)} <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => handleInputChange('stockQuantity', parseInt(e.target.value) || 0)}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange ${
                  errors.stockQuantity ? 'border-red-500' : ''
                }`}
                placeholder="0"
                min="0"
              />
              {errors.stockQuantity && <p className="mt-1 text-sm text-red-400">{errors.stockQuantity}</p>}
            </div>

            {/* Low Stock Threshold */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {String(t.lowStockThreshold)}
              </label>
              <input
                type="number"
                value={formData.lowStockThreshold}
                onChange={(e) => handleInputChange('lowStockThreshold', parseInt(e.target.value) || 5)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange"
                placeholder="5"
                min="0"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              توضیحات کوتاه
            </label>
            <textarea
              value={formData.shortDescription}
              onChange={(e) => handleInputChange('shortDescription', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange"
              placeholder={String(t.shortDescription)}
            />
          </div>

          {/* Full Description */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              توضیحات کامل
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={6}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange"
              placeholder={String(t.description)}
            />
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{String(t.productImages)}</h3>
          <ImageUpload
            images={images}
            onImagesChange={setImages}
            multiple={true}
            maxImages={10}
            label={String(t.productImages)}
            required={true}
            category="products"
          />
          {errors.images && <p className="mt-1 text-sm text-red-400">{errors.images}</p>}
          <p className="text-sm text-gray-400 mt-2">
            {String(t.imagesRequiredMessage)}
          </p>
        </div>

        {/* Multilingual Section */}
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{String(t.translations)}</h3>
            <button
              type="button"
              onClick={() => setShowMultilingual(!showMultilingual)}
              className="flex items-center space-x-2 space-x-reverse text-primary-orange hover:text-orange-400 transition-colors"
            >
              <span>{showMultilingual ? String(t.hide) : String(t.show)}</span>
              <svg
                className={`w-5 h-5 transition-transform ${showMultilingual ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {showMultilingual && (
            <div className="space-y-6">
              {/* English */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2 space-x-reverse">
                  <span className="w-6 h-6 bg-primary-orange/20 text-primary-orange rounded-full flex items-center justify-center text-sm font-bold">EN</span>
                  <span>{String(t.english)}</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      {String(t.nameEn)}
                    </label>
                    <input
                      type="text"
                      value={formData.nameEn}
                      onChange={(e) => handleInputChange('nameEn', e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange"
                      placeholder="Product name in English"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      {String(t.shortDescriptionEn)}
                    </label>
                    <textarea
                      value={formData.shortDescriptionEn}
                      onChange={(e) => handleInputChange('shortDescriptionEn', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange"
                      placeholder="Short description in English"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {String(t.descriptionEn)}
                  </label>
                  <textarea
                    value={formData.descriptionEn}
                    onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange"
                    placeholder="Full description in English"
                  />
                </div>
              </div>

              {/* Arabic */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2 space-x-reverse">
                  <span className="w-6 h-6 bg-primary-orange/20 text-primary-orange rounded-full flex items-center justify-center text-sm font-bold">AR</span>
                  <span>{String(t.arabic)}</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      {String(t.nameAr)}
                    </label>
                    <input
                      type="text"
                      value={formData.nameAr}
                      onChange={(e) => handleInputChange('nameAr', e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange"
                      placeholder="اسم المنتج بالعربية"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      {String(t.shortDescriptionAr)}
                    </label>
                    <textarea
                      value={formData.shortDescriptionAr}
                      onChange={(e) => handleInputChange('shortDescriptionAr', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange"
                      placeholder="وصف مختصر بالعربية"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {String(t.descriptionAr)}
                  </label>
                  <textarea
                    value={formData.descriptionAr}
                    onChange={(e) => handleInputChange('descriptionAr', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange"
                      placeholder="وصف كامل بالعربية"
                      dir="rtl"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Advanced Options */}
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{String(t.advancedSettings)}</h3>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2 space-x-reverse text-primary-orange hover:text-orange-400 transition-colors"
            >
              <span>{showAdvanced ? String(t.hide) : String(t.show)}</span>
              <svg 
                className={`w-5 h-5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {showAdvanced && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cost Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {String(t.costPrice)}
                  </label>
                  <input
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => handleInputChange('costPrice', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange"
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {String(t.weight)}
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange"
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </div>

                {/* Material */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {String(t.material)}
                  </label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) => handleInputChange('material', e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange"
                    placeholder="مثال: فولاد، آلومینیوم"
                  />
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {String(t.brand)}
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange"
                    placeholder={String(t.brand)}
                  />
                </div>

                {/* Warranty */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {String(t.warranty)}
                  </label>
                  <input
                    type="text"
                    value={formData.warranty}
                    onChange={(e) => handleInputChange('warranty', e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange"
                    placeholder="مثال: 2 سال"
                  />
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    ترتیب نمایش
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Dimensions */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  ابعاد (میلی‌متر)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="number"
                    placeholder="طول"
                    value={String((formData.dimensions as Record<string, unknown>)?.length || '')}
                    onChange={(e) => handleDimensionsChange('length', e.target.value)}
                    className="px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange"
                    min="0"
                  />
                  <input
                    type="number"
                    placeholder="عرض"
                    value={String((formData.dimensions as Record<string, unknown>)?.width || '')}
                    onChange={(e) => handleDimensionsChange('width', e.target.value)}
                    className="px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange"
                    min="0"
                  />
                  <input
                    type="number"
                    placeholder="ارتفاع"
                    value={String((formData.dimensions as Record<string, unknown>)?.height || '')}
                    onChange={(e) => handleDimensionsChange('height', e.target.value)}
                    className="px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange"
                    min="0"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SEO & Meta */}
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">SEO و متا</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                عنوان متا
              </label>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange"
                placeholder="عنوان برای موتورهای جستجو"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                توضیحات متا
              </label>
              <textarea
                value={formData.metaDescription}
                onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange"
                placeholder="توضیحات برای موتورهای جستجو"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                کلمات کلیدی
              </label>
              <input
                type="text"
                value={formData.metaKeywords}
                onChange={(e) => handleInputChange('metaKeywords', e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange"
                placeholder="کلمات کلیدی با کاما جدا کنید"
              />
            </div>
          </div>
        </div>

        {/* Status & Options */}
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">وضعیت و گزینه‌ها</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="flex items-center space-x-3 space-x-reverse">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="w-5 h-5 text-primary-orange bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-orange focus:ring-2"
                />
                <span className="text-gray-900 dark:text-white">فعال</span>
              </label>

              <label className="flex items-center space-x-3 space-x-reverse">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                  className="w-5 h-5 text-primary-orange bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-orange focus:ring-2"
                />
                <span className="text-white">ویژه</span>
              </label>

              <label className="flex items-center space-x-3 space-x-reverse">
                <input
                  type="checkbox"
                  checked={formData.isInStock}
                  onChange={(e) => handleInputChange('isInStock', e.target.checked)}
                  className="w-5 h-5 text-primary-orange bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-orange focus:ring-2"
                />
                <span className="text-white">موجود</span>
              </label>

              <label className="flex items-center space-x-3 space-x-reverse">
                <input
                  type="checkbox"
                  checked={formData.allowBackorders}
                  onChange={(e) => handleInputChange('allowBackorders', e.target.checked)}
                  className="w-5 h-5 text-primary-orange bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-orange focus:ring-2"
                />
                <span className="text-white">پیش‌فروش</span>
              </label>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 space-x-reverse">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
            disabled={isLoading}
          >
            انصراف
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-primary-orange hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{String(t.saving)}</span>
              </div>
            ) : (
              isEditing ? String(t.update) : String(t.create)
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
