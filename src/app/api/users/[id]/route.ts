import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { UpdateUserData } from "@/types/admin";
import { requireAuth } from "@/lib/authz";
import {
  canChangeAccountRole,
  canChangeStaffStatus,
  canRemoveActiveSuperAdmin,
  isUserRole,
  removesActiveSuperAdmin,
} from "@/lib/staff-authority";
import {
  requireCurrentStaffActorUnderLock,
  StaffAuthorityForbiddenError,
} from "@/lib/staff-authority-db";

class FinalActiveSuperAdminError extends Error {}

async function validateAuthorityMutationUnderLock(
  tx: Prisma.TransactionClient,
  actorId: string,
  id: string,
  update: Parameters<typeof removesActiveSuperAdmin>[1],
) {
  const currentActor = await requireCurrentStaffActorUnderLock(tx, actorId);

  const currentUser = await tx.user.findUnique({ where: { id } });

  if (!currentUser) {
    throw new Error("User disappeared during authority change");
  }

  if (removesActiveSuperAdmin(currentUser, update)) {
    const activeSuperAdminCount = await tx.user.count({
      where: {
        role: "SUPER_ADMIN",
        isActive: true,
        deletedAt: null,
      },
    });
    if (!canRemoveActiveSuperAdmin(activeSuperAdminCount)) {
      throw new FinalActiveSuperAdminError();
    }
  }

  return { currentActor, currentUser };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    if (!authResult.ok) return authResult.response;

    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        addresses: {
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }]
        },
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
      addresses: user.addresses.map((address) => ({
        id: address.id,
        userId: address.userId,
        type: address.type,
        title: address.title,
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        phone: address.phone,
        isDefault: address.isDefault,
        createdAt: address.createdAt.toISOString(),
        updatedAt: address.updatedAt.toISOString()
      })),
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
    const authResult = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    if (!authResult.ok) return authResult.response;

    const { id } = await params;
    const body: UpdateUserData = await request.json();

    if (body.role !== undefined && !isUserRole(body.role)) {
      return NextResponse.json({ success: false, error: "Invalid role" }, { status: 400 });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // ADMIN restrictions: Cannot modify SUPER_ADMIN users
    if (authResult.user.role === "ADMIN" && existingUser.role === "SUPER_ADMIN") {
      return NextResponse.json({ 
        success: false, 
        error: "You do not have permission to modify SUPER_ADMIN users" 
      }, { status: 403 });
    }

    if (
      body.role !== undefined &&
      !canChangeAccountRole(authResult.user.role, existingUser.role, body.role)
    ) {
      return NextResponse.json({ 
        success: false, 
        error: "Only a Super Admin can assign privileged roles"
      }, { status: 403 });
    }

    if (
      body.isActive !== undefined &&
      !canChangeStaffStatus(authResult.user.role, existingUser.role)
    ) {
      return NextResponse.json(
        { success: false, error: "Only a Super Admin can change staff status" },
        { status: 403 },
      );
    }

    // Prevent SUPER_ADMIN from changing their own role to lower level
    if (authResult.user.id === id && body.role && body.role !== "SUPER_ADMIN") {
      return NextResponse.json({ 
        success: false, 
        error: "You cannot change your own role to a lower level" 
      }, { status: 400 });
    }

    const updateData: Prisma.UserUpdateInput = {};
    
    if (body.firstName !== undefined) { updateData.firstName = body.firstName; }
    if (body.lastName !== undefined) { updateData.lastName = body.lastName; }
    if (body.phone !== undefined) { updateData.phone = body.phone || null; }
    if (body.role !== undefined) { updateData.role = body.role; }
    if (body.isActive !== undefined) { updateData.isActive = body.isActive; }
    if (body.company !== undefined) { updateData.company = body.company; }
    if (body.position !== undefined) { updateData.position = body.position; }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const { currentActor, currentUser } =
        await validateAuthorityMutationUnderLock(
          tx,
          authResult.user.id,
          id,
          {
            role: body.role,
            isActive: body.isActive,
          },
        );

      if (
        body.role !== undefined &&
        !canChangeAccountRole(currentActor.role, currentUser.role, body.role)
      ) {
        throw new StaffAuthorityForbiddenError();
      }
      if (
        body.isActive !== undefined &&
        !canChangeStaffStatus(currentActor.role, currentUser.role)
      ) {
        throw new StaffAuthorityForbiddenError();
      }

      return tx.user.update({
        where: { id },
        data: updateData,
        include: {
          addresses: {
            orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }]
          },
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
    });

    if (body.address) {
      const address = body.address;
      const hasAddressData = [
        address.addressLine1,
        address.city,
        address.state,
        address.postalCode,
        address.phone,
      ].some((value) => typeof value === "string" && value.trim());

      if (hasAddressData) {
        const existingAddress = await prisma.address.findFirst({
          where: { userId: id },
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        });

        const addressData = {
          type: "SHIPPING" as const,
          title: address.title || "آدرس اصلی",
          firstName: address.firstName || updatedUser.firstName,
          lastName: address.lastName || updatedUser.lastName,
          company: address.company || null,
          addressLine1: address.addressLine1 || "",
          addressLine2: address.addressLine2 || null,
          city: address.city || "",
          state: address.state || "",
          postalCode: address.postalCode || "",
          country: address.country || "Iran",
          phone: address.phone || updatedUser.phone || "",
          isDefault: true,
        };

        if (existingAddress) {
          await prisma.address.update({
            where: { id: existingAddress.id },
            data: addressData,
          });
        } else {
          await prisma.address.create({
            data: {
              ...addressData,
              userId: id,
            },
          });
        }
      }
    }

    const userWithAddress = await prisma.user.findUniqueOrThrow({
      where: { id },
      include: {
        addresses: {
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }]
        },
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
      id: userWithAddress.id,
      email: userWithAddress.email,
      phone: userWithAddress.phone,
      firstName: userWithAddress.firstName,
      lastName: userWithAddress.lastName,
      role: userWithAddress.role,
      isActive: userWithAddress.isActive,
      emailVerified: userWithAddress.emailVerified,
      phoneVerified: userWithAddress.phoneVerified,
      avatar: userWithAddress.avatar,
      dateOfBirth: userWithAddress.dateOfBirth?.toISOString(),
      gender: userWithAddress.gender,
      company: userWithAddress.company,
      position: userWithAddress.position,
      addresses: userWithAddress.addresses.map((address) => ({
        id: address.id,
        userId: address.userId,
        type: address.type,
        title: address.title,
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        phone: address.phone,
        isDefault: address.isDefault,
        createdAt: address.createdAt.toISOString(),
        updatedAt: address.updatedAt.toISOString()
      })),
      createdAt: userWithAddress.createdAt.toISOString(),
      updatedAt: userWithAddress.updatedAt.toISOString(),
      lastLoginAt: userWithAddress.lastLoginAt?.toISOString(),
      deletedAt: userWithAddress.deletedAt?.toISOString(),
      _count: userWithAddress._count
    };

    return NextResponse.json({ 
      success: true, 
      data: transformedUser, 
      message: "User updated successfully" 
    });

  } catch (error) {
    if (error instanceof StaffAuthorityForbiddenError) {
      return NextResponse.json(
        { success: false, error: "Only a Super Admin can change staff roles" },
        { status: 403 },
      );
    }
    if (error instanceof FinalActiveSuperAdminError) {
      return NextResponse.json(
        { success: false, error: "The final active Super Admin requires a protected workflow" },
        { status: 409 },
      );
    }
    console.error("Error updating user:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    if (!authResult.ok) return authResult.response;

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
    }

    // Prevent users from deleting themselves
    if (authResult.user.id === id) {
      return NextResponse.json({ 
        success: false, 
        error: "You cannot delete your own account" 
      }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (authResult.user.role === "ADMIN" && existingUser.role !== "CUSTOMER") {
      return NextResponse.json({ 
        success: false, 
        error: "Only a Super Admin can delete staff accounts"
      }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      const { currentActor, currentUser } =
        await validateAuthorityMutationUnderLock(
          tx,
          authResult.user.id,
          id,
          { deletedAt: new Date() },
        );

      if (
        currentActor.role === "ADMIN" &&
        currentUser.role !== "CUSTOMER"
      ) {
        throw new StaffAuthorityForbiddenError();
      }

      await tx.user.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    });

    return NextResponse.json({ 
      success: true, 
      message: "User deleted successfully" 
    });

  } catch (error) {
    if (error instanceof StaffAuthorityForbiddenError) {
      return NextResponse.json(
        { success: false, error: "Only a Super Admin can delete staff accounts" },
        { status: 403 },
      );
    }
    if (error instanceof FinalActiveSuperAdminError) {
      return NextResponse.json(
        { success: false, error: "The final active Super Admin requires a protected workflow" },
        { status: 409 },
      );
    }
    console.error("Error deleting user:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
