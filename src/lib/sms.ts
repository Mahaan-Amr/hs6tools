/**
 * Kavehnegar SMS Service
 * 
 * This service handles SMS sending using Kavehnegar API
 * Documentation: https://kavenegar.com/rest.html
 * 
 * Official Package: kavenegar (not kavenegar-api)
 * Usage: Kavenegar.KavenegarApi({apikey: 'YOUR_API_KEY'})
 */

import * as Kavenegar from 'kavenegar';
import type { kavenegar } from 'kavenegar';

// Type definitions for Kavehnegar responses
interface MessageEntry {
  messageid: number;
  message: string;
  status: number;
  statustext: string;
  sender: string;
  receptor: string;
  date: number;
  cost: number;
}

// Initialize Kavehnegar API client
const getKavenegarClient = (): kavenegar.KavenegarInstance => {
  const apiKey =
    process.env.KAVENEGAR_API_KEY ||
    process.env.NEXT_PUBLIC_KAVENEGAR_API_KEY ||
    process.env.KAVENEGAR_API_TOKEN;

  if (!apiKey) {
    throw new Error(
      'KAVENEGAR_API_KEY (or NEXT_PUBLIC_KAVENEGAR_API_KEY / KAVENEGAR_API_TOKEN) is not set in environment variables'
    );
  }

  return Kavenegar.KavenegarApi({ apikey: apiKey });
};

/**
 * SMS Service Response Types
 */
export interface SMSResponse {
  success: boolean;
  message?: string;
  messageId?: string;
  status?: number;
  error?: string;
  isTestAccountLimitation?: boolean; // True if error is due to Kavenegar test account limitation
}

export interface SendSMSOptions {
  receptor: string; // Phone number (e.g., '09123456789')
  message: string; // SMS message content
  sender?: string; // Sender number (optional, uses default if not provided)
}

export interface VerifyLookupOptions {
  receptor: string; // Phone number
  token: string; // Verification code
  token2?: string; // Optional second token
  token3?: string; // Optional third token
  template: string; // Template name registered in Kavehnegar panel
}

/**
 * Send a simple SMS message
 */
