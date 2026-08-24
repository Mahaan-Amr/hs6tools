import type { Metadata } from "next";
import ResilientImage from "@/components/shared/ResilientImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createPageMetadata } from "@/lib/seo";
import { normalizeUploadUrl } from "@/utils/image-url";
import { sanitizeRichContent } from "@/lib/rich-content";

interface ArticlePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

async function getArticle(slug: string) {
  return prisma.article.findFirst({
    where: { slug, status: "PUBLISHED", deletedAt: null },
    include: { category: { select: { name: true, slug: true } } },
  });
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};

  return createPageMetadata({
    locale,
    path: `/blog/${article.slug}`,
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt || article.title,
    keywords: article.metaKeywords || undefined,
    image: normalizeUploadUrl(article.featuredImage) || undefined,
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { locale, slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const featuredImage = normalizeUploadUrl(article.featuredImage);
  const date = (article.publishedAt || article.createdAt).toLocaleDateString(
    locale === "fa" ? "fa-IR" : locale === "ar" ? "ar" : "en",
    { year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-20 dark:from-primary-black dark:via-gray-900 dark:to-primary-black">
      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <nav className="mb-8 text-sm text-gray-500 dark:text-gray-400">
          <Link href={`/${locale}/blog`} className="hover:text-primary-orange">
            {locale === "fa" ? "وبلاگ" : locale === "ar" ? "المدونة" : "Blog"}
          </Link>
          <span className="mx-2">/</span>
          <span>{article.title}</span>
        </nav>

        <header className="mb-10">
          {article.category && (
            <p className="mb-3 font-medium text-primary-orange">
              {article.category.name}
            </p>
          )}
          <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white md:text-5xl">
            {article.title}
          </h1>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            {date}
          </p>
          {article.excerpt && (
            <p className="mt-6 text-xl leading-9 text-gray-600 dark:text-gray-300">
              {article.excerpt}
            </p>
          )}
        </header>

        {featuredImage && (
          <div className="relative mb-10 aspect-video overflow-hidden rounded-3xl bg-gray-200 dark:bg-gray-800">
            <ResilientImage
              src={featuredImage}
              alt={article.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </div>
        )}

        <div
          className="rounded-3xl border border-gray-200 bg-white/85 p-7 leading-8 text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 md:p-10 [&_h2]:mb-4 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 dark:[&_h2]:text-white [&_h3]:mb-3 [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:mb-2 [&_p]:mb-5 [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:px-6"
          dangerouslySetInnerHTML={{
            __html: sanitizeRichContent(article.content),
          }}
        />
      </article>
    </div>
  );
}
