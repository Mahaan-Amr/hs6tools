import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LessonContent from "./LessonContent";

interface LessonPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { locale, slug } = await params;

  // Fetch lesson
  const lesson = await prisma.educationLesson.findFirst({
    where: {
      slug,
      deletedAt: null,
      status: "PUBLISHED",
    },
    include: {
      category: true,
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!lesson) {
    notFound();
  }

  // Increment view count
  await prisma.educationLesson.update({
    where: { id: lesson.id },
    data: { viewCount: { increment: 1 } },
  });

  // Fetch related lessons
  const relatedLessons = await prisma.educationLesson.findMany({
    where: {
      categoryId: lesson.categoryId,
      id: { not: lesson.id },
      deletedAt: null,
      status: "PUBLISHED",
    },
    take: 4,
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-primary-black dark:via-gray-900 dark:to-primary-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LessonContent lesson={lesson} relatedLessons={relatedLessons} locale={locale} />
      </div>
    </div>
  );
}