export async function sendSMS(options: SendSMSOptions): Promise<SMSResponse> {
  try {
    const api = getKavenegarClient();
    // Use purchased sender number (2000660110) as default, fallback to env var or public number
    const sender = options.sender || process.env.KAVENEGAR_SENDER || '2000660110';

    console.log('📱 [sendSMS] Attempting to send SMS:', {
      receptor: options.receptor,
      sender,
      messageLength: options.message.length,
    });

    return new Promise((resolve) => {
      // Add timeout to prevent hanging forever (30 seconds)
      const timeout = setTimeout(() => {
        console.error('📱 [sendSMS] Timeout: No response from Kavenegar API after 30 seconds');
        resolve({
          success: false,
          error: 'SMS service timeout - please try again',
          status: 408,
        });
      }, 30000);

      try {
        api.Send(
          {
            message: options.message,
            sender: sender,
            receptor: options.receptor,
          },
          (entries: MessageEntry[] | null, status: number, message: string) => {
            clearTimeout(timeout);
            
            console.log('📱 [sendSMS] Kavenegar callback received:', {
              status,
              message,
              entriesCount: entries?.length || 0,
              hasMessageId: entries?.[0]?.messageid ? true : false,
            });

            if (status === 200 && entries && entries.length > 0 && entries[0]?.messageid) {
              console.log('✅ [sendSMS] SMS sent successfully:', {
                messageId: entries[0].messageid,
                status: entries[0].status,
                receptor: options.receptor,
              });
              resolve({
                success: true,
                message: 'SMS sent successfully',
                messageId: entries[0].messageid.toString(),
                status: entries[0].status,
              });
            } else {
              // Check if it's the Kavenegar test account limitation
              const isTestAccountLimitation = status === 501 || 
                (message && (message.includes('صاحب حساب') || message.includes('account owner')));
              
              // Map common Kavenegar API error codes to user-friendly messages
              let errorMessage = message || 'Failed to send SMS';
              const errorDetails: Record<string, string | number | boolean | undefined> = {
                status,
                message,
                receptor: options.receptor,
              };

              // Handle specific error codes for production
              switch (status) {
                case 400:
                  errorMessage = 'Invalid request parameters. Please check phone number format and message content.';
                  break;
                case 401:
                  errorMessage = 'Invalid API key. Please check your KAVENEGAR_API_KEY configuration.';
                  errorDetails.apiKeyConfigured = !!process.env.KAVENEGAR_API_KEY;
                  break;
                case 402:
                  errorMessage = 'Insufficient account credit. Please recharge your Kavenegar account.';
                  break;
                case 403:
                  errorMessage = 'Access forbidden. Please check your account permissions and sender number.';
                  break;
                case 404:
                  errorMessage = 'Sender number not found. Please verify KAVENEGAR_SENDER is correct.';
                  break;
                case 501:
                  errorMessage = 'Test account limitation: SMS can only be sent to account owner\'s number.';
                  break;
                case 502:
                  errorMessage = 'Invalid phone number format. Use format: 09123456789';
                  break;
                default:
                  // Keep original message for unknown errors
                  break;
              }
              
              if (isTestAccountLimitation) {
                console.warn('⚠️ [sendSMS] Kavenegar test account limitation:', {
                  ...errorDetails,
                  note: 'In Kavenegar test/sandbox mode, SMS can only be sent to the account owner\'s number. This will work in production.',
                });
              } else {
                console.error('❌ [sendSMS] SMS sending failed:', {
                  ...errorDetails,
                  entries: entries,
                  errorMessage,
                });
              }
              
              const response: SMSResponse = {
                success: false,
                error: errorMessage,
                status: status,
              };
              
              if (isTestAccountLimitation) {
                response.isTestAccountLimitation = true;
              }
              
              resolve(response);
            }
          }
        );
      } catch (apiError) {
        clearTimeout(timeout);
        console.error('❌ [sendSMS] API call error:', apiError);
        resolve({
          success: false,
          error: apiError instanceof Error ? apiError.message : 'Unknown API error',
          status: 500,
        });
      }
    });
  } catch (error) {
    console.error('❌ [sendSMS] Error initializing SMS service:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Send verification code using Lookup template
 * This is used for OTP, verification codes, etc.
 */
export async function sendVerificationCode(
  options: VerifyLookupOptions
): Promise<SMSResponse> {
  try {
    const api = getKavenegarClient();

    console.log('📱 [sendVerificationCode] Attempting to send verification code:', {
      receptor: options.receptor,
      template: options.template,
      token: options.token,
    });

    return new Promise((resolve) => {
      // Add timeout to prevent hanging forever (30 seconds)
      const timeout = setTimeout(() => {
        console.error('📱 [sendVerificationCode] Timeout: No response from Kavenegar API after 30 seconds');
        resolve({
          success: false,
          error: 'SMS service timeout - please try again',
          status: 408,
        });
      }, 30000);

      try {
        api.VerifyLookup(
          {
            receptor: options.receptor,
            token: options.token,
            token2: options.token2 || '',
            token3: options.token3 || '',
            template: options.template,
          },
          (entries: MessageEntry[] | null, status: number, message: string) => {
            clearTimeout(timeout);
            
            console.log('📱 [sendVerificationCode] Kavenegar callback received:', {
              status,
              message,
              entriesCount: entries?.length || 0,
              hasMessageId: entries?.[0]?.messageid ? true : false,
            });

            if (status === 200 && entries && entries.length > 0 && entries[0]?.messageid) {
              console.log('✅ [sendVerificationCode] SMS sent successfully:', {
                messageId: entries[0].messageid,
                status: entries[0].status,
                receptor: options.receptor,
              });
              resolve({
                success: true,
                message: 'Verification code sent successfully',
                messageId: entries[0].messageid.toString(),
                status: entries[0].status,
              });
            } else {
              // Check if it's the Kavenegar test account limitation
              const isTestAccountLimitation = status === 501 || 
                (message && (message.includes('صاحب حساب') || message.includes('account owner')));
              const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
              
              // Map common Kavenegar API error codes to user-friendly messages
              let errorMessage = message || 'Failed to send verification code';
              const errorDetails: Record<string, string | number | boolean | undefined> = {
                status,
                message,
                receptor: options.receptor,
                template: options.template,
              };

              // Handle specific error codes for production
              switch (status) {
                case 400:
                  errorMessage = 'Invalid request parameters or template not found. Please check template name and phone number format.';
                  break;
                case 401:
                  errorMessage = 'Invalid API key. Please check your KAVENEGAR_API_KEY configuration.';
                  errorDetails.apiKeyConfigured = !!process.env.KAVENEGAR_API_KEY;
                  break;
                case 402:
                  errorMessage = 'Insufficient account credit. Please recharge your Kavenegar account.';
                  break;
                case 403:
                  errorMessage = 'Access forbidden. Please check your account permissions and template access.';
                  break;
                case 404:
                  errorMessage = `Template '${options.template}' not found. Please create it in Kavenegar panel or use simple SMS.`;
                  break;
                case 501:
                  errorMessage = 'Test account limitation: SMS can only be sent to account owner\'s number.';
                  break;
                case 502:
                  errorMessage = 'Invalid phone number format. Use format: 09123456789';
                  break;
                default:
                  // Keep original message for unknown errors
                  break;
              }
              
              if (isTestAccountLimitation) {
                console.warn('⚠️ [sendVerificationCode] Kavenegar test account limitation:', {
                  ...errorDetails,
                  note: 'In Kavenegar test/sandbox mode, SMS can only be sent to the account owner\'s number. This will work in production.',
                  code: isDevelopment ? options.token : undefined, // Log code in dev mode only
                });
              } else {
                console.error('❌ [sendVerificationCode] SMS sending failed:', {
                  ...errorDetails,
                  entries: entries,
                  errorMessage,
                });
              }
              
              const response: SMSResponse = {
                success: false,
                error: errorMessage,
                status: status,
              };
              
              if (isTestAccountLimitation) {
                response.isTestAccountLimitation = true;
              }
              
              resolve(response);
            }
          }
        );
      } catch (apiError) {
        clearTimeout(timeout);
        console.error('❌ [sendVerificationCode] API call error:', apiError);
        resolve({
          success: false,
          error: apiError instanceof Error ? apiError.message : 'Unknown API error',
          status: 500,
        });
      }
    });
  } catch (error) {
    console.error('❌ [sendVerificationCode] Error initializing SMS service:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Send SMS to multiple recipients
 */
export async function sendBulkSMS(
  receptors: string[],
  message: string,
  sender?: string
): Promise<SMSResponse> {
  try {
    const api = getKavenegarClient();
    // Use purchased sender number (2000660110) as default, fallback to env var or public number
    const senderNumber = sender || process.env.KAVENEGAR_SENDER || '2000660110';

    // For SendArray, we need arrays of equal length
    // Note: According to Kavehnegar docs, SendArray requires:
    // - receptor: string (comma-separated or array)
    // - sender: string (comma-separated or array)
    // - message: string (comma-separated or array)
    const receptorString = receptors.join(',');
    const senderString = Array(receptors.length).fill(senderNumber).join(',');
    const messageString = Array(receptors.length).fill(message).join(',');

    return new Promise((resolve) => {
      api.SendArray(
        {
          receptor: receptorString,
          sender: senderString,
          message: messageString,
        },
        (entries: MessageEntry[], status: number, message: string) => {
          if (status === 200 && entries && entries.length > 0) {
            resolve({
              success: true,
              message: `SMS sent to ${entries.length} recipients`,
              status: entries[0]?.status,
            });
          } else {
            resolve({
              success: false,
              error: message || 'Failed to send bulk SMS',
              status: status,
            });
          }
        }
      );
    });
  } catch (error) {
    console.error('Bulk SMS sending error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get SMS delivery status
 */
export async function getSMSStatus(messageId: string): Promise<SMSResponse> {
  try {
    const api = getKavenegarClient();

    return new Promise((resolve) => {
      api.Status(
        {
          messageid: messageId,
        },
        (entries: Array<{ messageid: number; status: number; statustext: string }>, status: number, message: string) => {
          if (status === 200 && entries && entries.length > 0) {
            resolve({
              success: true,
              message: 'Status retrieved successfully',
              status: entries[0].status,
            });
          } else {
            resolve({
              success: false,
              error: message || 'Failed to get SMS status',
              status: status,
            });
          }
        }
      );
    });
  } catch (error) {
    console.error('SMS status check error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Predefined SMS templates for common use cases
 */
export const SMSTemplates = {
  // Order notifications
  ORDER_CONFIRMED: (orderNumber: string, customerName: string, products?: string[], totalAmount?: number) => {
    let message = `سلام ${customerName}، سفارش شما با شماره ${orderNumber} ثبت شد.`;
    if (products && products.length > 0) {
      const productsList = products.length <= 3 
        ? products.join('، ') 
        : `${products.slice(0, 2).join('، ')} و ${products.length - 2} محصول دیگر`;
      message += `\nمحصولات: ${productsList}`;
    }
    if (totalAmount) {
      const formattedAmount = new Intl.NumberFormat('fa-IR').format(totalAmount);
      message += `\nمبلغ کل: ${formattedAmount} ریال`;
    }
    message += '\nاز خرید شما متشکریم.';
    return message;
  },
  
  ORDER_PAYMENT_SUCCESS: (orderNumber: string, customerName: string, products?: string[], totalAmount?: number, refId?: string) => {
    let message = `سلام ${customerName}، پرداخت سفارش ${orderNumber} با موفقیت انجام شد.`;
    if (products && products.length > 0) {
      const productsList = products.length <= 3 
        ? products.join('، ') 
        : `${products.slice(0, 2).join('، ')} و ${products.length - 2} محصول دیگر`;
      message += `\nمحصولات: ${productsList}`;
    }
    if (totalAmount) {
      // Convert Rials to Tomans for display
      const amountInTomans = Math.round(totalAmount / 10);
      const formattedAmount = new Intl.NumberFormat('fa-IR').format(amountInTomans);
      message += `\nمبلغ پرداخت شده: ${formattedAmount} تومان`;
    }
    if (refId) {
      message += `\nکد پیگیری پرداخت: ${refId}`;
    }
    message += '\nسفارش شما در حال پردازش است.';
    return message;
  },
  
  ORDER_SHIPPED: (orderNumber: string, trackingNumber?: string) =>
    `سفارش شما با شماره ${orderNumber} ارسال شد.${trackingNumber ? ` کد پیگیری: ${trackingNumber}` : ''}`,
  
  ORDER_DELIVERED: (orderNumber: string) =>
    `سفارش شما با شماره ${orderNumber} تحویل داده شد. امیدواریم از خرید خود راضی باشید.`,

  // Authentication
  PHONE_VERIFICATION: (code: string) =>
    `کد تأیید شما: ${code} - این کد 5 دقیقه اعتبار دارد.`,

  // Password reset
  PASSWORD_RESET: (code: string) =>
    `کد بازیابی رمز عبور شما: ${code} - این کد 10 دقیقه اعتبار دارد.`,

  // Welcome message
  WELCOME: (customerName: string) =>
    `سلام ${customerName}، به HS6Tools خوش آمدید! از خرید ابزارهای صنعتی با کیفیت از ما لذت ببرید.`,

  // Security alerts
  PASSWORD_CHANGED: (customerName: string) =>
    `سلام ${customerName}، رمز عبور حساب کاربری شما تغییر یافت. در صورت عدم اطلاع، لطفاً با پشتیبانی تماس بگیرید.`,

  // Order cancellation and failures
  ORDER_CANCELLED: (orderNumber: string, customerName: string) =>
    `سلام ${customerName}، سفارش ${orderNumber} لغو شد. موجودی محصولات بازگردانده شد. در صورت کسر وجه، طی 3-5 روز کاری بازگردانده می‌شود.`,

  ORDER_EXPIRED: (orderNumber: string, customerName: string) =>
    `سلام ${customerName}، سفارش ${orderNumber} به دلیل عدم پرداخت به مدت 30 دقیقه، لغو شد. برای ثبت مجدد سفارش، از سبد خرید اقدام کنید.`,

  PAYMENT_FAILED: (orderNumber: string, customerName: string, reason?: string) => {
    let message = `سلام ${customerName}، پرداخت سفارش ${orderNumber} ناموفق بود.`;
    if (reason) {
      message += `\nدلیل: ${reason}`;
    }
    message += '\nلطفاً مجدداً تلاش کنید یا با پشتیبانی تماس بگیرید.';
    return message;
  },

  ORDER_REFUNDED: (orderNumber: string, customerName: string, amount: number, refId?: string) => {
    // Convert Rials to Tomans for display
    const amountInTomans = Math.round(amount / 10);
    const formattedAmount = new Intl.NumberFormat('fa-IR').format(amountInTomans);
    let message = `سلام ${customerName}، سفارش ${orderNumber} مرجوع شد.\nمبلغ ${formattedAmount} تومان طی 3-5 روز کاری به حساب شما بازگردانده می‌شود.`;
    if (refId) {
      message += `\nکد پیگیری: ${refId}`;
    }
    return message;
  },
} as const;

/**
 * Helper function to send SMS safely (non-blocking)
 * This function catches errors and logs them without throwing
 * Use this when SMS failure shouldn't break the main flow
 * 
 * In development mode, SMS may be skipped or mocked based on environment variables
 */
export async function sendSMSSafe(
  options: SendSMSOptions,
  errorContext?: string
): Promise<void> {
  try {
    // Check if SMS is disabled in development
    const skipSMSInDev = process.env.SKIP_SMS_IN_DEV === 'true';
    const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    
    if (skipSMSInDev && isDevelopment) {
      console.log(`📱 [SMS] SMS skipped in development mode${errorContext ? ` (${errorContext})` : ''}:`, {
        receptor: options.receptor,
        messageLength: options.message.length,
        messagePreview: options.message.substring(0, 100) + '...',
        note: 'Set SKIP_SMS_IN_DEV=false to enable SMS in development',
      });
      return;
    }

    // Validate phone number format
    const phoneDigits = options.receptor.replace(/\D/g, '');
    if (phoneDigits.length !== 11 || !phoneDigits.startsWith('09')) {
      console.error(`[SMS] Invalid phone number format${errorContext ? ` (${errorContext})` : ''}:`, options.receptor);
      return;
    }

    console.log(`📱 [SMS] Attempting to send SMS${errorContext ? ` (${errorContext})` : ''}:`, {
      receptor: options.receptor,
      messageLength: options.message.length,
      sender: options.sender || 'default',
      environment: isDevelopment ? 'development' : 'production',
    });

    const result = await sendSMS(options);
    if (!result.success) {
      // Check if it's the Kavenegar test account limitation
      const isTestAccountLimitation = result.status === 501 && 
        result.error?.includes('صاحب حساب');
      
      if (isTestAccountLimitation && isDevelopment) {
        console.warn(`⚠️ [SMS] Kavenegar test account limitation${errorContext ? ` (${errorContext})` : ''}:`, {
          error: result.error,
          status: result.status,
          receptor: options.receptor,
          note: 'In Kavenegar test/sandbox mode, SMS can only be sent to the account owner\'s number. This will work in production.',
          messagePreview: options.message.substring(0, 100) + '...',
        });
      } else {
        console.error(`❌ [SMS] Failed to send SMS${errorContext ? ` (${errorContext})` : ''}:`, {
          error: result.error,
          status: result.status,
          receptor: options.receptor,
        });
      }
    } else {
      console.log(`✅ [SMS] SMS sent successfully${errorContext ? ` (${errorContext})` : ''}:`, {
        messageId: result.messageId,
        status: result.status,
        receptor: options.receptor,
      });
    }
  } catch (error) {
    console.error(`❌ [SMS] Error sending SMS${errorContext ? ` (${errorContext})` : ''}:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      receptor: options.receptor,
    });
    // Don't throw - SMS failures shouldn't break main flow
  }
}

/**
 * Send low stock alert to admin users
 * This function should be called when product stock goes below threshold
 */
export async function sendLowStockAlert(
  productName: string,
  stockQuantity: number,
  lowStockThreshold: number,
  adminPhones: string[]
): Promise<void> {
  if (adminPhones.length === 0) {
    console.warn('[SMS] No admin phone numbers provided for low stock alert');
    return;
  }

  const message = `هشدار: موجودی محصول ${productName} به ${stockQuantity} عدد رسیده است (حد آستانه: ${lowStockThreshold}). لطفاً موجودی را بررسی کنید.`;

  // Send to all admin phones (non-blocking)
  for (const phone of adminPhones) {
    sendSMSSafe(
      {
        receptor: phone,
        message: message,
      },
      `Low stock alert: ${productName}`
    );
  }
}
