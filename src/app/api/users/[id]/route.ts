import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { UpdateUserData } from "@/types/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true,
            addresses: true,
            reviews: true,
            articles: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const transformedUser = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      avatar: user.avatar,
      dateOfBirth: user.dateOfBirth?.toISOString(),
      gender: user.gender,
      company: user.company,
      position: user.position,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString(),
      deletedAt: user.deletedAt?.toISOString(),
      _count: user._count
    };

    return NextResponse.json({ success: true, data: transformedUser });

  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body: UpdateUserData = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Prevent SUPER_ADMIN from changing their own role to lower level
    if (session.user.id === id && body.role && body.role !== "SUPER_ADMIN") {
      return NextResponse.json({ 
        success: false, 
        error: "You cannot change your own role to a lower level" 
      }, { status: 400 });
    }

    const updateData: Prisma.UserUpdateInput = {};
    
    if (body.firstName !== undefined) { updateData.firstName = body.firstName; }
    if (body.lastName !== undefined) { updateData.lastName = body.lastName; }
    if (body.role !== undefined) { updateData.role = body.role; }
    if (body.isActive !== undefined) { updateData.isActive = body.isActive; }
    if (body.company !== undefined) { updateData.company = body.company; }
    if (body.position !== undefined) { updateData.position = body.position; }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            orders: true,
            addresses: true,
            reviews: true,
            articles: true
          }
        }
      }
    });

    const transformedUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      phone: updatedUser.phone,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
      emailVerified: updatedUser.emailVerified,
      phoneVerified: updatedUser.phoneVerified,
      avatar: updatedUser.avatar,
      dateOfBirth: updatedUser.dateOfBirth?.toISOString(),
      gender: updatedUser.gender,
      company: updatedUser.company,
      position: updatedUser.position,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
      lastLoginAt: updatedUser.lastLoginAt?.toISOString(),
      deletedAt: updatedUser.deletedAt?.toISOString(),
      _count: updatedUser._count
    };

    return NextResponse.json({ 
      success: true, 
      data: transformedUser, 
      message: "User updated successfully" 
    });

  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
    }

    // Prevent SUPER_ADMIN from deleting themselves
    if (session.user.id === id) {
      return NextResponse.json({ 
        success: false, 
        error: "You cannot delete your own account" 
      }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Soft delete - set deletedAt timestamp
    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    return NextResponse.json({ 
      success: true, 
      message: "User deleted successfully" 
    });

  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
