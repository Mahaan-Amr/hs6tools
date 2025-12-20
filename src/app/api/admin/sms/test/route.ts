import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/admin/sms/test
 * Test SMS.ir connectivity and token retrieval (Admin only)
 * This endpoint helps diagnose SMS.ir API issues
 */
export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check admin role
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const diagnostics: Record<string, any> = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    };

    // 1. Check environment variables
    diagnostics.envCheck = {
      SMSIR_API_KEY: {
        present: !!process.env.SMSIR_API_KEY,
        length: process.env.SMSIR_API_KEY?.length || 0,
        preview: process.env.SMSIR_API_KEY
          ? `${process.env.SMSIR_API_KEY.substring(0, 16)}...`
          : "NOT SET",
      },
      SMSIR_SECRET_KEY: {
        present: !!process.env.SMSIR_SECRET_KEY,
        length: process.env.SMSIR_SECRET_KEY?.length || 0,
      },
      SMSIR_VERIFY_TEMPLATE_ID: process.env.SMSIR_VERIFY_TEMPLATE_ID || "NOT SET",
      SMSIR_LINE_NUMBER: process.env.SMSIR_LINE_NUMBER || "NOT SET",
    };

    // 2. Check SMS.ir package availability
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let SMSIr: any = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      SMSIr = require("sms-ir");
      diagnostics.packageCheck = {
        available: true,
        hasToken: !!SMSIr?.Token,
        hasSimpleSend: !!SMSIr?.SimpleSend,
        hasUltraFastSend: !!SMSIr?.UltraFastSend,
        hasVerificationCode: !!SMSIr?.VerificationCode,
      };
    } catch (error) {
      diagnostics.packageCheck = {
        available: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // 3. Test token retrieval if package is available
    if (SMSIr && process.env.SMSIR_API_KEY) {
      try {
        const token = new SMSIr.Token();
        const apiKey = process.env.SMSIR_API_KEY;
        const secretKey = process.env.SMSIR_SECRET_KEY || null;

        diagnostics.tokenTest = {
          attempting: true,
          method: secretKey ? "with secretKey" : "without secretKey",
          apiKeyPreview: `${apiKey.substring(0, 16)}...`,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let tokenResult: any;
        const startTime = Date.now();
        try {
          if (secretKey) {
            tokenResult = await Promise.race([
              token.get(apiKey, secretKey),
              new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("Timeout after 10 seconds")), 10000)
              ),
            ]);
          } else {
            tokenResult = await Promise.race([
              token.get(apiKey),
              new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("Timeout after 10 seconds")), 10000)
              ),
            ]);
          }
          const duration = Date.now() - startTime;

          diagnostics.tokenTest.result = {
            success: true,
            duration: `${duration}ms`,
            hasResult: !!tokenResult,
            resultType: tokenResult ? typeof tokenResult : "null/undefined",
            isSuccessful: tokenResult?.IsSuccessful,
            message: tokenResult?.Message,
            statusCode: tokenResult?.StatusCode,
            hasTokenKey: !!tokenResult?.TokenKey,
            tokenKeyPreview: tokenResult?.TokenKey
              ? `${tokenResult.TokenKey.substring(0, 10)}...`
              : "NOT SET",
            fullResponse: tokenResult ? JSON.stringify(tokenResult, null, 2) : "null",
          };
        } catch (apiError) {
          const duration = Date.now() - startTime;
          diagnostics.tokenTest.result = {
            success: false,
            duration: `${duration}ms`,
            error: apiError instanceof Error ? apiError.message : String(apiError),
            errorType: apiError instanceof Error ? apiError.constructor.name : typeof apiError,
            stack: apiError instanceof Error ? apiError.stack : undefined,
          };
        }
      } catch (error) {
        diagnostics.tokenTest = {
          attempting: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    } else {
      diagnostics.tokenTest = {
        attempting: false,
        reason: !SMSIr
          ? "SMS.ir package not available"
          : "SMSIR_API_KEY not set",
      };
    }

    // 4. Test network connectivity to SMS.ir API
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const networkTest = await fetch("https://api.sms.ir/v1/", {
        method: "GET",
        signal: controller.signal,
        headers: {
          "User-Agent": "HS6Tools-Diagnostics/1.0",
        },
      }).finally(() => clearTimeout(timeoutId));

      diagnostics.networkTest = {
        reachable: true,
        status: networkTest.status,
        statusText: networkTest.statusText,
        headers: Object.fromEntries(networkTest.headers.entries()),
      };
    } catch (networkError) {
      diagnostics.networkTest = {
        reachable: false,
        error: networkError instanceof Error ? networkError.message : String(networkError),
        errorType:
          networkError instanceof Error
            ? networkError.constructor.name
            : typeof networkError,
      };
    }

    // 5. Summary
    diagnostics.summary = {
      envConfigured: !!process.env.SMSIR_API_KEY,
      packageAvailable: !!SMSIr,
      tokenRetrievalSuccess:
        diagnostics.tokenTest?.result?.success === true &&
        diagnostics.tokenTest?.result?.isSuccessful === true,
      networkReachable: diagnostics.networkTest?.reachable === true,
      ready: !!(
        process.env.SMSIR_API_KEY &&
        SMSIr &&
        diagnostics.tokenTest?.result?.success === true &&
        diagnostics.tokenTest?.result?.isSuccessful === true
      ),
    };

    return NextResponse.json({
      success: true,
      diagnostics,
    });
  } catch (error) {
    console.error("❌ [admin/sms/test] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

