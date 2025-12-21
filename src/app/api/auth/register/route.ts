import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sendSMSSafe, SMSTemplates } from "@/lib/sms";
import { checkRateLimit } from "@/lib/rateLimit";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().regex(/^09\d{9}$/, "Invalid phone number format"),
  phoneVerified: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 3 registrations per 15 minutes per IP
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0] || 
                     request.headers.get("x-real-ip") || 
                     "unknown";
    const rateLimitResult = checkRateLimit(clientIp, 3, 15 * 60 * 1000, 'register');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists (excluding soft-deleted users)
    const existingUser = await prisma.user.findFirst({
      where: { 
        email: validatedData.email,
        deletedAt: null // Only check non-deleted users
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Check if phone is already taken (excluding soft-deleted users)
    if (validatedData.phone) {
      const existingPhoneUser = await prisma.user.findFirst({
        where: { 
          phone: validatedData.phone,
          deletedAt: null // Only check non-deleted users
        }
      });

      if (existingPhoneUser) {
        return NextResponse.json(
          { error: "User with this phone number already exists" },
          { status: 400 }
        );
      }
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(validatedData.password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        role: "CUSTOMER", // Default role
        isActive: true,
        emailVerified: false,
        phoneVerified: validatedData.phoneVerified || false, // Set to true if phone was verified during registration
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
      }
    });

    // Send welcome SMS if phone is provided (non-blocking)
    if (user.phone) {
      const customerName = `${user.firstName} ${user.lastName}`;
      sendSMSSafe(
        {
          receptor: user.phone,
          message: SMSTemplates.WELCOME(customerName),
        },
        `User registration: ${user.email}`
      );
    }

    return NextResponse.json(
      { 
        message: "User registered successfully",
        user 
      },
      { status: 201 }
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    // Handle Prisma unique constraint violations
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const field = error.meta?.target as string[] | undefined;
        const fieldName = field?.[0] || 'field';
        
        console.error("Registration error: Unique constraint violation", {
          field: fieldName,
          code: error.code,
        });
        
        if (fieldName === 'email') {
          return NextResponse.json(
            { error: "User with this email already exists" },
            { status: 400 }
          );
        } else if (fieldName === 'phone') {
          return NextResponse.json(
            { error: "User with this phone number already exists" },
            { status: 400 }
          );
        } else {
          return NextResponse.json(
            { error: `This ${fieldName} is already taken` },
            { status: 400 }
          );
        }
      }
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
