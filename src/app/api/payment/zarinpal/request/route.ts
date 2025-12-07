import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requestPayment, rialsToTomans } from "@/lib/zarinpal";

/**
 * POST /api/payment/zarinpal/request
 * 
 * Creates a payment request for an order and returns Zarinpal payment URL
 * 
 * Request body:
 * {
 *   orderId: string
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   paymentUrl?: string,
 *   authority?: string,
 *   error?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Get order with user verification
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      include: {
        orderItems: true,
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if order is already paid
    if (order.paymentStatus === "PAID") {
      return NextResponse.json(
        { success: false, error: "Order is already paid" },
        { status: 400 }
      );
    }

    // Get payment settings or create default if not exists
    let paymentSettings = await prisma.paymentSettings.findFirst();
    
    if (!paymentSettings) {
      // Create default payment settings if not exists
      console.log('⚠️ [Payment Request] Payment settings not found, creating default...');
      paymentSettings = await prisma.paymentSettings.create({
        data: {
          zarinpalMerchantId: process.env.ZARINPAL_MERCHANT_ID || "",
          zarinpalApiKey: process.env.ZARINPAL_API_KEY || "",
          zarinpalSandbox: process.env.ZARINPAL_SANDBOX === "true" || true,
          allowBankTransfer: true,
          allowCashOnDelivery: true,
        }
      });
      console.log('✅ [Payment Request] Default payment settings created');
    }
    
    if (!paymentSettings.zarinpalMerchantId || paymentSettings.zarinpalMerchantId.trim() === "") {
      // Try to get from environment variable as fallback
      const envMerchantId = process.env.ZARINPAL_MERCHANT_ID;
      if (envMerchantId) {
        console.log('⚠️ [Payment Request] Using merchant ID from environment variable');
        paymentSettings.zarinpalMerchantId = envMerchantId;
      } else {
        console.error('❌ [Payment Request] Zarinpal Merchant ID is not configured');
        return NextResponse.json(
          { 
            success: false, 
            error: "Payment gateway is not configured. Please configure Zarinpal Merchant ID in admin settings or environment variables." 
          },
          { status: 500 }
        );
      }
    }

    // Validate merchant ID format (Zarinpal requires at least 36 characters)
    const merchantId = paymentSettings.zarinpalMerchantId.trim();
    if (merchantId.length < 36) {
      console.error('❌ [Payment Request] Invalid merchant ID length:', {
        length: merchantId.length,
        required: 36,
        isPlaceholder: merchantId.includes('your-mer') || merchantId.includes('placeholder'),
      });
      return NextResponse.json(
        { 
          success: false, 
          error: `Merchant ID نامعتبر است. Merchant ID باید حداقل 36 کاراکتر باشد. لطفاً Merchant ID معتبر را در تنظیمات ادمین یا متغیرهای محیطی تنظیم کنید.` 
        },
        { status: 400 }
      );
    }

    // Prepare payment request
    const amountInTomans = rialsToTomans(Number(order.totalAmount));
    
    // Validate amount (Zarinpal minimum is 1000 Toman = 10,000 Rial)
    if (amountInTomans < 1000) {
      console.error('❌ [Payment Request] Amount too low:', {
        amountInTomans,
        amountInRials: Number(order.totalAmount),
        minimum: 1000
      });
      return NextResponse.json(
        { 
          success: false, 
          error: `مبلغ سفارش باید حداقل ۱۰,۰۰۰ ریال باشد. مبلغ فعلی: ${Number(order.totalAmount).toLocaleString('fa-IR')} ریال` 
        },
        { status: 400 }
      );
    }
    
    // Ensure amount is an integer (Zarinpal requires integer)
    const amountInteger = Math.floor(amountInTomans);
    
    const description = `پرداخت سفارش ${order.orderNumber}`;
    
    // Validate description length (max 255 characters)
    if (description.length > 255) {
      console.error('❌ [Payment Request] Description too long:', description.length);
      return NextResponse.json(
        { 
          success: false, 
          error: "توضیحات سفارش بیش از حد مجاز است" 
        },
        { status: 400 }
      );
    }
    
    // Get callback URL based on locale
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const callbackUrl = `${origin}/api/payment/zarinpal/callback`;
    
    // Validate callback URL format
    try {
      new URL(callbackUrl);
    } catch {
      console.error('❌ [Payment Request] Invalid callback URL:', callbackUrl);
      return NextResponse.json(
        { 
          success: false, 
          error: "آدرس بازگشت نامعتبر است" 
        },
        { status: 400 }
      );
    }

    // Validate and format mobile number (if provided)
    let mobileFormatted: string | undefined = undefined;
    if (order.user.phone) {
      // Remove spaces, dashes, and other non-digit characters
      const phoneDigits = order.user.phone.replace(/\D/g, '');
      // Check if it's a valid Iranian mobile number (09xxxxxxxxx)
      if (phoneDigits.length === 11 && phoneDigits.startsWith('09')) {
        mobileFormatted = phoneDigits;
      } else if (phoneDigits.length === 10 && phoneDigits.startsWith('9')) {
        mobileFormatted = `0${phoneDigits}`;
      } else {
        console.warn('⚠️ [Payment Request] Invalid mobile format, skipping:', order.user.phone);
      }
    }

    // Validate email format (if provided)
    let emailFormatted: string | undefined = undefined;
    if (order.user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(order.user.email)) {
        emailFormatted = order.user.email;
      } else {
        console.warn('⚠️ [Payment Request] Invalid email format, skipping:', order.user.email);
      }
    }

    console.log('💳 [Payment Request] Creating payment request:', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      amountInRials: Number(order.totalAmount),
      amountInTomans: amountInteger,
      description,
      descriptionLength: description.length,
      callbackUrl,
      mobile: mobileFormatted || 'not provided',
      email: emailFormatted || 'not provided',
      merchantId: paymentSettings.zarinpalMerchantId.substring(0, 8) + '...', // Partial for security
      sandbox: paymentSettings.zarinpalSandbox,
    });

    // Request payment from Zarinpal
    const paymentResult = await requestPayment({
      merchantId: merchantId, // Use validated merchant ID
      amount: amountInteger, // Use integer amount
      description,
      callbackUrl,
      mobile: mobileFormatted,
      email: emailFormatted,
      sandbox: paymentSettings.zarinpalSandbox,
    });

    if (!paymentResult.success || !paymentResult.authority || !paymentResult.paymentUrl) {
      console.error('❌ [Payment Request] Failed:', paymentResult.error);
      return NextResponse.json(
        { 
          success: false, 
          error: paymentResult.error || "Failed to create payment request" 
        },
        { status: 500 }
      );
    }

    // Update order with payment authority
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentId: paymentResult.authority,
      },
    });

    console.log('✅ [Payment Request] Payment request created successfully:', {
      orderId: order.id,
      authority: paymentResult.authority,
    });

    return NextResponse.json({
      success: true,
      paymentUrl: paymentResult.paymentUrl,
      authority: paymentResult.authority,
    });

  } catch (error) {
    console.error("❌ [Payment Request] Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Internal server error" 
      },
      { status: 500 }
    );
  }
}

