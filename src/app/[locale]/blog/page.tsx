import { Suspense } from "react";
import type { Metadata } from "next";
import BlogContent from "@/components/blog/BlogContent";
import BlogSkeleton from "@/components/blog/BlogSkeleton";
import { getMessages } from "@/lib/i18n";
import { createPageMetadata } from "@/lib/seo";

interface BlogPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages(locale);

  return createPageMetadata({
    locale,
    path: "/blog",
    title: String(messages.blog?.title || "Blog"),
    description: String(messages.blog?.subtitle || "HS6Tools articles and guides"),
  });
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;
  const t = await getMessages(locale);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12" data-scroll-reveal>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t.blog?.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-justify leading-relaxed">
            {t.blog?.subtitle}
          </p>
        </div>

        {/* Blog Content */}
        <Suspense fallback={<BlogSkeleton />}>
          <BlogContent />
        </Suspense>
      </div>
    </div>
  );
}
