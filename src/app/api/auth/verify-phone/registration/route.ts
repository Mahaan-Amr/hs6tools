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
    const { phone, code } = requestSchema.parse(await request.json());
    const ipAllowed = await checkVerificationRateLimit(
      "verify-registration",
      trustedClientIp(request.headers),
      10,
      5 * 60 * 1000,
    );
    const recipientAllowed = await checkVerificationRateLimit(
      "verify-registration-recipient",
      phone,
      5,
      5 * 60 * 1000,
    );
    if (!ipAllowed || !recipientAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many verification attempts. Please try again later.",
        },
        { status: 429 },
      );
    }

    const result = await getPhoneVerificationLifecycle().verify(
      phone,
      "PHONE_VERIFICATION",
      code,
    );
    if (result.status === "invalid") {
      return NextResponse.json(
        { success: false, error: "Invalid or expired verification code" },
        { status: 400 },
      );
    }
    return NextResponse.json({
      success: true,
      verificationProof: result.proof,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid verification request" },
        { status: 400 },
      );
    }
    console.error("[verify-phone/registration] Verification failed");
    return NextResponse.json(
      { success: false, error: "Verification failed" },
      { status: 500 },
    );
  }
}
