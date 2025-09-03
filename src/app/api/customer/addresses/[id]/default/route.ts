import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT /api/customer/addresses/[id]/default - Set address as default
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

    // Unset other defaults of the same type
    await prisma.address.updateMany({
      where: {
        userId: session.user.id,
        type: existingAddress.type,
        isDefault: true,
        id: { not: id }
      },
      data: { isDefault: false }
    });

    // Set this address as default
    const updatedAddress = await prisma.address.update({
      where: { id: id },
      data: { isDefault: true }
    });

    return NextResponse.json({ success: true, data: updatedAddress });
  } catch (error) {
    console.error("Error setting default address:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
