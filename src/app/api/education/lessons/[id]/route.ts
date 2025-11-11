import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { ArticleStatus, LessonContentType, LessonDifficulty } from "@prisma/client";

/**
 * GET /api/education/lessons/[id]
 * Get single lesson by ID or slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const incrementView = searchParams.get("incrementView") === "true";

    const lesson = await prisma.educationLesson.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
        deletedAt: null,
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "درس آموزشی یافت نشد" },
        { status: 404 }
      );
    }

    // Increment view count if requested
    if (incrementView) {
      await prisma.educationLesson.update({
        where: { id: lesson.id },
        data: { viewCount: { increment: 1 } },
      });
    }

    return NextResponse.json({ data: lesson });
  } catch (error) {
    console.error("Lesson API Error:", error);
    return NextResponse.json(
      { error: "خطا در دریافت درس آموزشی" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/education/lessons/[id]
 * Update lesson
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      videoUrl,
      videoDuration,
      thumbnail,
      contentType,
      categoryId,
      metaTitle,
      metaDescription,
      metaKeywords,
      status,
      isFeatured,
      difficulty,
      estimatedTime,
      sortOrder,
    } = body;

    // Check if lesson exists
    const existingLesson = await prisma.educationLesson.findUnique({
      where: { id },
    });

    if (!existingLesson) {
      return NextResponse.json(
        { error: "درس آموزشی یافت نشد" },
        { status: 404 }
      );
    }

    // Validate content based on type
    const finalContentType = contentType || existingLesson.contentType;
    if (finalContentType === "TEXT" && !content) {
      return NextResponse.json(
        { error: "برای دروس متنی، محتوا الزامی است" },
        { status: 400 }
      );
    }

    if (finalContentType === "VIDEO" && !videoUrl) {
      return NextResponse.json(
        { error: "برای دروس ویدیویی، آدرس ویدیو الزامی است" },
        { status: 400 }
      );
    }

    const updateData: {
      title?: string;
      slug?: string;
      excerpt?: string | null;
      content?: string | null;
      videoUrl?: string | null;
      videoDuration?: number | null;
      thumbnail?: string | null;
      contentType?: LessonContentType;
      categoryId?: string | null;
      metaTitle?: string | null;
      metaDescription?: string | null;
      metaKeywords?: string | null;
      status?: ArticleStatus;
      publishedAt?: Date | null;
      isFeatured?: boolean;
      difficulty?: LessonDifficulty;
      estimatedTime?: number | null;
      sortOrder?: number;
    } = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content !== undefined) updateData.content = content;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (videoDuration !== undefined) updateData.videoDuration = videoDuration;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (contentType !== undefined) updateData.contentType = contentType;
    if (categoryId !== undefined) updateData.categoryId = categoryId || null;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    if (metaKeywords !== undefined) updateData.metaKeywords = metaKeywords;
    if (status !== undefined) {
      updateData.status = status;
      // Set publishedAt if status is PUBLISHED and it wasn't published before
      if (status === "PUBLISHED" && !existingLesson.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (estimatedTime !== undefined) updateData.estimatedTime = estimatedTime;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const lesson = await prisma.educationLesson.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ data: lesson });
  } catch (error: unknown) {
    console.error("Lesson Update Error:", error);
    
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "این slug قبلاً استفاده شده است" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "خطا در به‌روزرسانی درس آموزشی" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/education/lessons/[id]
 * Soft delete lesson
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const lesson = await prisma.educationLesson.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ data: lesson });
  } catch (error) {
    console.error("Lesson Delete Error:", error);
    return NextResponse.json(
      { error: "خطا در حذف درس آموزشی" },
      { status: 500 }
    );
  }
}

