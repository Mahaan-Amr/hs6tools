import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddressType, Prisma } from "@prisma/client";

// GET /api/customer/addresses/[id] - Get specific address
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const address = await prisma.address.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    });

    if (!address) {
      return NextResponse.json(
        { success: false, error: "Address not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: address });
  } catch (error) {
    console.error("Error fetching address:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/customer/addresses/[id] - Update address
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      type,
      title,
      firstName,
      lastName,
      company,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault
    } = body;

    // Check if address exists and belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    });

    if (!existingAddress) {
      return NextResponse.json(
        { success: false, error: "Address not found" },
        { status: 404 }
      );
    }

    // Validation
    if (!type || !title || !firstName || !lastName || !addressLine1 || !city || !state || !postalCode || !country || !phone) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate address type
    if (!Object.values(AddressType).includes(type)) {
      return NextResponse.json(
        { success: false, error: "Invalid address type" },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults of the same type
    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          type: type,
          isDefault: true,
          id: { not: id }
        },
        data: { isDefault: false }
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id: id },
      data: {
        type,
        title,
        firstName,
        lastName,
        company,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        phone,
        isDefault: isDefault || false
      }
    });

    return NextResponse.json({ success: true, data: updatedAddress });
  } catch (error) {
    console.error("Error updating address:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/customer/addresses/[id] - Delete address
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    if (!session?.user?.id) {
      console.error("❌ Address Deletion: Authentication required");
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if address exists and belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    });

    if (!existingAddress) {
      console.error("❌ Address Deletion: Address not found", { addressId: id, userId: session.user.id });
      return NextResponse.json(
        { success: false, error: "Address not found" },
        { status: 404 }
      );
    }

    // Check if address is used in any orders (shipping address)
    const shippingAddressUsage = await prisma.order.findFirst({
      where: {
        shippingAddressId: id
      },
      select: {
        id: true,
        orderNumber: true
      }
    });

    if (shippingAddressUsage) {
      console.error("❌ Address Deletion: Address is used in orders", {
        addressId: id,
        orderId: shippingAddressUsage.id,
        orderNumber: shippingAddressUsage.orderNumber
      });
      return NextResponse.json(
        { 
          success: false, 
          error: "Cannot delete address that is used in orders. Please contact support if you need to remove this address." 
        },
        { status: 400 }
      );
    }

    // Check if address is used as billing address (legacy check - should not happen after migration)
    // This is a safety check in case the migration wasn't fully applied
    try {
      const billingAddressUsage = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM "public"."orders" 
        WHERE "billingAddressId" = ${id} 
        LIMIT 1
      `;

      if (billingAddressUsage && billingAddressUsage.length > 0) {
        console.error("❌ Address Deletion: Address is used as billing address (legacy)", {
          addressId: id,
          orderId: billingAddressUsage[0].id
        });
        return NextResponse.json(
          { 
            success: false, 
            error: "Cannot delete address that is used in orders. Please contact support if you need to remove this address." 
          },
          { status: 400 }
        );
      }
    } catch (rawQueryError) {
      // If the column doesn't exist, this query will fail, which is expected after migration
      // We can ignore this error as it means the migration was successful
      console.log("ℹ️ Address Deletion: billingAddressId column check skipped (column may not exist)", {
        error: rawQueryError instanceof Error ? rawQueryError.message : "Unknown error"
      });
    }

    // Delete the address
    await prisma.address.delete({
      where: { id: id }
    });

    const duration = Date.now() - startTime;
    console.log(`✅ Address Deletion: Success for user ${session.user.id} in ${duration}ms`, {
      addressId: id
    });

    return NextResponse.json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Log detailed error information
    console.error("❌ Address Deletion: Error occurred", {
      duration: `${duration}ms`,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });

    // Handle Prisma foreign key constraint errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        // Extract constraint name from error metadata
        const meta = error.meta as { field_name?: string; constraint?: string } | undefined;
        const constraintName = meta?.field_name || meta?.constraint || 'unknown';
        const constraintStr = String(constraintName);
        console.error('❌ Address Deletion: Foreign key constraint violation:', {
          code: error.code,
          constraint: constraintStr,
          meta: error.meta
        });

        // Check if it's the billing address constraint (legacy)
        if (constraintStr.includes('billingAddressId')) {
          return NextResponse.json(
            { 
              success: false, 
              error: "Cannot delete address that is used in orders. The database migration may not be complete. Please contact support." 
            },
            { status: 400 }
          );
        }

        // Generic foreign key error
        return NextResponse.json(
          { 
            success: false, 
            error: "Cannot delete address that is used in orders. Please contact support if you need to remove this address." 
          },
          { status: 400 }
        );
      }

      if (error.code === 'P2025') {
        console.error('❌ Address Deletion: Record not found:', error.meta);
        return NextResponse.json(
          { 
            success: false, 
            error: "Address not found or already deleted." 
          },
          { status: 404 }
        );
      }
    }

    // Handle Prisma validation errors
    if (error instanceof Prisma.PrismaClientValidationError) {
      console.error('❌ Address Deletion: Prisma validation error:', error.message);
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid address data. Please try again.",
          details: process.env.NODE_ENV === "development" ? error.message : undefined
        },
        { status: 400 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to delete address. Please try again or contact support if the problem persists.",
        details: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
