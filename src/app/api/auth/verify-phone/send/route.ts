import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationCode, sendSMSSafe } from "@/lib/sms";
import { VerificationType } from "@prisma/client";

/**
 * POST /api/auth/verify-phone/send
 * Send phone verification code
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

    // Validate phone number format (Iranian format)
    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number format. Use format: 09123456789" },
        { status: 400 }
      );
    }

    // Check if phone is already verified
    const existingUser = await prisma.user.findUnique({
      where: { phone },
      select: { phoneVerified: true }
    });

    if (existingUser?.phoneVerified) {
      return NextResponse.json(
        { success: false, error: "Phone number is already verified" },
        { status: 400 }
      );
    }

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing unused codes for this phone
    await prisma.verificationCode.deleteMany({
      where: {
        phone,
        type: VerificationType.PHONE_VERIFICATION,
        used: false,
        expiresAt: { gt: new Date() }
      }
    });

    // Create verification code (expires in 5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await prisma.verificationCode.create({
      data: {
        phone,
        code,
        type: VerificationType.PHONE_VERIFICATION,
        expiresAt
      }
    });

    // Send SMS with verification code
    // Try using template first, fallback to simple SMS
    try {
      await sendVerificationCode({
        receptor: phone,
        token: code,
        template: 'verify', // Template name in Kavehnegar panel
      });
    } catch (templateError) {
      // Fallback to simple SMS if template doesn't exist
      console.warn('Template not found, using simple SMS:', templateError);
      await sendSMSSafe({
        receptor: phone,
        message: `کد تأیید شما: ${code} - این کد 5 دقیقه اعتبار دارد.`,
      }, `Phone verification: ${phone}`);
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully",
      expiresIn: 300 // 5 minutes in seconds
    });

  } catch (error) {
    console.error("Error sending phone verification code:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send verification code" },
      { status: 500 }
    );
  }
}

