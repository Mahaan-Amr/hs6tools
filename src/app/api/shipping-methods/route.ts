import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/shipping-methods - Get active shipping methods (public endpoint)
export async function GET() {
  try {
    const shippingMethods = await prisma.shippingMethodConfig.findMany({
      where: { isActive: true },
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "desc" }
      ],
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        estimatedDays: true,
      }
    });

    return NextResponse.json({ success: true, data: shippingMethods });
  } catch (error) {
    console.error("Error fetching active shipping methods:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

