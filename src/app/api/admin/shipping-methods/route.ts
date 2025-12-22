import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/shipping-methods - Get all shipping methods
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const shippingMethods = await prisma.shippingMethodConfig.findMany({
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "desc" }
      ]
    });

    return NextResponse.json({ success: true, data: shippingMethods });
  } catch (error) {
    console.error("Error fetching shipping methods:", error);
    
    // Log full error details for debugging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      
      // Check if it's a Prisma error about missing table
      if (error.message.includes("does not exist") || error.message.includes("P2021")) {
        console.error("❌ CRITICAL: shipping_methods table does not exist in database!");
        console.error("❌ Please run: npx prisma migrate deploy");
        return NextResponse.json(
          { 
            success: false, 
            error: "Database table missing. Please run migrations: npx prisma migrate deploy",
            details: process.env.NODE_ENV === "production" ? undefined : error.message
          },
          { status: 500 }
        );
      }
    }
    
    // Provide more detailed error information in development
    const errorMessage = process.env.NODE_ENV === "development" && error instanceof Error
      ? error.message
      : "Internal server error";
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/admin/shipping-methods - Create new shipping method
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, price, estimatedDays, isActive, sortOrder } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    if (price === undefined || price === null || Number(price) < 0) {
      return NextResponse.json(
        { success: false, error: "Valid price is required" },
        { status: 400 }
      );
    }

    if (!estimatedDays || !estimatedDays.trim()) {
      return NextResponse.json(
        { success: false, error: "Estimated days is required" },
        { status: 400 }
      );
    }

    const shippingMethod = await prisma.shippingMethodConfig.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        price: Number(price),
        estimatedDays: estimatedDays.trim(),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
      }
    });

    return NextResponse.json({ success: true, data: shippingMethod });
  } catch (error) {
    console.error("Error creating shipping method:", error);
    
    // Log full error details for debugging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      
      // Check if it's a Prisma error about missing table
      if (error.message.includes("does not exist") || error.message.includes("P2021")) {
        console.error("❌ CRITICAL: shipping_methods table does not exist in database!");
        console.error("❌ Please run: npx prisma migrate deploy");
        return NextResponse.json(
          { 
            success: false, 
            error: "Database table missing. Please run migrations: npx prisma migrate deploy",
            details: process.env.NODE_ENV === "production" ? undefined : error.message
          },
          { status: 500 }
        );
      }
    }
    
    // Provide more detailed error information in development
    const errorMessage = process.env.NODE_ENV === "development" && error instanceof Error
      ? error.message
      : "Internal server error";
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

