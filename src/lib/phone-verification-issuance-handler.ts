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

async function deliverVerificationCode(phone: string, code: string) {
  const smsirApiKey = getEnvValue("SMSIR_API_KEY");
  const kavenegarApiKey =
    getEnvValue("KAVENEGAR_API_KEY") ||
    getEnvValue("NEXT_PUBLIC_KAVENEGAR_API_KEY") ||
    getEnvValue("KAVENEGAR_API_TOKEN");
  if (!smsirApiKey && !kavenegarApiKey) return "unavailable" as const;

  const template = smsirApiKey
    ? getEnvValue("SMSIR_SIGNUP_VERIFY_TEMPLATE_ID") ||
      getEnvValue("SMSIR_VERIFY_TEMPLATE_ID") ||
      "280627"
    : "verify";
  const templateResult = await sendVerificationCode({
    receptor: phone,
    token: code,
    template,
    parameters: { OTP: code },
  });
  if (templateResult.success) return "delivered" as const;
  const fallbackResult = await sendSMS({
    receptor: phone,
    message: SMSIRFastSendTemplates.SIGNUP_VERIFY(code),
  });
  return fallbackResult.success ? ("delivered" as const) : ("failed" as const);
}

type IssuanceDependencies = {
  deliver: (
    phone: string,
    code: string,
  ) => Promise<"delivered" | "unavailable" | "failed">;
};

export function createPhoneVerificationIssuanceHandler(
  dependencies: IssuanceDependencies = { deliver: deliverVerificationCode },
) {
  return async function issuePhoneVerification(request: NextRequest) {
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
          "verify-phone-send",
          trustedClientIp(request.headers),
          5,
          5 * 60 * 1000,
        ))
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Too many requests. Please try again later.",
          },
          { status: 429 },
        );
      }

      const { phone } = requestSchema.parse(await request.json());
      const verification = getPhoneVerificationLifecycle();
      await verification.cleanup();
      const issued = await verification.issue(phone, "PHONE_VERIFICATION");
      if (issued.status === "throttled") {
        return NextResponse.json(
          {
            success: false,
            error: "Please wait before requesting another code.",
          },
          { status: 429 },
        );
      }

      const delivery = await dependencies.deliver(phone, issued.code);
      if (delivery === "unavailable") {
        await verification.invalidate(phone, "PHONE_VERIFICATION", issued.code);
        return NextResponse.json(
          {
            success: false,
            error: "Verification messages are temporarily unavailable.",
          },
          { status: 503 },
        );
      }
      if (delivery === "failed") {
        await verification.invalidate(phone, "PHONE_VERIFICATION", issued.code);
        console.error(
          "[verify-phone/send] Verification message delivery failed",
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
          message:
            "If this number is eligible, a verification code has been sent.",
          expiresIn: issued.expiresIn,
        },
        { status: 202 },
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: "Invalid verification request" },
          { status: 400 },
        );
      }
      console.error("[verify-phone/send] Verification request failed");
      return NextResponse.json(
        { success: false, error: "Verification request failed" },
        { status: 500 },
      );
    }
  };
}
