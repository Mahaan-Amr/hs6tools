import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { PaginatedResponse } from "@/types/admin";
import { requireAuth } from "@/lib/authz";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    if (!authResult.ok) return authResult.response;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const isActive = searchParams.get("isActive") || "";
    const dateRange = searchParams.get("dateRange") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      // Exclude soft-deleted users
      deletedAt: null
    };
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } }
      ];
    }

    if (role) {
      where.role = role as Prisma.UserWhereInput["role"];
    }

    if (isActive !== "") {
      where.isActive = isActive === "true";
    }

    if (dateRange) {
      const [startDate, endDate] = dateRange.split(",");
      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      }
    }

    const orderBy: Prisma.UserOrderByWithRelationInput = {};
    if (sortBy === "email") {
      orderBy.email = sortOrder === "asc" ? "asc" : "desc";
    } else if (sortBy === "firstName") {
      orderBy.firstName = sortOrder === "asc" ? "asc" : "desc";
    } else if (sortBy === "lastName") {
      orderBy.lastName = sortOrder === "asc" ? "asc" : "desc";
    } else if (sortBy === "role") {
      orderBy.role = sortOrder === "asc" ? "asc" : "desc";
    } else if (sortBy === "lastLoginAt") {
      orderBy.lastLoginAt = sortOrder === "asc" ? "asc" : "desc";
    } else {
      orderBy.createdAt = sortOrder === "asc" ? "asc" : "desc";
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          _count: {
            select: {
              orders: true,
              addresses: true,
              reviews: true,
              articles: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    const transformedUsers = users.map(user => ({
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
    }));

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const response: PaginatedResponse<typeof transformedUsers[0]> = {
      data: transformedUsers,
      pagination: { page, limit, total, totalPages, hasNext, hasPrev }
    };

    return NextResponse.json({ success: true, data: response });

  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    if (!authResult.ok) return authResult.response;

    const body = await request.json();
    const { email, phone, firstName, lastName, password, role, company, position } = body;

    // ADMIN restrictions: Cannot create SUPER_ADMIN users
    if (authResult.user.role === "ADMIN" && role === "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "You do not have permission to create SUPER_ADMIN users" },
        { status: 403 }
      );
    }

    if (!email || !firstName || !lastName || !password || !role) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists (excluding soft-deleted users)
    const existingUser = await prisma.user.findFirst({
      where: { 
        email,
        deletedAt: null // Only check non-deleted users
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Check if phone is already taken (excluding soft-deleted users)
    if (phone) {
      const existingPhoneUser = await prisma.user.findFirst({
        where: { 
          phone,
          deletedAt: null // Only check non-deleted users
        }
      });

      if (existingPhoneUser) {
        return NextResponse.json(
          { success: false, error: "User with this phone number already exists" },
          { status: 400 }
        );
      }
    }

    // Hash password
    const bcrypt = await import("bcryptjs");
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        firstName,
        lastName,
        passwordHash,
        role,
        company,
        position,
        isActive: true,
        emailVerified: false,
        phoneVerified: false
      },
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

    return NextResponse.json({ 
      success: true, 
      data: transformedUser,
      message: "User created successfully" 
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
