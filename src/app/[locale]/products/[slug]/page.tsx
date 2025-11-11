import { getMessages } from "@/lib/i18n";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  title?: string;
  isPrimary: boolean;
  sortOrder: number;
}

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  comparePrice?: number;
  stockQuantity: number;
  isInStock: boolean;
  attributes: Record<string, string | number>;
}

interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface ProductReview {
  id: string;
  title?: string;
  content: string;
  rating: number;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface Product {
  id: string;
  slug: string;
  name: string;
  description?: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  stockQuantity: number;
  isInStock: boolean;
  allowBackorders: boolean;
  weight?: number;
  dimensions?: Record<string, number>;
  material?: string;
  warranty?: string;
  brand?: string;
  isFeatured: boolean;
  category: ProductCategory;
  images: ProductImage[];
  variants: ProductVariant[];
  reviews: ProductReview[];
  _count: {
    reviews: number;
    variants: number;
  };
}

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/products/search?slug=${slug}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

async function getRelatedProducts(categoryId: string, excludeProductId: string): Promise<Product[]> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/products?categoryId=${categoryId}&limit=4&exclude=${excludeProductId}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  const t = await getMessages(locale);
  
  const product = await getProduct(slug);
  
  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.category.id, product.id);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {
      style: "currency",
      currency: locale === "fa" ? "IRR" : "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === "fa" ? "fa-IR" : "en-US");
  };

  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
  const hasVariants = product.variants.length > 0;
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumbs */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <li>
              <Link href={`/${locale}`} className="hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                {t.navigation.home}
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li>
              <Link href={`/${locale}/categories`} className="hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                {t.products.categories}
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li>
              <Link href={`/${locale}/categories/${product.category.slug}`} className="hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                {product.category.name}
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 dark:text-white">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden glass">
              {primaryImage ? (
                <Image
                  src={primaryImage.url}
                  alt={primaryImage.alt || product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              
              {/* Featured Badge */}
              {product.isFeatured && (
                <div className="absolute top-4 right-4">
                  <span className="bg-gradient-to-r from-primary-orange to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    ویژه
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.slice(0, 4).map((image) => (
                  <div key={image.id} className="relative aspect-square rounded-2xl overflow-hidden glass cursor-pointer hover:ring-2 ring-primary-orange transition-all duration-200">
                    <Image
                      src={image.url}
                      alt={image.alt || product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category */}
            <div>
              <Link 
                href={`/${locale}/categories/${product.category.slug}`}
                className="inline-block bg-primary-orange/20 text-primary-orange px-3 py-1 rounded-full text-sm font-medium hover:bg-primary-orange/30 transition-colors duration-200"
              >
                {product.category.name}
              </Link>
            </div>

            {/* Product Name */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-gray-600 dark:text-gray-400 line-through">
                    {formatPrice(product.comparePrice!)}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <div className="text-sm text-green-400">
                  {Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)}% تخفیف
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${product.isInStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`text-sm ${product.isInStock ? 'text-green-400' : 'text-red-400'}`}>
                {product.isInStock ? 'موجود' : 'ناموجود'}
              </span>
              {product.isInStock && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ({product.stockQuantity} عدد)
                </span>
              )}
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed text-justify">
                {product.shortDescription}
              </p>
            )}

            {/* Variants */}
            {hasVariants && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">انتخاب گزینه</h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.variants.map((variant) => (
                    <div key={variant.id} className="glass rounded-xl p-4 cursor-pointer hover:ring-2 ring-primary-orange transition-all duration-200">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{variant.name}</div>
                      <div className="font-semibold text-gray-900 dark:text-white mb-2">
                        {formatPrice(variant.price)}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        موجودی: {variant.stockQuantity} عدد
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                  product.isInStock
                    ? "bg-gradient-to-r from-primary-orange to-orange-500 text-white hover:shadow-glass-orange hover:scale-105"
                    : "bg-gray-600 text-gray-300 cursor-not-allowed"
                }`}
                disabled={!product.isInStock}
              >
                {product.isInStock ? "افزودن به سبد خرید" : "ناموجود"}
              </button>
              
              <button className="w-full py-4 px-6 glass border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-200">
                افزودن به لیست علاقه‌مندی
              </button>
            </div>

            {/* Product Details */}
            <div className="glass rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">مشخصات محصول</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {product.brand && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">برند:</span>
                    <span className="text-gray-900 dark:text-white ml-2">{product.brand}</span>
                  </div>
                )}
                {product.material && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">جنس:</span>
                    <span className="text-gray-900 dark:text-white ml-2">{product.material}</span>
                  </div>
                )}
                {product.weight && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">وزن:</span>
                    <span className="text-gray-900 dark:text-white ml-2">{product.weight} گرم</span>
                  </div>
                )}
                {product.warranty && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">گارانتی:</span>
                    <span className="text-gray-900 dark:text-white ml-2">{product.warranty}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        {product.description && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">توضیحات محصول</h2>
            <div className="glass rounded-3xl p-8">
              <div className="prose prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>
            </div>
          </div>
        )}

        {/* Reviews */}
        {product.reviews.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              نظرات ({product._count.reviews})
            </h2>
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <div key={review.id} className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-orange/20 rounded-full flex items-center justify-center">
                        <span className="text-primary-orange font-semibold">
                          {review.user.firstName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {review.user.firstName} {review.user.lastName}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(review.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5" fill={i < review.rating ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  {review.title && (
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{review.title}</h4>
                  )}
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{review.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">محصولات مرتبط</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} href={`/${locale}/products/${relatedProduct.slug}`}>
                  <div className="glass rounded-2xl overflow-hidden hover:scale-105 transition-transform duration-200">
                    <div className="aspect-square relative">
                      {relatedProduct.images[0] && (
                        <Image
                          src={relatedProduct.images[0].url}
                          alt={relatedProduct.images[0].alt || relatedProduct.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {relatedProduct.name}
                      </h3>
                      <div className="text-primary-orange font-bold">
                        {formatPrice(relatedProduct.price)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
