import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayment, rialsToTomans } from "@/lib/zarinpal";
import { sendSMSSafe, SMSTemplates } from "@/lib/sms";
import { restoreStockAndUpdateOrder } from "@/lib/inventory";

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
    const fullUrl = request.url;
    const referer = request.headers.get("referer");

    console.log('💳 [Payment Callback] ========== CALLBACK RECEIVED ==========');
    console.log('💳 [Payment Callback] Full URL:', fullUrl);
    console.log('💳 [Payment Callback] Referer:', referer);
    console.log('💳 [Payment Callback] Query params:', {
      authority,
      status,
      allParams: Object.fromEntries(searchParams.entries()),
    });

    // Validate required parameters
    if (!authority) {
      console.error('❌ [Payment Callback] Missing Authority parameter');
      return NextResponse.redirect(
        new URL("/fa/checkout?error=missing_authority", request.url)
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
      console.error('❌ [Payment Callback] Order not found for authority:', authority);
      return NextResponse.redirect(
        new URL("/fa/checkout?error=order_not_found", request.url)
      );
    }

    // ✅ FIX #2: Check if order is already paid (duplicate payment protection)
    if (order.paymentStatus === "PAID") {
      console.log('⚠️ [Payment Callback] Order already paid, skipping verification:', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus
      });
      
      // Redirect to success page with existing payment info
      const locale = "fa"; // Default locale
      const origin = request.nextUrl.origin;
      const successUrl = `${origin}/${locale}/checkout/success?orderNumber=${order.orderNumber}&refId=${order.paymentId}`;
      
      console.log('✅ [Payment Callback] Redirecting to success (already paid)');
      return NextResponse.redirect(successUrl);
    }

    // Get payment settings or create default if not exists (same logic as request route)
    let paymentSettings = await prisma.paymentSettings.findFirst();
    
    if (!paymentSettings) {
      // Create default payment settings if not exists
      console.log('⚠️ [Payment Callback] Payment settings not found, creating default...');
      paymentSettings = await prisma.paymentSettings.create({
        data: {
          zarinpalMerchantId: process.env.ZARINPAL_MERCHANT_ID || "",
          zarinpalApiKey: process.env.ZARINPAL_API_KEY || "",
          zarinpalSandbox: process.env.ZARINPAL_SANDBOX === "true" || true,
          allowBankTransfer: true,
          allowCashOnDelivery: true,
        }
      });
      console.log('✅ [Payment Callback] Default payment settings created');
    }
    
    // Fallback to environment variable if merchant ID is empty
    if (!paymentSettings.zarinpalMerchantId || paymentSettings.zarinpalMerchantId.trim() === "") {
      const envMerchantId = process.env.ZARINPAL_MERCHANT_ID;
      if (envMerchantId) {
        console.log('⚠️ [Payment Callback] Using merchant ID from environment variable');
        paymentSettings.zarinpalMerchantId = envMerchantId;
      } else {
        console.error('❌ [Payment Callback] Zarinpal Merchant ID is not configured');
        return NextResponse.redirect(
          new URL("/fa/checkout?error=payment_config_error", request.url)
        );
      }
    }

    // Check if payment was cancelled (Status = NOK)
    if (status === "NOK") {
      console.log('⚠️ [Payment Callback] Payment cancelled by user:', {
        orderId: order.id,
        orderNumber: order.orderNumber,
      });

      // ✅ FIX #1: Restore stock and update order status atomically
      try {
        await restoreStockAndUpdateOrder(
          order.id,
          "FAILED",
          undefined, // Keep order status as is
          "Payment cancelled by user"
        );
        console.log('✅ [Payment Callback] Stock restored for cancelled payment');
      } catch (error) {
        console.error('❌ [Payment Callback] Error restoring stock for cancelled payment:', error);
        // Continue even if stock restoration fails - order is still marked as failed
      }

      // Send SMS notification to customer (non-blocking)
      const customerPhone = order.user.phone || order.customerPhone;
      if (customerPhone) {
        const customerName = order.user.firstName && order.user.lastName
          ? `${order.user.firstName} ${order.user.lastName}`
          : 'کاربر گرامی';

        sendSMSSafe(
          {
            receptor: customerPhone,
            message: SMSTemplates.PAYMENT_FAILED(order.orderNumber, customerName, 'پرداخت توسط کاربر لغو شد')
          },
          `Payment cancelled: ${order.orderNumber}`
        ).catch(err => {
          console.error('❌ [Payment Callback] SMS error (non-blocking):', err);
        });
      }

      return NextResponse.redirect(
        new URL(`/fa/checkout?error=payment_cancelled&orderNumber=${order.orderNumber}`, request.url)
      );
    }

    // Verify payment with Zarinpal
    const amountInTomans = rialsToTomans(Number(order.totalAmount));
    
    console.log('💳 [Payment Callback] Verifying payment:', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      authority,
      amount: amountInTomans,
      sandbox: paymentSettings.zarinpalSandbox,
    });

    const verifyResult = await verifyPayment({
      merchantId: paymentSettings.zarinpalMerchantId,
      authority,
      amount: amountInTomans,
      sandbox: paymentSettings.zarinpalSandbox,
    });

    if (!verifyResult.success || !verifyResult.refId) {
      console.error('❌ [Payment Callback] Payment verification failed:', {
        orderId: order.id,
        error: verifyResult.error,
      });

      // ✅ FIX #1: Restore stock and update order status atomically
      try {
        await restoreStockAndUpdateOrder(
          order.id,
          "FAILED",
          undefined, // Keep order status as is
          `Payment verification failed: ${verifyResult.error}`
        );
        console.log('✅ [Payment Callback] Stock restored for failed verification');
      } catch (error) {
        console.error('❌ [Payment Callback] Error restoring stock for failed verification:', error);
        // Continue even if stock restoration fails - order is still marked as failed
      }

      // Send SMS notification to customer (non-blocking)
      const customerPhone = order.user.phone || order.customerPhone;
      if (customerPhone) {
        const customerName = order.user.firstName && order.user.lastName
          ? `${order.user.firstName} ${order.user.lastName}`
          : 'کاربر گرامی';

        sendSMSSafe(
          {
            receptor: customerPhone,
            message: SMSTemplates.PAYMENT_FAILED(order.orderNumber, customerName, verifyResult.error)
          },
          `Payment failed: ${order.orderNumber}`
        ).catch(err => {
          console.error('❌ [Payment Callback] SMS error (non-blocking):', err);
        });
      }

      return NextResponse.redirect(
        new URL(`/fa/checkout?error=payment_failed&orderNumber=${order.orderNumber}&message=${encodeURIComponent(verifyResult.error || "پرداخت ناموفق بود")}`, request.url)
      );
    }

    // Payment verified successfully
    console.log('✅ [Payment Callback] Payment verified successfully:', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      refId: verifyResult.refId,
    });

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        paymentDate: new Date(),
        status: "CONFIRMED", // Update order status to confirmed
      },
      select: {
        id: true,
        orderNumber: true,
        userId: true,
        totalAmount: true,
        customerPhone: true,
        orderItems: {
          select: { name: true, quantity: true }
        },
        user: {
          select: { firstName: true, lastName: true, phone: true }
        }
      }
    });

    // Send payment success SMS (non-blocking) with product details
    const customerPhone = updatedOrder.user.phone || updatedOrder.customerPhone;
    console.log('📱 [Payment Callback] SMS sending check:', {
      orderNumber: updatedOrder.orderNumber,
      userPhone: updatedOrder.user.phone,
      customerPhone: updatedOrder.customerPhone,
      finalPhone: customerPhone,
      hasPhone: !!customerPhone,
    });
    
    if (customerPhone) {
      const customerName = updatedOrder.user.firstName && updatedOrder.user.lastName
        ? `${updatedOrder.user.firstName} ${updatedOrder.user.lastName}`
        : 'کاربر گرامی';
      
      // Prepare product list for SMS
      const products = updatedOrder.orderItems.map(item => 
        item.quantity > 1 ? `${item.name} (${item.quantity} عدد)` : item.name
      );
      const totalAmount = Number(updatedOrder.totalAmount);
      
      const smsMessage = SMSTemplates.ORDER_PAYMENT_SUCCESS(
        updatedOrder.orderNumber,
        customerName,
        products,
        totalAmount,
        verifyResult.refId ? String(verifyResult.refId) : undefined
      );
      
      console.log('📱 [Payment Callback] Sending payment success SMS:', {
        orderNumber: updatedOrder.orderNumber,
        phone: customerPhone,
        customerName,
        productsCount: products.length,
        totalAmount,
        refId: verifyResult.refId,
        messageLength: smsMessage.length,
        messagePreview: smsMessage.substring(0, 100) + '...',
      });
      
      // Send SMS (non-blocking - don't await, but log result)
      sendSMSSafe(
        {
          receptor: customerPhone,
          message: smsMessage,
        },
        `Payment success: ${updatedOrder.orderNumber}`
      ).catch((err) => {
        console.error('❌ [Payment Callback] SMS sending error (non-blocking):', err);
      });
    } else {
      console.warn('⚠️ [Payment Callback] No phone number found for SMS:', {
        orderNumber: updatedOrder.orderNumber,
        userId: updatedOrder.userId,
        userPhone: updatedOrder.user.phone,
        customerPhone: updatedOrder.customerPhone,
      });
    }

    // Redirect to success page
    const locale = "fa"; // Default locale, can be enhanced to detect from order
    const origin = request.nextUrl.origin;
    const successUrl = `${origin}/${locale}/checkout/success?orderNumber=${updatedOrder.orderNumber}&refId=${verifyResult.refId}`;
    
    console.log('✅ [Payment Callback] ========== REDIRECTING TO SUCCESS ==========');
    console.log('✅ [Payment Callback] Redirect details:', {
      origin,
      locale,
      orderNumber: updatedOrder.orderNumber,
      refId: verifyResult.refId,
      successUrl,
      requestUrl: request.url,
      requestOrigin: request.nextUrl.origin,
    });
    
    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error("❌ [Payment Callback] Error:", error);
    return NextResponse.redirect(
      new URL("/fa/checkout?error=internal_error", request.url)
    );
  }
}

