import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationCode, sendSMSSafe } from "@/lib/sms";
import { VerificationType } from "@prisma/client";
import { rateLimitByIp } from "@/lib/rateLimit";
import { isAllowedOrigin } from "@/utils/origin";

/**
 * POST /api/auth/reset-password/request
 * Request password reset - sends verification code to phone
 */
export async function POST(request: NextRequest) {
  try {
    // CSRF: require same-origin requests
    const origin = request.headers.get("origin");
    const host = request.headers.get("host") || "";
    if (!isAllowedOrigin(origin, host)) {
      return NextResponse.json(
        { success: false, error: "Invalid origin" },
        { status: 403 }
      );
    }

    // Rate limit by IP for password reset code requests
    const forwarded = request.headers.get("x-forwarded-for");
    const ip =
      (forwarded && forwarded.split(",")[0]?.trim()) ||
      request.headers.get("x-real-ip") ||
      null;
    const limitResult = rateLimitByIp(ip, "reset-password-request", 5, 5 * 60 * 1000); // 5 requests / 5 min
    if (!limitResult.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

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
    // Determine template based on SMS provider
    const smsirApiKey = process.env.SMSIR_API_KEY;
    const template = smsirApiKey 
      ? (process.env.SMSIR_PASSWORD_RESET_TEMPLATE_ID || process.env.SMSIR_VERIFY_TEMPLATE_ID || 'password-reset')
      : 'password-reset'; // Template name for Kavenegar
    
    const templateResult = await sendVerificationCode({
      receptor: phone,
      token: code,
      template: template,
    });

    // Fallback to simple SMS if template fails
    if (!templateResult.success) {
      console.warn('📱 [reset-password] Template SMS failed, using simple SMS fallback:', {
        error: templateResult.error,
        status: templateResult.status,
      });
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

