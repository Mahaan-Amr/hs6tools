/**
 * Zarinpal Payment Gateway Service
 * 
 * This service handles payment processing using Zarinpal REST API
 * Documentation: https://www.zarinpal.com/docs/
 * 
 * API Endpoints:
 * - Payment Request: POST /pg/v4/payment/request.json
 * - Payment Verification: POST /pg/v4/payment/verify.json
 * - Unverified Transactions: GET /pg/v4/payment/unVerified.json
 * - Refund: POST /pg/v4/payment/refund.json
 */

// Zarinpal API Response Types
export interface ZarinpalPaymentRequestResponse {
  data: {
    code: number;
    message: string;
    authority: string;
    fee_type: string;
    fee: number;
  };
  errors: Array<{
    code: number;
    message: string;
    validations?: Record<string, string[]>;
  }>;
}

export interface ZarinpalPaymentVerifyResponse {
  data: {
    code: number;
    message: string;
    ref_id: number;
    fee_type: string;
    fee: number;
  };
  errors: Array<{
    code: number;
    message: string;
  }>;
}

export interface ZarinpalUnverifiedResponse {
  data: {
    code: number;
    message: string;
    authorities: Array<{
      authority: string;
      amount: number;
      callback_url: string;
      referer: string;
      date: string;
    }>;
  };
  errors: Array<{
    code: number;
    message: string;
  }>;
}

export interface ZarinpalRefundResponse {
  data: {
    code: number;
    message: string;
    refund_id: number;
  };
  errors: Array<{
    code: number;
    message: string;
  }>;
}

// Payment Request Options
export interface PaymentRequestOptions {
  merchantId: string;
  amount: number; // Amount in Rials (IRR) - ZarinPal v4 REST API expects Rials
  description: string;
  callbackUrl: string;
  mobile?: string;
  email?: string;
  sandbox?: boolean;
}

// Payment Verify Options
export interface PaymentVerifyOptions {
  merchantId: string;
  authority: string;
  amount: number; // Amount in Rials (IRR) - ZarinPal v4 REST API expects Rials
  sandbox?: boolean;
}

// Refund Options
export interface RefundOptions {
  merchantId: string;
  authority: string;
  sandbox?: boolean;
}

/**
 * Get Zarinpal API base URL based on sandbox mode
 */
function getApiBaseUrl(sandbox: boolean = false): string {
  if (sandbox) {
    return 'https://sandbox.zarinpal.com/pg/v4';
  }
  return 'https://api.zarinpal.com/pg/v4';
}

/**
 * Request payment from Zarinpal
 * Returns payment URL and authority for redirecting user
 */
