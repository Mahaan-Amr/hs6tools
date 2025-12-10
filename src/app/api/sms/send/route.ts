import { NextRequest, NextResponse } from "next/server";
import { sendSMS, sendVerificationCode, SendSMSOptions, VerifyLookupOptions } from "@/lib/sms";
import { requireAuth } from "@/lib/authz";
import { checkRateLimit } from "@/lib/rateLimit";

/**
 * POST /api/sms/send
 * Send SMS message (admin only, rate limited)
 * 
 * Body:
 * {
 *   type: 'simple' | 'verification',
 *   receptor: string,
 *   message?: string, // For simple SMS
 *   token?: string, // For verification
 *   template?: string, // For verification
 *   sender?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication (only admins can send SMS directly)
    const authResult = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    if (!authResult.ok) return authResult.response;

    // Rate limit: 20 SMS per 5 minutes per IP
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0] || 
                     request.headers.get("x-real-ip") || 
                     "unknown";
    const rateLimitResult = checkRateLimit(clientIp, 20, 5 * 60 * 1000, 'sms-send');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { type, receptor, message, token, template, sender } = body;

    if (!receptor) {
      return NextResponse.json(
        { success: false, error: "Receptor (phone number) is required" },
        { status: 400 }
      );
    }

    // Validate phone number format (Iranian format)
    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(receptor)) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number format. Use format: 09123456789" },
        { status: 400 }
      );
    }

    let result;

    if (type === 'verification') {
      if (!token || !template) {
        return NextResponse.json(
          { success: false, error: "Token and template are required for verification SMS" },
          { status: 400 }
        );
      }

      const verifyOptions: VerifyLookupOptions = {
        receptor,
        token,
        template,
      };

      result = await sendVerificationCode(verifyOptions);
    } else {
      if (!message) {
        return NextResponse.json(
          { success: false, error: "Message is required for simple SMS" },
          { status: 400 }
        );
      }

      const smsOptions: SendSMSOptions = {
        receptor,
        message,
        sender,
      };

      result = await sendSMS(smsOptions);
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result,
        message: result.message || "SMS sent successfully",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to send SMS",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending SMS:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

