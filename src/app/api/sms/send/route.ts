import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendSMS, sendVerificationCode, SendSMSOptions, VerifyLookupOptions } from "@/lib/sms";

/**
 * POST /api/sms/send
 * Send SMS message
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
    const session = await getServerSession(authOptions);
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
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

