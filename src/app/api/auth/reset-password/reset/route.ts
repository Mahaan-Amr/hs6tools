import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { VerificationType } from "@prisma/client";

/**
 * POST /api/auth/reset-password/reset
 * Reset password using verification code
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code, newPassword } = body;

    // Validate inputs
    if (!phone || !code || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Phone number, code, and new password are required" },
        { status: 400 }
      );
    }

    // Validate phone number format
    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Find verification code
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        phone,
        code,
        type: VerificationType.PASSWORD_RESET,
        used: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!verificationCode) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Mark code as used
    await prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: {
        used: true,
        usedAt: new Date()
      }
    });

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully"
    });

  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset password" },
      { status: 500 }
    );
  }
}

