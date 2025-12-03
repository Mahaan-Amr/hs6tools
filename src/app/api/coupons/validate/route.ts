import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/coupons/validate - Validate coupon code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, subtotal, items } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Coupon code is required" },
        { status: 400 }
      );
    }

    if (!subtotal || subtotal <= 0) {
      return NextResponse.json(
        { success: false, error: "Subtotal is required" },
        { status: 400 }
      );
    }

    // Find coupon by code
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: "کد تخفیف معتبر نیست" },
        { status: 404 }
      );
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json(
        { success: false, error: "این کد تخفیف فعال نیست" },
        { status: 400 }
      );
    }

    // Check validity dates
    const now = new Date();
    if (now < coupon.validFrom) {
      return NextResponse.json(
        { success: false, error: "این کد تخفیف هنوز فعال نشده است" },
        { status: 400 }
      );
    }

    if (now > coupon.validUntil) {
      return NextResponse.json(
        { success: false, error: "این کد تخفیف منقضی شده است" },
        { status: 400 }
      );
    }

    // Check usage limit
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, error: "این کد تخفیف به پایان رسیده است" },
        { status: 400 }
      );
    }

    // Check minimum amount
    if (coupon.minimumAmount && subtotal < Number(coupon.minimumAmount)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `حداقل مبلغ سفارش برای استفاده از این کد تخفیف ${Number(coupon.minimumAmount).toLocaleString('fa-IR')} تومان است` 
        },
        { status: 400 }
      );
    }

    // Check if coupon applies to items
    if (coupon.applicableTo === "CATEGORIES" && coupon.categoryIds.length > 0) {
      if (!items || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json(
          { success: false, error: "Items are required for category-specific coupons" },
          { status: 400 }
        );
      }

      // Fetch product categoryIds from database
      const productIds = items
        .map((item: { productId?: string }) => item.productId)
        .filter(Boolean) as string[];

      if (productIds.length === 0) {
        return NextResponse.json(
          { success: false, error: "این کد تخفیف برای محصولات انتخابی شما اعمال نمی‌شود" },
          { status: 400 }
        );
      }

      const products = await prisma.product.findMany({
        where: {
          id: { in: productIds },
        },
        select: {
          id: true,
          categoryId: true,
        },
      });

      const itemCategoryIds = products.map((p) => p.categoryId);
      const hasApplicableCategory = coupon.categoryIds.some((catId: string) =>
        itemCategoryIds.includes(catId)
      );

      if (!hasApplicableCategory) {
        return NextResponse.json(
          { success: false, error: "این کد تخفیف برای محصولات انتخابی شما اعمال نمی‌شود" },
          { status: 400 }
        );
      }
    }

    if (coupon.applicableTo === "PRODUCTS" && coupon.productIds.length > 0) {
      if (!items || !Array.isArray(items)) {
        return NextResponse.json(
          { success: false, error: "Items are required for product-specific coupons" },
          { status: 400 }
        );
      }

      // Check if any item is in applicable products
      const itemProductIds = items
        .map((item: { productId?: string }) => item.productId)
        .filter(Boolean);
      
      const hasApplicableProduct = coupon.productIds.some((prodId: string) =>
        itemProductIds.includes(prodId)
      );

      if (!hasApplicableProduct) {
        return NextResponse.json(
          { success: false, error: "این کد تخفیف برای محصولات انتخابی شما اعمال نمی‌شود" },
          { status: 400 }
        );
      }
    }

    // Check user usage limit (if user is authenticated)
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      const userOrderCount = await prisma.order.count({
        where: {
          userId: session.user.id,
          couponId: coupon.id,
        },
      });

      if (userOrderCount >= coupon.userUsageLimit) {
        return NextResponse.json(
          { success: false, error: "شما قبلاً از این کد تخفیف استفاده کرده‌اید" },
          { status: 400 }
        );
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (subtotal * Number(coupon.discountValue)) / 100;
    } else {
      discountAmount = Number(coupon.discountValue);
    }

    // Apply maximum discount limit if set
    if (coupon.maximumDiscount && discountAmount > Number(coupon.maximumDiscount)) {
      discountAmount = Number(coupon.maximumDiscount);
    }

    // Ensure discount doesn't exceed subtotal
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    return NextResponse.json({
      success: true,
      data: {
        coupon: {
          id: coupon.id,
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
        },
        discountAmount: Math.round(discountAmount),
      },
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}

