import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/categories/bulk - Bulk update categories
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ids, action, data } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "Category IDs are required" },
        { status: 400 }
      );
    }

    if (!action || !["activate", "deactivate"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Invalid action. Use 'activate' or 'deactivate'" },
        { status: 400 }
      );
    }

    const isActive = action === "activate";

    // Update categories in bulk
    const result = await prisma.category.updateMany({
      where: {
        id: { in: ids }
      },
      data: {
        isActive,
        ...data // Allow additional data updates if needed
      }
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} categor${result.count === 1 ? 'y' : 'ies'} ${action}d successfully`,
      count: result.count
    });

  } catch (error) {
    console.error("Error performing bulk action on categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform bulk action" },
      { status: 500 }
    );
  }
}

