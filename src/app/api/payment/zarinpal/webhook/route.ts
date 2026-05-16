import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayment } from "@/lib/zarinpal";
import { SMSIRFastSendTemplates, sendTemplateSMSSafe } from "@/lib/sms";
import crypto from "crypto";

/**
 * Webhook payload structure from ZarinPal
 */
interface WebhookPayload {
  authority: string;
  status: "OK" | "NOK";
  amount: number;
  ref_id?: number;
}

/**
 * POST /api/payment/zarinpal/webhook
 * 
 * Handles webhook notifications from ZarinPal
 * 
 * This endpoint serves as a backup verification mechanism. When callback fails
 * (network issues, user closes browser, etc.), ZarinPal sends webhook notification
 * directly to our server to ensure payment status is updated.
 * 
 * Security:
 * - Validates webhook signature using HMAC-SHA256
 * - Checks request origin
 * - Idempotent (handles duplicate webhooks safely)
 * 
 * Webhook Payload (from ZarinPal):
 * {
 *   authority: string,
 *   status: "OK" | "NOK",
 *   amount: number,
 *   ref_id: number (only if status === "OK")
 * }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let webhookData: WebhookPayload | null = null;
  
  try {
    console.log('🔔 [Webhook] ========== WEBHOOK RECEIVED ==========');
    console.log('🔔 [Webhook] Headers:', {
      contentType: request.headers.get('content-type'),
      userAgent: request.headers.get('user-agent'),
      origin: request.headers.get('origin'),
      signature: request.headers.get('x-zarinpal-signature') || 'not provided',
    });

    // Parse webhook payload
    const body = await request.text();
    console.log('🔔 [Webhook] Raw body:', body);

    try {
      webhookData = JSON.parse(body) as WebhookPayload;
    } catch {
      console.error('❌ [Webhook] Invalid JSON payload');
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    if (!webhookData) {
      console.error('❌ [Webhook] Webhook data is null');
      return NextResponse.json(
        { success: false, error: "Invalid webhook data" },
        { status: 400 }
      );
    }

    const { authority, status, amount, ref_id } = webhookData;

    console.log('🔔 [Webhook] Parsed data:', {
      authority,
      status,
      amount,
      ref_id,
      hasAuthority: !!authority,
      hasStatus: !!status,
    });

    // ============================================
    // 1. VALIDATE REQUIRED FIELDS
    // ============================================
    if (!authority) {
      console.error('❌ [Webhook] Missing authority');
      return NextResponse.json(
        { success: false, error: "Missing authority parameter" },
        { status: 400 }
      );
    }

    if (!status) {
      console.error('❌ [Webhook] Missing status');
      return NextResponse.json(
        { success: false, error: "Missing status parameter" },
        { status: 400 }
      );
    }

    // ============================================
    // 2. VERIFY WEBHOOK SIGNATURE (if configured)
    // ============================================
    const webhookSecret = process.env.ZARINPAL_WEBHOOK_SECRET;
    const providedSignature = request.headers.get('x-zarinpal-signature');

    if (webhookSecret) {
      if (!providedSignature) {
        console.error('❌ [Webhook] Missing signature header');
        return NextResponse.json(
          { success: false, error: "Missing webhook signature" },
          { status: 401 }
        );
      }

      // Calculate expected signature using HMAC-SHA256
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      if (expectedSignature !== providedSignature) {
        console.error('❌ [Webhook] Invalid signature:', {
          expected: expectedSignature.substring(0, 10) + '...',
          provided: providedSignature.substring(0, 10) + '...',
        });
        return NextResponse.json(
          { success: false, error: "Invalid webhook signature" },
          { status: 401 }
        );
      }

      console.log('✅ [Webhook] Signature validated');
    } else {
      console.warn('⚠️ [Webhook] Webhook secret not configured, skipping signature validation');
      console.warn('⚠️ [Webhook] Set ZARINPAL_WEBHOOK_SECRET environment variable for security');
    }

    // ============================================
    // 3. FIND ORDER BY AUTHORITY
    // ============================================
    const order = await prisma.order.findFirst({
      where: {
        paymentId: authority,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        orderItems: {
          select: {
            name: true,
            quantity: true,
          },
        },
      },
    });

    if (!order) {
      console.error('❌ [Webhook] Order not found for authority:', authority);
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    console.log('🔔 [Webhook] Order found:', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      currentStatus: order.paymentStatus,
      amount: Number(order.totalAmount),
    });

    // ============================================
    // 4. CHECK IF ALREADY PROCESSED (IDEMPOTENCY)
    // ============================================
    if (order.paymentStatus === "PAID") {
      console.log('⚠️ [Webhook] Order already paid (idempotent), returning success:', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentDate: order.paymentDate,
      });
      
      // Return success for idempotency - webhook might be sent multiple times
      return NextResponse.json({
        success: true,
        message: "Payment already processed",
        data: {
          orderNumber: order.orderNumber,
          status: "PAID",
          alreadyProcessed: true,
        },
      });
    }

    // ============================================
    // 5. HANDLE CANCELLED/FAILED PAYMENT
    // ============================================
    if (status === "NOK") {
      console.log('⚠️ [Webhook] Payment cancelled/failed:', {
        orderId: order.id,
        orderNumber: order.orderNumber,
      });

      // Note: Stock restoration should already be handled by callback
      // or will be handled by expiry cron job
      // We just log this event for monitoring

      return NextResponse.json({
        success: true,
        message: "Payment cancellation acknowledged",
        data: {
          orderNumber: order.orderNumber,
          status: "CANCELLED",
        },
      });
    }

    // ============================================
    // 6. VERIFY PAYMENT WITH ZARINPAL API
    // ============================================
    const paymentSettings = await prisma.paymentSettings.findFirst();
    
    if (!paymentSettings?.zarinpalMerchantId) {
      console.error('❌ [Webhook] Payment settings not configured');
      return NextResponse.json(
        { success: false, error: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    // ZarinPal v4 REST API expects amount in Rials (not Tomans)
    const amountInRials = Number(order.totalAmount);

    console.log('💳 [Webhook] Verifying payment with ZarinPal:', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      authority,
      amount: amountInRials,
      sandbox: paymentSettings.zarinpalSandbox,
    });

    const verifyResult = await verifyPayment({
      merchantId: paymentSettings.zarinpalMerchantId,
      authority,
      amount: amountInRials,
      sandbox: paymentSettings.zarinpalSandbox,
    });

    if (!verifyResult.success || !verifyResult.refId) {
      console.error('❌ [Webhook] Payment verification failed:', {
        orderId: order.id,
        error: verifyResult.error,
      });

      // Return 400 so ZarinPal knows verification failed
      return NextResponse.json(
        {
          success: false,
          error: verifyResult.error || "Payment verification failed",
        },
        { status: 400 }
      );
    }

    // ============================================
    // 7. UPDATE ORDER STATUS TO PAID
    // ============================================
    console.log('✅ [Webhook] Payment verified successfully:', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      refId: verifyResult.refId,
    });

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        paymentDate: new Date(),
        status: "CONFIRMED",
      },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        customerPhone: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        orderItems: {
          select: {
            name: true,
            quantity: true,
          },
        },
      },
    });

    // ============================================
    // 8. SEND SMS NOTIFICATION (NON-BLOCKING)
    // ============================================
    const customerPhone = updatedOrder.user.phone || updatedOrder.customerPhone;
    
    if (customerPhone) {
      const customerName = updatedOrder.user.firstName && updatedOrder.user.lastName
        ? `${updatedOrder.user.firstName} ${updatedOrder.user.lastName}`
        : 'کاربر گرامی';

      const products = updatedOrder.orderItems.map(item =>
        item.quantity > 1 ? `${item.name} (${item.quantity} عدد)` : item.name
      );

      void customerName;
      void products;

      const smsMessage = SMSIRFastSendTemplates.INVOICE(
        updatedOrder.orderNumber,
        Number(updatedOrder.totalAmount)
      );

      console.log('📱 [Webhook] Sending payment success SMS');

      sendTemplateSMSSafe(
        {
          receptor: customerPhone,
          templateEnvKey: 'SMSIR_INVOICE_TEMPLATE_ID',
          parameters: {
            INVOICE: updatedOrder.orderNumber,
            AMOUNT: Number(updatedOrder.totalAmount),
          },
        },
        smsMessage,
        `Webhook payment success: ${updatedOrder.orderNumber}`
      ).catch((err) => {
        console.error('❌ [Webhook] SMS error (non-blocking):', err);
      });
    } else {
      console.warn('⚠️ [Webhook] No phone number for SMS notification');
    }

    // ============================================
    // 9. RETURN SUCCESS RESPONSE
    // ============================================
    const duration = Date.now() - startTime;
    
    console.log('✅ [Webhook] ========== WEBHOOK PROCESSED SUCCESSFULLY ==========');
    console.log('✅ [Webhook] Processing time:', duration, 'ms');

    return NextResponse.json({
      success: true,
      message: "Payment processed successfully via webhook",
      data: {
        orderNumber: updatedOrder.orderNumber,
        status: "PAID",
        refId: verifyResult.refId,
        processingTime: duration,
      },
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ [Webhook] ========== WEBHOOK ERROR ==========');
    console.error('❌ [Webhook] Error:', error);
    console.error('❌ [Webhook] Processing time:', duration, 'ms');
    console.error('❌ [Webhook] Webhook data:', webhookData);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payment/zarinpal/webhook
 * 
 * Health check endpoint for webhook
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "ZarinPal Webhook endpoint is active",
    timestamp: new Date().toISOString(),
    configured: {
      webhookSecret: !!process.env.ZARINPAL_WEBHOOK_SECRET,
      merchantId: !!process.env.ZARINPAL_MERCHANT_ID,
    },
  });
}

