import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sendSMSSafe, SMSTemplates } from "@/lib/sms";

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
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Check if phone is already taken (if provided)
    if (validatedData.phone) {
      const existingPhoneUser = await prisma.user.findUnique({
        where: { phone: validatedData.phone }
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

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
