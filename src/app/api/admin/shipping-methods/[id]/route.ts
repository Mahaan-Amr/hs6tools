import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/shipping-methods/[id] - Get single shipping method
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const shippingMethod = await prisma.shippingMethodConfig.findUnique({
      where: { id }
    });

    if (!shippingMethod) {
      return NextResponse.json(
        { success: false, error: "Shipping method not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: shippingMethod });
  } catch (error) {
    console.error("Error fetching shipping method:", error);
    
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

// PUT /api/admin/shipping-methods/[id] - Update shipping method
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const { name, description, price, estimatedDays, isActive, sortOrder } = body;

    // Check if shipping method exists
    const existing = await prisma.shippingMethodConfig.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Shipping method not found" },
        { status: 404 }
      );
    }

    // Validation
    if (name !== undefined && (!name || !name.trim())) {
      return NextResponse.json(
        { success: false, error: "Name cannot be empty" },
        { status: 400 }
      );
    }

    if (price !== undefined && (price === null || Number(price) < 0)) {
      return NextResponse.json(
        { success: false, error: "Valid price is required" },
        { status: 400 }
      );
    }

    if (estimatedDays !== undefined && (!estimatedDays || !estimatedDays.trim())) {
      return NextResponse.json(
        { success: false, error: "Estimated days cannot be empty" },
        { status: 400 }
      );
    }

    // Build update data
    interface UpdateData {
      name?: string;
      description?: string | null;
      price?: number;
      estimatedDays?: string;
      isActive?: boolean;
      sortOrder?: number;
    }
    const updateData: UpdateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (price !== undefined) updateData.price = Number(price);
    if (estimatedDays !== undefined) updateData.estimatedDays = estimatedDays.trim();
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder);

    const shippingMethod = await prisma.shippingMethodConfig.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, data: shippingMethod });
  } catch (error) {
    console.error("Error updating shipping method:", error);
    
    // Log full error details for debugging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      
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

// DELETE /api/admin/shipping-methods/[id] - Delete shipping method
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    // Check if shipping method exists
    const existing = await prisma.shippingMethodConfig.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Shipping method not found" },
        { status: 404 }
      );
    }

    await prisma.shippingMethodConfig.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Shipping method deleted" });
  } catch (error) {
    console.error("Error deleting shipping method:", error);
    
    // Log full error details for debugging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      
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

