import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPhoneVerificationLifecycle } from "@/lib/phone-verification";
import {
  checkVerificationRateLimit,
  trustedClientIp,
} from "@/lib/verification-rate-limit";
import { isAllowedOrigin } from "@/utils/origin";

const requestSchema = z
  .object({
    phone: z.string().regex(/^09\d{9}$/),
    code: z.string().regex(/^\d{6}$/),
    newPassword: z.string().min(8),
  })
  .strict();

export async function POST(request: NextRequest) {
  try {
    if (
      !isAllowedOrigin(
        request.headers.get("origin"),
        request.headers.get("host") || "",
      )
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid origin" },
        { status: 403 },
      );
    }
    const { phone, code, newPassword } = requestSchema.parse(
      await request.json(),
    );
    const ipAllowed = await checkVerificationRateLimit(
      "reset-password",
      trustedClientIp(request.headers),
      10,
      5 * 60 * 1000,
    );
    const recipientAllowed = await checkVerificationRateLimit(
      "reset-password-recipient",
      phone,
      5,
      5 * 60 * 1000,
    );
    if (!ipAllowed || !recipientAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many reset attempts. Please try again later.",
        },
        { status: 429 },
      );
    }

    const lifecycle = getPhoneVerificationLifecycle();
    const verified = await lifecycle.verify(phone, "PASSWORD_RESET", code);
    if (verified.status === "invalid") {
      return NextResponse.json(
        { success: false, error: "Invalid or expired reset request" },
        { status: 400 },
      );
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    const consumed = await lifecycle.consume(
      phone,
      "PASSWORD_RESET",
      verified.proof,
      (transaction) =>
        transaction.user.update({
          where: { phone },
          data: { passwordHash, updatedAt: new Date() },
        }),
    );
    if (consumed.status === "invalid") {
      return NextResponse.json(
        { success: false, error: "Invalid or expired reset request" },
        { status: 400 },
      );
    }
    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    if (
      error instanceof z.ZodError ||
      (error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025")
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired reset request" },
        { status: 400 },
      );
    }
    console.error("[reset-password/reset] Password reset failed");
    return NextResponse.json(
      { success: false, error: "Failed to reset password" },
      { status: 500 },
    );
  }
}
