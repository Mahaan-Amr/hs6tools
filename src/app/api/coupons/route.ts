import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DiscountType, CouponApplicableTo, Prisma } from "@prisma/client";

// GET /api/coupons - List all coupons (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const isActive = searchParams.get("isActive");

    const where: Prisma.CouponWhereInput = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    const skip = (page - 1) * limit;

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.coupon.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: coupons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

// POST /api/coupons - Create new coupon (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      code,
      description,
      discountType,
      discountValue,
      minimumAmount,
      maximumDiscount,
      usageLimit,
      userUsageLimit,
      validFrom,
      validUntil,
      isActive,
      applicableTo,
      categoryIds,
      productIds,
    } = body;

    // Validation
    if (!code || !discountType || !discountValue || !validFrom || !validUntil) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate discount value
    if (discountType === "PERCENTAGE" && (discountValue < 0 || discountValue > 100)) {
      return NextResponse.json(
        { success: false, error: "Percentage discount must be between 0 and 100" },
        { status: 400 }
      );
    }

    if (discountType === "FIXED_AMOUNT" && discountValue < 0) {
      return NextResponse.json(
        { success: false, error: "Fixed amount discount must be positive" },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existingCoupon) {
      return NextResponse.json(
        { success: false, error: "Coupon code already exists" },
        { status: 400 }
      );
    }

    // Validate dates
    const fromDate = new Date(validFrom);
    const untilDate = new Date(validUntil);
    if (untilDate <= fromDate) {
      return NextResponse.json(
        { success: false, error: "Valid until date must be after valid from date" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description,
        discountType: discountType as DiscountType,
        discountValue,
        minimumAmount: minimumAmount || null,
        maximumDiscount: maximumDiscount || null,
        usageLimit: usageLimit || null,
        userUsageLimit: userUsageLimit || 1,
        validFrom: fromDate,
        validUntil: untilDate,
        isActive: isActive !== undefined ? isActive : true,
        applicableTo: (applicableTo || "ALL") as CouponApplicableTo,
        categoryIds: categoryIds || [],
        productIds: productIds || [],
      },
    });

    return NextResponse.json({
      success: true,
      data: coupon,
      message: "Coupon created successfully",
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}

