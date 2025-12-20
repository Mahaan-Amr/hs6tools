import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/admin/sms/test
 * Test SMS.ir connectivity and client initialization (Admin only)
 * Note: SMS.ir uses direct API key authentication (no token system)
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // 2. Check SMS.ir package availability (official smsir-js)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let SMSIr: any = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const smsirModule = require("smsir-js");
      SMSIr = smsirModule.Smsir || smsirModule;
      diagnostics.packageCheck = {
        available: true,
        hasSmsirClass: !!SMSIr,
        packageName: "smsir-js",
        note: "Official SMS.ir package - uses direct API key (no token system)",
      };
    } catch (error) {
      diagnostics.packageCheck = {
        available: false,
        error: error instanceof Error ? error.message : String(error),
        note: "Install with: npm install smsir-js",
      };
    }

    // 3. Test client initialization and API connectivity
    if (SMSIr && process.env.SMSIR_API_KEY) {
      try {
        const apiKey = process.env.SMSIR_API_KEY;
        const lineNumber = process.env.SMSIR_LINE_NUMBER || '';

        diagnostics.clientTest = {
          attempting: true,
          apiKeyPreview: `${apiKey.substring(0, 16)}...`,
          lineNumber: lineNumber || 'default',
        };

        const startTime = Date.now();
        try {
          // Test client initialization (no API call yet)
          const smsir = new SMSIr(apiKey, lineNumber);
          const duration = Date.now() - startTime;

          diagnostics.clientTest.result = {
            success: true,
            duration: `${duration}ms`,
            clientInitialized: true,
            note: "Client initialized successfully. SMS.ir uses direct API key authentication (no token system).",
          };
        } catch (initError) {
          const duration = Date.now() - startTime;
          diagnostics.clientTest.result = {
            success: false,
            duration: `${duration}ms`,
            error: initError instanceof Error ? initError.message : String(initError),
            errorType: initError instanceof Error ? initError.constructor.name : typeof initError,
            stack: initError instanceof Error ? initError.stack : undefined,
          };
        }
      } catch (error) {
        diagnostics.clientTest = {
          attempting: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    } else {
      diagnostics.clientTest = {
        attempting: false,
        reason: !SMSIr
          ? "smsir-js package not available"
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

