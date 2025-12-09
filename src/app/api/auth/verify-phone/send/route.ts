import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationCode, sendSMS } from "@/lib/sms";
import { VerificationType } from "@prisma/client";

/**
 * POST /api/auth/verify-phone/send
 * Send phone verification code
 */
export async function POST(request: NextRequest) {
  try {
    // Check if SMS service is configured (accept multiple env names to avoid misconfig)
    const smsApiKey =
      process.env.KAVENEGAR_API_KEY ||
      process.env.NEXT_PUBLIC_KAVENEGAR_API_KEY ||
      process.env.KAVENEGAR_API_TOKEN;

    if (!smsApiKey) {
      console.error('❌ SMS API key is not set (KAVENEGAR_API_KEY / NEXT_PUBLIC_KAVENEGAR_API_KEY / KAVENEGAR_API_TOKEN)');
      return NextResponse.json(
        { 
          success: false, 
          error: "SMS service is not configured. Please contact support." 
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { phone, code, verifyOnly } = body;

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

    // If verifyOnly is true, just verify the code and return
    if (verifyOnly && code) {
      const verificationCode = await prisma.verificationCode.findFirst({
        where: {
          phone,
          code,
          type: VerificationType.PHONE_VERIFICATION,
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

      // Mark code as used
      await prisma.verificationCode.update({
        where: { id: verificationCode.id },
        data: {
          used: true,
          usedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: "Code verified successfully"
      });
    }

    // Check if phone is already registered (excluding soft-deleted users)
    const existingUser = await prisma.user.findFirst({
      where: { 
        phone,
        deletedAt: null // Only check non-deleted users
      },
      select: { phoneVerified: true, email: true }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Phone number is already registered" },
        { status: 400 }
      );
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

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
        code: verificationCode,
        type: VerificationType.PHONE_VERIFICATION,
        expiresAt
      }
    });

    // Send SMS with verification code
    // Try using template first, fallback to simple SMS
    console.log(`📱 Attempting to send verification code to ${phone}`);
    
    const templateResult = await sendVerificationCode({
      receptor: phone,
      token: verificationCode,
      template: 'verify', // Template name in Kavehnegar panel
    });

    if (!templateResult.success) {
      // Fallback to simple SMS if template doesn't exist or fails
      console.warn('📱 Template SMS failed, using simple SMS fallback:', templateResult.error);
      const fallbackResult = await sendSMS({
        receptor: phone,
        message: `کد تأیید شما: ${verificationCode} - این کد 5 دقیقه اعتبار دارد.`,
      });

      if (!fallbackResult.success) {
        console.error('📱 Both template and fallback SMS failed:', fallbackResult.error);
        // Still return success because code is saved in database
        // User can request a new code if SMS fails
        return NextResponse.json({
          success: true,
          message: "Verification code generated. SMS may not have been sent. Please try requesting a new code if you don't receive it.",
          expiresIn: 300,
          warning: "SMS sending failed, but code is saved. You can request a new code."
        });
      } else {
        console.log('📱 Fallback SMS sent successfully:', fallbackResult.messageId);
      }
    } else {
      console.log('📱 Template SMS sent successfully:', templateResult.messageId);
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