export async function requestPayment(
  options: PaymentRequestOptions
): Promise<{ success: boolean; authority?: string; paymentUrl?: string; error?: string }> {
  try {
    const baseUrl = getApiBaseUrl(options.sandbox);
    const url = `${baseUrl}/payment/request.json`;

    // Validate merchant ID format (Zarinpal requires at least 36 characters)
    if (!options.merchantId || options.merchantId.trim().length < 36) {
      console.error('❌ [Zarinpal] Invalid merchant ID:', {
        length: options.merchantId?.length || 0,
        required: 36,
      });
      return {
        success: false,
        error: `Merchant ID نامعتبر است. Merchant ID باید حداقل 36 کاراکتر باشد.`,
      };
    }

    // Ensure amount is an integer (Zarinpal requires integer)
    const amountInteger = Math.floor(options.amount);
    
    // Validate amount is at least 10,000 Rials
    if (amountInteger < 10000) {
      console.error('❌ [Zarinpal] Amount too low:', amountInteger);
      return {
        success: false,
        error: `مبلغ باید حداقل ۱۰,۰۰۰ ریال باشد. مبلغ فعلی: ${amountInteger.toLocaleString('fa-IR')} ریال`,
      };
    }

    const requestBody: Record<string, string | number> = {
      merchant_id: options.merchantId,
      amount: amountInteger,
      description: options.description,
      callback_url: options.callbackUrl,
    };
    
    // Only add mobile if provided and valid
    if (options.mobile) {
      requestBody.mobile = options.mobile;
    }
    
    // Only add email if provided and valid
    if (options.email) {
      requestBody.email = options.email;
    }

    console.log('💳 [Zarinpal] Payment request body:', {
      url,
      merchantId: options.merchantId.substring(0, 8) + '...', // Partial for security
      amount: amountInteger,
      description: options.description,
      descriptionLength: options.description.length,
      callbackUrl: options.callbackUrl,
      hasMobile: !!options.mobile,
      hasEmail: !!options.email,
      sandbox: options.sandbox,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data: ZarinpalPaymentRequestResponse = await response.json();

    if (!response.ok || data.errors?.length > 0) {
      const errorMessage = data.errors?.[0]?.message || 'خطا در درخواست پرداخت';
      const errorCode = data.errors?.[0]?.code || response.status;
      console.error('❌ [Zarinpal] Payment request failed:', {
        status: response.status,
        errors: data.errors,
      });
      return {
        success: false,
        error: `${errorMessage} (کد: ${errorCode})`,
      };
    }

    if (data.data.code === 100) {
      const authority = data.data.authority;
      const paymentUrl = options.sandbox
        ? `https://sandbox.zarinpal.com/pg/StartPay/${authority}`
        : `https://www.zarinpal.com/pg/StartPay/${authority}`;

      console.log('✅ [Zarinpal] Payment request successful:', {
        authority,
        paymentUrl,
      });

      return {
        success: true,
        authority,
        paymentUrl,
      };
    } else {
      const errorMessage = data.data.message || 'خطا در درخواست پرداخت';
      console.error('❌ [Zarinpal] Payment request failed:', {
        code: data.data.code,
        message: data.data.message,
      });
      return {
        success: false,
        error: `${errorMessage} (کد: ${data.data.code})`,
      };
    }
  } catch (error) {
    console.error('❌ [Zarinpal] Payment request exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'خطا در ارتباط با درگاه پرداخت',
    };
  }
}

/**
 * Verify payment with Zarinpal
 * Call this after user returns from payment page
 */
export async function verifyPayment(
  options: PaymentVerifyOptions
): Promise<{ success: boolean; refId?: number; error?: string }> {
  try {
    const baseUrl = getApiBaseUrl(options.sandbox);
    const url = `${baseUrl}/payment/verify.json`;

    const requestBody = {
      merchant_id: options.merchantId,
      authority: options.authority,
      amount: options.amount,
    };

    console.log('💳 [Zarinpal] Payment verification:', {
      url,
      merchantId: options.merchantId,
      authority: options.authority,
      amount: options.amount,
      sandbox: options.sandbox,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data: ZarinpalPaymentVerifyResponse = await response.json();

    if (!response.ok || data.errors?.length > 0) {
      const errorMessage = data.errors?.[0]?.message || 'خطا در تأیید پرداخت';
      const errorCode = data.errors?.[0]?.code || response.status;
      console.error('❌ [Zarinpal] Payment verification failed:', {
        status: response.status,
        errors: data.errors,
      });
      return {
        success: false,
        error: `${errorMessage} (کد: ${errorCode})`,
      };
    }

    // Code 100 means payment was successful
    if (data.data.code === 100) {
      const refId = data.data.ref_id;
      console.log('✅ [Zarinpal] Payment verified successfully:', {
        refId,
        fee: data.data.fee,
        feeType: data.data.fee_type,
      });
      return {
        success: true,
        refId,
      };
    } else {
      // Other codes indicate payment failure or cancellation
      const errorMessage = data.data.message || 'پرداخت ناموفق بود';
      console.error('❌ [Zarinpal] Payment verification failed:', {
        code: data.data.code,
        message: data.data.message,
      });
      return {
        success: false,
        error: `${errorMessage} (کد: ${data.data.code})`,
      };
    }
  } catch (error) {
    console.error('❌ [Zarinpal] Payment verification exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'خطا در ارتباط با درگاه پرداخت',
    };
  }
}

/**
 * Get unverified transactions
 * Useful for checking payments that weren't verified
 */
export async function getUnverifiedTransactions(
  merchantId: string,
  sandbox: boolean = false
): Promise<{ success: boolean; authorities?: string[]; error?: string }> {
  try {
    const baseUrl = getApiBaseUrl(sandbox);
    const url = `${baseUrl}/payment/unVerified.json?merchant_id=${merchantId}`;

    console.log('💳 [Zarinpal] Fetching unverified transactions:', {
      url,
      merchantId,
      sandbox,
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data: ZarinpalUnverifiedResponse = await response.json();

    if (!response.ok || data.errors?.length > 0) {
      const errorMessage = data.errors?.[0]?.message || 'خطا در دریافت تراکنش‌ها';
      console.error('❌ [Zarinpal] Unverified transactions fetch failed:', {
        status: response.status,
        errors: data.errors,
      });
      return {
        success: false,
        error: errorMessage,
      };
    }

    if (data.data.code === 100) {
      const authorities = data.data.authorities?.map((a) => a.authority) || [];
      console.log('✅ [Zarinpal] Unverified transactions fetched:', {
        count: authorities.length,
      });
      return {
        success: true,
        authorities,
      };
    } else {
      return {
        success: false,
        error: data.data.message || 'خطا در دریافت تراکنش‌ها',
      };
    }
  } catch (error) {
    console.error('❌ [Zarinpal] Unverified transactions exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'خطا در ارتباط با درگاه پرداخت',
    };
  }
}

/**
 * Refund a payment
 * Note: Refund requires special permissions from Zarinpal
 */
export async function refundPayment(
  options: RefundOptions
): Promise<{ success: boolean; refundId?: number; error?: string }> {
  try {
    const baseUrl = getApiBaseUrl(options.sandbox);
    const url = `${baseUrl}/payment/refund.json`;

    const requestBody = {
      merchant_id: options.merchantId,
      authority: options.authority,
    };

    console.log('💳 [Zarinpal] Payment refund:', {
      url,
      merchantId: options.merchantId,
      authority: options.authority,
      sandbox: options.sandbox,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data: ZarinpalRefundResponse = await response.json();

    if (!response.ok || data.errors?.length > 0) {
      const errorMessage = data.errors?.[0]?.message || 'خطا در بازپرداخت';
      console.error('❌ [Zarinpal] Payment refund failed:', {
        status: response.status,
        errors: data.errors,
      });
      return {
        success: false,
        error: errorMessage,
      };
    }

    if (data.data.code === 100) {
      const refundId = data.data.refund_id;
      console.log('✅ [Zarinpal] Payment refunded successfully:', {
        refundId,
      });
      return {
        success: true,
        refundId,
      };
    } else {
      return {
        success: false,
        error: data.data.message || 'خطا در بازپرداخت',
      };
    }
  } catch (error) {
    console.error('❌ [Zarinpal] Payment refund exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'خطا در ارتباط با درگاه پرداخت',
    };
  }
}

/**
 * Convert Rials to Tomans (for display purposes)
 * Note: ZarinPal v4 REST API expects amounts in Rials, not Tomans
 * This function is for display formatting only
 */
export function rialsToTomans(rials: number): number {
  return Math.round(rials / 10);
}

/**
 * Convert Tomans to Rials
 * Note: ZarinPal v4 REST API expects amounts in Rials, not Tomans
 * This function is for calculation purposes only
 */
export function tomansToRials(tomans: number): number {
  return tomans * 10;
}

