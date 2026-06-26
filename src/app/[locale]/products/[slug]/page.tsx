import { getMessages } from "@/lib/i18n";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatPrice as formatPriceUtil } from "@/utils/format";
import { getCurrentWishlistProductIds, getPublicProductBySlug, getPublicProducts } from "@/lib/catalog";
import ProductDetailActions from "@/components/ecommerce/ProductDetailActions";
import ProductImageGallery from "@/components/ecommerce/ProductImageGallery";

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  const t = await getMessages(locale);
  
  const product = await getPublicProductBySlug(slug);
  
  if (!product) {
    notFound();
  }

  const [{ products: relatedProducts }, wishlistProductIds] = await Promise.all([
    getPublicProducts({
      categoryId: product.category.id,
      excludeProductId: product.id,
      limit: 4,
    }),
    getCurrentWishlistProductIds(),
  ]);
  
  const formatPrice = (price: number) => {
    // Use centralized utility that converts Rials to Tomans
    return formatPriceUtil(price, locale);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === "fa" ? "fa-IR" : "en-US");
  };

  const hasDiscount = Boolean(product.comparePrice && product.comparePrice > product.price);
  const hasProductSpecs = Boolean(
    product.brand ||
    product.material ||
    (product.weight !== undefined && product.weight > 0) ||
    product.warranty
  );

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
          <ProductImageGallery
            images={product.images}
            productName={product.name}
            isFeatured={product.isFeatured}
            featuredLabel={t.products.featured}
          />

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
                  {Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)}{t.products.discountPercent}
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${product.isInStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`text-sm ${product.isInStock ? 'text-green-400' : 'text-red-400'}`}>
                {product.isInStock ? t.products.inStock : t.products.outOfStock}
              </span>
              {product.isInStock && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ({product.stockQuantity} {t.products.stockCount})
                </span>
              )}
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed text-justify">
                {product.shortDescription}
              </p>
            )}

            {/* Action Buttons */}
            <ProductDetailActions
              product={product}
              locale={locale}
              messages={t}
              initialIsInWishlist={wishlistProductIds.includes(product.id)}
            />

            {/* Product Details */}
            {hasProductSpecs && (
              <div className="glass rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.products.productSpecs}</h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {product.brand && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">{t.products.brand}</span>
                      <span className="text-gray-900 dark:text-white ml-2">{product.brand}</span>
                    </div>
                  )}
                  {product.material && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">{t.products.material}</span>
                      <span className="text-gray-900 dark:text-white ml-2">{product.material}</span>
                    </div>
                  )}
                  {product.weight !== undefined && product.weight > 0 && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">{t.products.weight}</span>
                      <span className="text-gray-900 dark:text-white ml-2">{product.weight} {t.products.weightUnit}</span>
                    </div>
                  )}
                  {product.warranty && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">{t.products.warranty}</span>
                      <span className="text-gray-900 dark:text-white ml-2">{product.warranty}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Description */}
        {product.description && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t.products.productDescription}</h2>
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
              {t.products.reviews} ({product._count.reviews})
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t.products.relatedProducts}</h2>
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
