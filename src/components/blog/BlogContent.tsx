import { Article } from "@/types/content";
import BlogCard from "./BlogCard";
import { prisma } from "@/lib/prisma";
import { normalizeUploadUrl } from "@/utils/image-url";

async function getArticles(): Promise<Article[]> {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    include: { category: { select: { id: true, name: true, slug: true } } },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 6,
  });

  return articles.map((article) => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt ?? undefined,
    content: article.content,
    status: article.status,
    isFeatured: article.isFeatured,
    viewCount: article.viewCount,
    createdAt: article.createdAt.toISOString(),
    publishedAt: article.publishedAt?.toISOString(),
    categoryId: article.categoryId ?? undefined,
    featuredImage: normalizeUploadUrl(article.featuredImage) || undefined,
    metaTitle: article.metaTitle ?? undefined,
    metaDescription: article.metaDescription ?? undefined,
    metaKeywords: article.metaKeywords ?? undefined,
    category: article.category ?? undefined,
  }));
}

export default async function BlogContent() {
  const articles = await getArticles();

  if (articles.length === 0) {
    return (
      <div className="text-center py-12" data-scroll-reveal>
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">هیچ مقاله‌ای یافت نشد</h3>
        <p className="text-gray-700 dark:text-gray-300">مقالات جدید به زودی اضافه خواهند شد</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article, index) => (
          <div key={article.id} data-scroll-reveal style={{ transitionDelay: `${index * 0.07}s` }}>
            <BlogCard article={article} />
          </div>
        ))}
      </div>
    </>
  );
}
