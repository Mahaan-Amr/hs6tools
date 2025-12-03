import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DiscountType, CouponApplicableTo } from "@prisma/client";

// GET /api/coupons/[id] - Get single coupon (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const coupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: "Coupon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch coupon" },
      { status: 500 }
    );
  }
}

// PUT /api/coupons/[id] - Update coupon (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Check if coupon exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existingCoupon) {
      return NextResponse.json(
        { success: false, error: "Coupon not found" },
        { status: 404 }
      );
    }

    // If code is being changed, check if new code exists
    if (body.code && body.code !== existingCoupon.code) {
      const codeExists = await prisma.coupon.findUnique({
        where: { code: body.code.toUpperCase() },
      });

      if (codeExists) {
        return NextResponse.json(
          { success: false, error: "Coupon code already exists" },
          { status: 400 }
        );
      }
    }

    // Validate discount value if provided
    const discountType = body.discountType || existingCoupon.discountType;
    const discountValue = body.discountValue !== undefined ? body.discountValue : existingCoupon.discountValue;

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

    // Validate dates if provided
    const validFrom = body.validFrom ? new Date(body.validFrom) : existingCoupon.validFrom;
    const validUntil = body.validUntil ? new Date(body.validUntil) : existingCoupon.validUntil;

    if (validUntil <= validFrom) {
      return NextResponse.json(
        { success: false, error: "Valid until date must be after valid from date" },
        { status: 400 }
      );
    }

    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: body.code ? body.code.toUpperCase() : undefined,
        description: body.description !== undefined ? body.description : undefined,
        discountType: body.discountType ? (body.discountType as DiscountType) : undefined,
        discountValue: body.discountValue !== undefined ? body.discountValue : undefined,
        minimumAmount: body.minimumAmount !== undefined ? body.minimumAmount : undefined,
        maximumDiscount: body.maximumDiscount !== undefined ? body.maximumDiscount : undefined,
        usageLimit: body.usageLimit !== undefined ? body.usageLimit : undefined,
        userUsageLimit: body.userUsageLimit !== undefined ? body.userUsageLimit : undefined,
        validFrom: body.validFrom ? new Date(body.validFrom) : undefined,
        validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
        applicableTo: body.applicableTo ? (body.applicableTo as CouponApplicableTo) : undefined,
        categoryIds: body.categoryIds !== undefined ? body.categoryIds : undefined,
        productIds: body.productIds !== undefined ? body.productIds : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedCoupon,
      message: "Coupon updated successfully",
    });
  } catch (error) {
    console.error("Error updating coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update coupon" },
      { status: 500 }
    );
  }
}

// DELETE /api/coupons/[id] - Delete coupon (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if coupon exists
    const coupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: "Coupon not found" },
        { status: 404 }
      );
    }

    // Check if coupon has been used
    const orderCount = await prisma.order.count({
      where: { couponId: id },
    });

    if (orderCount > 0) {
      // Soft delete by deactivating instead of deleting
      await prisma.coupon.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        success: true,
        message: "Coupon deactivated (cannot delete used coupons)",
      });
    }

    // Hard delete if not used
    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}

