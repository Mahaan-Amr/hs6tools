import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPhoneVerificationLifecycle } from "@/lib/phone-verification";
import {
  SMSIRFastSendTemplates,
  sendSMS,
  sendVerificationCode,
} from "@/lib/sms";
import {
  checkVerificationRateLimit,
  trustedClientIp,
} from "@/lib/verification-rate-limit";
import { isAllowedOrigin } from "@/utils/origin";

const requestSchema = z
  .object({ phone: z.string().regex(/^09\d{9}$/) })
  .strict();

function getEnvValue(name: string) {
  const value = process.env[name]?.trim().replace(/^['"]|['"]$/g, "");
  return value || undefined;
}

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
    if (
      !(await checkVerificationRateLimit(
        "reset-password-request",
        trustedClientIp(request.headers),
        5,
        5 * 60 * 1000,
      ))
    ) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }
    const { phone } = requestSchema.parse(await request.json());
    const lifecycle = getPhoneVerificationLifecycle();
    await lifecycle.cleanup();
    const issued = await lifecycle.issue(phone, "PASSWORD_RESET");
    if (issued.status === "throttled") {
      return NextResponse.json(
        {
          success: false,
          error: "Please wait before requesting another code.",
        },
        { status: 429 },
      );
    }

    const smsirApiKey = getEnvValue("SMSIR_API_KEY");
    const template = smsirApiKey
      ? getEnvValue("SMSIR_PASSWORD_RESET_TEMPLATE_ID") ||
        getEnvValue("SMSIR_VERIFY_TEMPLATE_ID") ||
        "846716"
      : "password-reset";
    const templateResult = await sendVerificationCode({
      receptor: phone,
      token: issued.code,
      template,
      parameters: { OTP: issued.code },
    });
    let delivered = templateResult.success;
    if (!delivered) {
      delivered = (
        await sendSMS({
          receptor: phone,
          message: SMSIRFastSendTemplates.PASSWORD_RESET(issued.code),
        })
      ).success;
    }
    if (!delivered) {
      await lifecycle.invalidate(phone, "PASSWORD_RESET", issued.code);
      console.error(
        "[reset-password/request] Verification message delivery failed",
      );
      return NextResponse.json(
        {
          success: false,
          error:
            "Verification message could not be delivered. Please try again.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "If this number is eligible, a reset code has been sent.",
        expiresIn: issued.expiresIn,
      },
      { status: 202 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid reset request" },
        { status: 400 },
      );
    }
    console.error("[reset-password/request] Reset request failed");
    return NextResponse.json(
      { success: false, error: "Reset request failed" },
      { status: 500 },
    );
  }
}
