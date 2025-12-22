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
    
    // Log full error details for debugging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      
      // Check if it's a Prisma error about missing table
      if (error.message.includes("does not exist") || error.message.includes("P2021")) {
        console.error("❌ CRITICAL: shipping_methods table does not exist in database!");
        console.error("❌ Please run: npx prisma migrate deploy");
      }
    }
    
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

