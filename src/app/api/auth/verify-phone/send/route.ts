import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationCode, sendSMS } from "@/lib/sms";
import { rateLimitByIp } from "@/lib/rateLimit";
import { isAllowedOrigin } from "@/utils/origin";
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

    // CSRF: require same-origin requests
    const origin = request.headers.get("origin");
    const host = request.headers.get("host") || "";
    if (!isAllowedOrigin(origin, host)) {
      return NextResponse.json(
        { success: false, error: "Invalid origin" },
        { status: 403 }
      );
    }

    // Rate limit by IP for SMS send attempts
    const forwarded = request.headers.get("x-forwarded-for");
    const ip =
      (forwarded && forwarded.split(",")[0]?.trim()) ||
      request.headers.get("x-real-ip") ||
      null;
    const limitResult = rateLimitByIp(ip, "verify-phone-send", 5, 5 * 60 * 1000); // 5 requests / 5 min
    if (!limitResult.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
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
    console.log(`📱 [verify-phone/send] Attempting to send verification code to ${phone}`);
    console.log(`📱 [verify-phone/send] Generated code: ${verificationCode}`);
    console.log(`📱 [verify-phone/send] Code expires at: ${expiresAt.toISOString()}`);
    
    const templateResult = await sendVerificationCode({
      receptor: phone,
      token: verificationCode,
      template: 'verify', // Template name in Kavehnegar panel
    });

    console.log(`📱 [verify-phone/send] Template SMS result:`, {
      success: templateResult.success,
      error: templateResult.error,
      status: templateResult.status,
      messageId: templateResult.messageId,
    });

    if (!templateResult.success) {
      // Fallback to simple SMS if template doesn't exist or fails
      console.warn('📱 [verify-phone/send] Template SMS failed, using simple SMS fallback:', {
        error: templateResult.error,
        status: templateResult.status,
      });
      
      const fallbackResult = await sendSMS({
        receptor: phone,
        message: `کد تأیید شما: ${verificationCode} - این کد 5 دقیقه اعتبار دارد.`,
      });

      console.log(`📱 [verify-phone/send] Fallback SMS result:`, {
        success: fallbackResult.success,
        error: fallbackResult.error,
        status: fallbackResult.status,
        messageId: fallbackResult.messageId,
      });

      if (!fallbackResult.success) {
        // Check if it's a test account limitation
        const isTestAccountLimitation = fallbackResult.isTestAccountLimitation || templateResult.isTestAccountLimitation;
        const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
        
        console.error('❌ [verify-phone/send] Both template and fallback SMS failed:', {
          templateError: templateResult.error,
          templateStatus: templateResult.status,
          fallbackError: fallbackResult.error,
          fallbackStatus: fallbackResult.status,
          isTestAccountLimitation,
        });
        
        // Still return success because code is saved in database
        // User can request a new code if SMS fails
        let warningMessage = `SMS sending failed: ${fallbackResult.error || templateResult.error}. Code is saved in database. You can request a new code.`;
        
        if (isTestAccountLimitation && isDevelopment) {
          // In development mode with test account, provide the code for testing
          warningMessage = `SMS sending failed (Test account limitation: SMS can only be sent to account owner's number). Your verification code is: ${verificationCode}. This code is valid for 5 minutes. In production, SMS will work normally.`;
          console.log(`🔑 [verify-phone/send] Development mode - Verification code for ${phone}: ${verificationCode}`);
        }
        
        return NextResponse.json({
          success: true,
          message: "Verification code generated. SMS may not have been sent. Please try requesting a new code if you don't receive it.",
          expiresIn: 300,
          warning: warningMessage,
          // In development mode with test account limitation, include code for testing
          ...(isTestAccountLimitation && isDevelopment ? { devCode: verificationCode } : {}),
        });
      } else {
        console.log('✅ [verify-phone/send] Fallback SMS sent successfully:', fallbackResult.messageId);
      }
    } else {
      console.log('✅ [verify-phone/send] Template SMS sent successfully:', templateResult.messageId);
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

