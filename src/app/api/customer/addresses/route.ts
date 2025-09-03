import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddressType } from "@prisma/client";

// GET /api/customer/addresses - Get all customer addresses
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" }
      ]
    });

    return NextResponse.json({ success: true, data: addresses });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/customer/addresses - Create new address
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
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
          isDefault: true
        },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
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

    return NextResponse.json({ success: true, data: address });
  } catch (error) {
    console.error("Error creating address:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
