import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Review validation schema
const reviewSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  content: z.string().min(10, "Review must be at least 10 characters").max(1000, "Review too long"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5")
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get reviews for the product
    const reviews = await prisma.review.findMany({
      where: {
        productId: id,
        isApproved: true
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Get review statistics
    const stats = await prisma.review.aggregate({
      where: {
        productId: id,
        isApproved: true
      },
      _count: {
        rating: true
      },
      _avg: {
        rating: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        stats: {
          totalReviews: stats._count.rating,
          averageRating: stats._avg.rating || 0
        }
      }
    });

  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch reviews",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validate review data
    const validationResult = reviewSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid review data",
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { title, content, rating } = validationResult.data;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: id,
        userId: session.user.id
      }
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    // Check if user has purchased this product (optional verification)
    // For now, we'll allow all authenticated users to review
    // In production, you might want to verify purchase history

    // Create review
    const review = await prisma.review.create({
      data: {
        productId: id,
        userId: session.user.id,
        title,
        content,
        rating,
        isApproved: false, // Reviews need admin approval by default
        isVerified: false
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: review,
      message: "Review submitted successfully and pending approval"
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to create review",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
