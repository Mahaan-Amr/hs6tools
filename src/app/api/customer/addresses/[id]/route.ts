import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddressType } from "@prisma/client";

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

// DELETE /api/customer/addresses/[id] - Delete address (soft delete)
export async function DELETE(
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

    // Check if address is used in any orders
    const addressUsage = await prisma.order.findFirst({
      where: {
        OR: [
          { billingAddressId: id },
          { shippingAddressId: id }
        ]
      }
    });

    if (addressUsage) {
      return NextResponse.json(
        { success: false, error: "Cannot delete address that is used in orders" },
        { status: 400 }
      );
    }

    // Delete the address
    await prisma.address.delete({
      where: { id: id }
    });

    return NextResponse.json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.error("Error deleting address:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
