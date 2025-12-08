import { NextRequest, NextResponse } from "next/server";
import { expirePendingOrders, getOrderExpiryStats } from "@/lib/cron/expire-orders";

/**
 * POST /api/cron/expire-orders
 * 
 * Cron endpoint to expire old pending orders and restore stock.
 * 
 * This endpoint should be called periodically (e.g., every 5 minutes) by:
 * - External cron service (e.g., cron-job.org, EasyCron)
 * - Server cron job (crontab)
 * - Vercel Cron Jobs
 * - GitHub Actions scheduled workflow
 * 
 * Security:
 * - Should be protected with a secret token in production
 * - Or use Vercel Cron Jobs which are automatically authenticated
 * 
 * Example crontab entry:
 * ```
 * *\/5 * * * * curl -X POST https://hs6tools.com/api/cron/expire-orders -H "Authorization: Bearer YOUR_SECRET_TOKEN"
 * ```
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Security: Check authorization token
    // In production, you should set CRON_SECRET in your environment variables
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is set, validate the token
    if (cronSecret) {
      const expectedAuth = `Bearer ${cronSecret}`;
      if (authHeader !== expectedAuth) {
        console.warn('⚠️ [Cron API] Unauthorized cron request attempt');
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }
    } else {
      // In development, log a warning but allow the request
      console.warn('⚠️ [Cron API] CRON_SECRET not set - cron endpoint is unprotected!');
    }

    console.log('🕐 [Cron API] Expire orders cron job triggered');

    // Run the expiry job
    const result = await expirePendingOrders();

    const duration = Date.now() - startTime;

    // Log summary
    console.log('✅ [Cron API] Cron job completed:', {
      duration: `${duration}ms`,
      expiredCount: result.expiredCount,
      errorCount: result.errors.length,
      success: result.success
    });

    // Return detailed response
    return NextResponse.json({
      success: result.success,
      data: {
        expiredCount: result.expiredCount,
        errorCount: result.errors.length,
        errors: result.errors,
        duration
      },
      message: `Expired ${result.expiredCount} orders in ${duration}ms`
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ [Cron API] Fatal error in cron endpoint:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        duration
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/expire-orders
 * 
 * Get statistics about order expiry status.
 * Useful for monitoring and debugging.
 */
export async function GET(request: NextRequest) {
  try {
    // Security: Check authorization (same as POST)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret) {
      const expectedAuth = `Bearer ${cronSecret}`;
      if (authHeader !== expectedAuth) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    const stats = await getOrderExpiryStats();

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ [Cron API] Error fetching expiry stats:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

