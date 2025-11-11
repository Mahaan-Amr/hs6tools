import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { ArticleStatus, LessonContentType, LessonDifficulty } from "@prisma/client";

/**
 * GET /api/education/lessons
 * Get all lessons with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status");
    const featured = searchParams.get("featured");
    const contentType = searchParams.get("contentType");
    const difficulty = searchParams.get("difficulty");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const authorId = searchParams.get("authorId");
    const published = searchParams.get("published"); // For public access

    const skip = (page - 1) * limit;

    const where: {
      deletedAt: null;
      categoryId?: string;
      status?: ArticleStatus;
      isFeatured?: boolean;
      contentType?: LessonContentType;
      difficulty?: LessonDifficulty;
      authorId?: string;
      OR?: Array<{
        title?: { contains: string; mode: "insensitive" };
        excerpt?: { contains: string; mode: "insensitive" };
        content?: { contains: string; mode: "insensitive" };
      }>;
    } = {
      deletedAt: null,
    };

    // For public access, only show published lessons
    if (published === "true") {
      where.status = "PUBLISHED";
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status as ArticleStatus;
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    if (contentType) {
      where.contentType = contentType as LessonContentType;
    }

    if (difficulty) {
      where.difficulty = difficulty as LessonDifficulty;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const [lessons, total] = await Promise.all([
      prisma.educationLesson.findMany({
        where,
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
        orderBy: { sortOrder: "asc" },
        skip,
        take: limit,
      }),
      prisma.educationLesson.count({ where }),
    ]);

    return NextResponse.json({
      data: lessons,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Lessons API Error:", error);
    return NextResponse.json(
      { error: "خطا در دریافت دروس آموزشی" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/education/lessons
 * Create new lesson
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

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

    // Validate required fields
    if (!title || !slug) {
      return NextResponse.json(
        { error: "عنوان و slug الزامی است" },
        { status: 400 }
      );
    }

    // Validate content based on type
    if (contentType === "TEXT" && !content) {
      return NextResponse.json(
        { error: "برای دروس متنی، محتوا الزامی است" },
        { status: 400 }
      );
    }

    if (contentType === "VIDEO" && !videoUrl) {
      return NextResponse.json(
        { error: "برای دروس ویدیویی، آدرس ویدیو الزامی است" },
        { status: 400 }
      );
    }

    if (contentType === "MIXED" && !content && !videoUrl) {
      return NextResponse.json(
        { error: "برای دروس ترکیبی، حداقل یکی از محتوا یا ویدیو الزامی است" },
        { status: 400 }
      );
    }

    // Verify user exists in database before using as authorId
    let authorId: string | null = null;
    if (session.user.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true }
      });
      if (user) {
        authorId = user.id;
      } else {
        console.warn(`User with ID ${session.user.id} not found in database. Setting authorId to null.`);
      }
    }

    // Verify category exists if categoryId is provided
    if (categoryId) {
      const category = await prisma.educationCategory.findUnique({
        where: { id: categoryId },
        select: { id: true }
      });
      if (!category) {
        return NextResponse.json(
          { error: "دسته‌بندی انتخاب شده یافت نشد" },
          { status: 400 }
        );
      }
    }

    const lesson = await prisma.educationLesson.create({
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content: content || null,
        videoUrl: videoUrl || null,
        videoDuration: videoDuration || null,
        thumbnail: thumbnail || null,
        contentType: (contentType as LessonContentType) || "TEXT",
        categoryId: categoryId || null,
        authorId: authorId,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        metaKeywords: metaKeywords || null,
        status: (status as ArticleStatus) || "DRAFT",
        isFeatured: isFeatured || false,
        difficulty: difficulty || "BEGINNER",
        estimatedTime: estimatedTime || null,
        sortOrder: sortOrder || 0,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
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

    return NextResponse.json({ data: lesson }, { status: 201 });
  } catch (error: unknown) {
    console.error("Lesson Creation Error:", error);
    
    if (error && typeof error === "object" && "code" in error) {
      // Handle unique constraint violation (duplicate slug)
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "این slug قبلاً استفاده شده است" },
          { status: 400 }
        );
      }
      
      // Handle foreign key constraint violation
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "خطا در ارتباط با کاربر یا دسته‌بندی. لطفاً دوباره تلاش کنید." },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "خطا در ایجاد درس آموزشی" },
      { status: 500 }
    );
  }
}

