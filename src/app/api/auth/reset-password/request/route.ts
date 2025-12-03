import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationCode, sendSMSSafe } from "@/lib/sms";
import { VerificationType } from "@prisma/client";

/**
 * POST /api/auth/reset-password/request
 * Request password reset - sends verification code to phone
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    // Validate phone number
    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Validate phone number format
    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number format. Use format: 09123456789" },
        { status: 400 }
      );
    }

    // Check if user exists with this phone
    const user = await prisma.user.findUnique({
      where: { phone },
      select: { id: true, firstName: true, lastName: true }
    });

    if (!user) {
      // Don't reveal that user doesn't exist (security best practice)
      return NextResponse.json({
        success: true,
        message: "If a user exists with this phone number, a reset code will be sent"
      });
    }

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing unused codes for this phone
    await prisma.verificationCode.deleteMany({
      where: {
        phone,
        type: VerificationType.PASSWORD_RESET,
        used: false,
        expiresAt: { gt: new Date() }
      }
    });

    // Create verification code (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await prisma.verificationCode.create({
      data: {
        phone,
        code,
        type: VerificationType.PASSWORD_RESET,
        expiresAt
      }
    });

    // Send SMS with verification code
    // Try using template first, fallback to simple SMS
    try {
      await sendVerificationCode({
        receptor: phone,
        token: code,
        template: 'password-reset', // Template name in Kavehnegar panel
      });
    } catch (templateError) {
      // Fallback to simple SMS if template doesn't exist
      console.warn('Template not found, using simple SMS:', templateError);
      await sendSMSSafe({
        receptor: phone,
        message: `کد بازیابی رمز عبور شما: ${code} - این کد 10 دقیقه اعتبار دارد.`,
      }, `Password reset: ${phone}`);
    }

    return NextResponse.json({
      success: true,
      message: "Password reset code sent successfully",
      expiresIn: 600 // 10 minutes in seconds
    });

  } catch (error) {
    console.error("Error requesting password reset:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send password reset code" },
      { status: 500 }
    );
  }
}

