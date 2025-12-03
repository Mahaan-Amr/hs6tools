import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VerificationType } from "@prisma/client";

/**
 * POST /api/auth/verify-phone/verify
 * Verify phone verification code
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { phone, code } = body;

    // Validate inputs
    if (!phone || !code) {
      return NextResponse.json(
        { success: false, error: "Phone number and code are required" },
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

    // Find verification code
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

    // Update user's phone and mark as verified
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        phone,
        phoneVerified: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "Phone number verified successfully"
    });

  } catch (error) {
    console.error("Error verifying phone code:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify phone number" },
      { status: 500 }
    );
  }
}

