import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayment } from "@/lib/zarinpal";
import {
  SMSIRFastSendTemplates,
  sendSMSSafe,
  SMSTemplates,
  sendTemplateSMSSafe,
} from "@/lib/sms";
import { restoreStockAndUpdateOrder } from "@/lib/inventory";
import { getSiteOrigin } from "@/utils/domain";

function parseZarinpalSandbox(value: string | undefined): boolean {
  if (value === "false") return false;
  if (value === "true") return true;
  return true;
}

/**
 * GET /api/payment/zarinpal/callback
 *
 * Handles callback from Zarinpal after payment
 *
 * Query parameters:
 * - Authority: Payment authority from Zarinpal
 * - Status: Payment status (OK or NOK)
 *
 * Redirects to:
 * - Success page if payment verified
 * - Failure page if payment failed
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const authority = searchParams.get("Authority");
    const status = searchParams.get("Status");

    // Validate required parameters
    if (!authority) {
      console.error("❌ [Payment Callback] Missing Authority parameter");
      const origin = getSiteOrigin(request);
      return NextResponse.redirect(
        new URL("/fa/checkout?error=missing_authority", origin),
      );
    }

    // Find order by payment authority
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
      },
    });

    if (!order) {
      console.error(
        "❌ [Payment Callback] Order not found for authority:",
        authority,
      );
      const origin = getSiteOrigin(request);
      return NextResponse.redirect(
        new URL("/fa/checkout?error=order_not_found", origin),
      );
    }

    // ✅ FIX #2: Check if order is already paid (duplicate payment protection)
    if (order.paymentStatus === "PAID") {
      // Redirect to success page with existing payment info
      const locale = "fa"; // Default locale
      const origin = getSiteOrigin(request);
      const successUrl = `${origin}/${locale}/checkout/success?orderNumber=${order.orderNumber}&refId=${order.paymentId}`;

      return NextResponse.redirect(successUrl);
    }

    const paymentSettings = await prisma.paymentSettings.findFirst();
    const merchantId =
      paymentSettings?.zarinpalMerchantId || process.env.ZARINPAL_MERCHANT_ID || "";
    if (!merchantId.trim()) {
      console.error(
        "❌ [Payment Callback] Zarinpal Merchant ID is not configured",
      );
      const origin = getSiteOrigin(request);
      return NextResponse.redirect(
        new URL("/fa/checkout?error=payment_config_error", origin),
      );
    }

    // Check if payment was cancelled (Status = NOK)
    if (status === "NOK") {
      // ✅ FIX #1: Restore stock and update order status atomically
      try {
        await restoreStockAndUpdateOrder(
          order.id,
          "FAILED",
          undefined, // Keep order status as is
        );
      } catch (error) {
        console.error(
          "❌ [Payment Callback] Error restoring stock for cancelled payment:",
          error,
        );
        // Continue even if stock restoration fails - order is still marked as failed
      }

      // Send SMS notification to customer (non-blocking)
      const customerPhone = order.user.phone || order.customerPhone;
      if (customerPhone) {
        const customerName =
          order.user.firstName && order.user.lastName
            ? `${order.user.firstName} ${order.user.lastName}`
            : "کاربر گرامی";

        sendSMSSafe(
          {
            receptor: customerPhone,
            message: SMSTemplates.PAYMENT_FAILED(
              order.orderNumber,
              customerName,
              "پرداخت توسط کاربر لغو شد",
            ),
          },
          `Payment cancelled: ${order.orderNumber}`,
        ).catch((err) => {
          console.error("❌ [Payment Callback] SMS error (non-blocking):", err);
        });
      }

      const origin = getSiteOrigin(request);
      return NextResponse.redirect(
        new URL(
          `/fa/checkout?error=payment_cancelled&orderNumber=${order.orderNumber}`,
          origin,
        ),
      );
    }

    // Verify payment with Zarinpal
    // ZarinPal v4 REST API expects amount in Rials (not Tomans)
    const amountInRials = Number(order.totalAmount);

    const verifyResult = await verifyPayment({
      merchantId: merchantId.trim(),
      authority,
      amount: amountInRials,
      sandbox:
        paymentSettings?.zarinpalSandbox ??
        parseZarinpalSandbox(process.env.ZARINPAL_SANDBOX),
    });

    if (!verifyResult.success || !verifyResult.refId) {
      console.error("❌ [Payment Callback] Payment verification failed:", {
        orderId: order.id,
        error: verifyResult.error,
      });

      // ✅ FIX #1: Restore stock and update order status atomically
      try {
        await restoreStockAndUpdateOrder(
          order.id,
          "FAILED",
          undefined, // Keep order status as is
        );
      } catch (error) {
        console.error(
          "❌ [Payment Callback] Error restoring stock for failed verification:",
          error,
        );
        // Continue even if stock restoration fails - order is still marked as failed
      }

      // Send SMS notification to customer (non-blocking)
      const customerPhone = order.user.phone || order.customerPhone;
      if (customerPhone) {
        const customerName =
          order.user.firstName && order.user.lastName
            ? `${order.user.firstName} ${order.user.lastName}`
            : "کاربر گرامی";

        sendSMSSafe(
          {
            receptor: customerPhone,
            message: SMSTemplates.PAYMENT_FAILED(
              order.orderNumber,
              customerName,
              verifyResult.error,
            ),
          },
          `Payment failed: ${order.orderNumber}`,
        ).catch((err) => {
          console.error("❌ [Payment Callback] SMS error (non-blocking):", err);
        });
      }

      const origin = getSiteOrigin(request);
      return NextResponse.redirect(
        new URL(
          `/fa/checkout?error=payment_failed&orderNumber=${order.orderNumber}&message=${encodeURIComponent(verifyResult.error || "پرداخت ناموفق بود")}`,
          origin,
        ),
      );
    }

    // Payment verified successfully

    const paidUpdate = await prisma.order.updateMany({
      where: {
        id: order.id,
        paymentStatus: { not: "PAID" },
      },
      data: {
        paymentStatus: "PAID",
        paymentDate: new Date(),
        status: "CONFIRMED",
      },
    });

    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      select: {
        id: true,
        orderNumber: true,
        userId: true,
        totalAmount: true,
        customerPhone: true,
        orderItems: {
          select: { name: true, quantity: true },
        },
        user: {
          select: { firstName: true, lastName: true, phone: true },
        },
      },
    });

    if (!updatedOrder) {
      const origin = getSiteOrigin(request);
      return NextResponse.redirect(
        new URL("/fa/checkout?error=order_not_found", origin),
      );
    }

    // Send payment success SMS (non-blocking) with product details
    const customerPhone = updatedOrder.user.phone || updatedOrder.customerPhone;

    if (customerPhone && paidUpdate.count === 1) {
      const totalAmount = Number(updatedOrder.totalAmount);

      const smsMessage = SMSIRFastSendTemplates.INVOICE(
        updatedOrder.orderNumber,
        totalAmount,
      );

      // Send SMS (non-blocking - don't await, but log result)
      sendTemplateSMSSafe(
        {
          receptor: customerPhone,
          templateEnvKey: "SMSIR_INVOICE_TEMPLATE_ID",
          parameters: {
            INVOICE: updatedOrder.orderNumber,
            AMOUNT: totalAmount,
          },
        },
        smsMessage,
        `Payment success: ${updatedOrder.orderNumber}`,
      ).catch((err) => {
        console.error(
          "❌ [Payment Callback] SMS sending error (non-blocking):",
          err,
        );
      });
    } else if (!customerPhone) {
      console.warn("⚠️ [Payment Callback] No phone number found for SMS:", {
        orderNumber: updatedOrder.orderNumber,
        userId: updatedOrder.userId,
        userPhone: updatedOrder.user.phone,
        customerPhone: updatedOrder.customerPhone,
      });
    } else {
    }

    // Redirect to success page
    const locale = "fa"; // Default locale, can be enhanced to detect from order
    const origin = getSiteOrigin(request);
    const successUrl = `${origin}/${locale}/checkout/success?orderNumber=${updatedOrder.orderNumber}&refId=${verifyResult.refId}`;

    return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error("❌ [Payment Callback] Error:", error);
    const origin = getSiteOrigin(request);
    return NextResponse.redirect(
      new URL("/fa/checkout?error=internal_error", origin),
    );
  }
}
