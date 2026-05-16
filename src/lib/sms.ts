/**
 * SMS Service - Supports SMS.ir and Kavenegar
 * 
 * Priority: SMS.ir (if configured) > Kavenegar (fallback)
 * 
 * SMS.ir Documentation: https://github.com/movahhedi/sms-ir-node
 * Kavenegar Documentation: https://kavenegar.com/rest.html
 */

import * as Kavenegar from 'kavenegar';
import type { kavenegar } from 'kavenegar';

// SMS.ir imports (dynamic import to avoid errors if package not installed)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let SMSIr: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const smsirModule = require('smsir-js');
  // Try different possible export structures
  SMSIr = smsirModule.Smsir || smsirModule.default || smsirModule;
} catch (error) {
  console.warn('⚠️ [SMS] smsir-js package not found. SMS.ir functionality will be disabled.', error);
}

// Type definitions for Kavenegar responses
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

/**
 * SMS Service Provider Detection
 */
type SMSProvider = 'smsir' | 'kavenegar' | 'none';

function detectSMSProvider(): SMSProvider {
  // Check for SMS.ir configuration first
  const smsirApiKey = process.env.SMSIR_API_KEY;
  if (smsirApiKey && SMSIr) {
    console.log('📱 [SMS Provider] Detected SMS.ir:', {
      apiKeyLength: smsirApiKey.length,
      smsIrPackageAvailable: !!SMSIr,
      templateId: process.env.SMSIR_VERIFY_TEMPLATE_ID || 'NOT SET',
    });
    return 'smsir';
  }

  // Fallback to Kavenegar
  const kavenegarApiKey =
    process.env.KAVENEGAR_API_KEY ||
    process.env.NEXT_PUBLIC_KAVENEGAR_API_KEY ||
    process.env.KAVENEGAR_API_TOKEN;
  if (kavenegarApiKey) {
    console.log('📱 [SMS Provider] Detected Kavenegar:', {
      apiKeyLength: kavenegarApiKey.length,
      sender: process.env.KAVENEGAR_SENDER || 'default',
    });
    return 'kavenegar';
  }

  console.error('❌ [SMS Provider] No SMS provider detected:', {
    SMSIR_API_KEY: process.env.SMSIR_API_KEY ? 'SET' : 'NOT SET',
    SMSIrPackage: SMSIr ? 'AVAILABLE' : 'NOT AVAILABLE',
    KAVENEGAR_API_KEY: process.env.KAVENEGAR_API_KEY ? 'SET' : 'NOT SET',
  });
  return 'none';
}

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
  provider?: SMSProvider; // Which provider was used
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
  template: string; // Template name (Kavenegar) or Template ID (SMS.ir)
  parameters?: Record<string, string | number>; // SMS.ir named template parameters
}

export type SMSTemplateEnvKey =
  | 'SMSIR_SIGNUP_VERIFY_TEMPLATE_ID'
  | 'SMSIR_WELCOME_SIMPLE_TEMPLATE_ID'
  | 'SMSIR_WELCOME_INFO_TEMPLATE_ID'
  | 'SMSIR_LOGIN_OTP_TEMPLATE_ID'
  | 'SMSIR_PASSWORD_RESET_TEMPLATE_ID'
  | 'SMSIR_PURCHASE_CONFIRMED_TEMPLATE_ID'
  | 'SMSIR_INVOICE_TEMPLATE_ID'
  | 'SMSIR_POST_TRACKING_TEMPLATE_ID'
  | 'SMSIR_ORDER_PROCESSING_TEMPLATE_ID'
  | 'SMSIR_VERIFY_TEMPLATE_ID';

export interface TemplateSMSOptions {
  receptor: string;
  templateEnvKey: SMSTemplateEnvKey;
  parameters?: Record<string, string | number>;
}

const DEFAULT_SMSIR_TEMPLATE_IDS: Partial<Record<SMSTemplateEnvKey, string>> = {
  SMSIR_VERIFY_TEMPLATE_ID: '285627',
  SMSIR_SIGNUP_VERIFY_TEMPLATE_ID: '285627',
  SMSIR_WELCOME_SIMPLE_TEMPLATE_ID: '393070',
  SMSIR_WELCOME_INFO_TEMPLATE_ID: '393070',
  SMSIR_LOGIN_OTP_TEMPLATE_ID: '619622',
  SMSIR_PASSWORD_RESET_TEMPLATE_ID: '846716',
  SMSIR_PURCHASE_CONFIRMED_TEMPLATE_ID: '476629',
  SMSIR_INVOICE_TEMPLATE_ID: '314539',
  SMSIR_POST_TRACKING_TEMPLATE_ID: '412202',
};

// ============================================================================
// SMS.ir Implementation (Official smsir-js package)
// ============================================================================

const safeStringify = (obj: unknown): string => {
  try {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    });
  } catch {
    return String(obj);
  }
};

interface SMSIrPayload {
  IsSuccessful?: boolean;
  Message?: string;
  message?: string;
  StatusCode?: number;
  status?: number;
  PackId?: string | number;
  MessageId?: string | number;
  messageId?: string | number;
  error?: string;
  data?: {
    status?: number;
    code?: number;
    message?: string;
    messageId?: string | number;
    batchKey?: string | number;
    packId?: string | number;
  };
}

interface SMSIrRawResponse {
  status?: number;
  data?: SMSIrPayload;
}

interface SMSIrErrorResponse {
  response?: {
    status?: number;
    data?: {
      Message?: string;
      message?: string;
    };
  };
}

function unwrapSMSIrResponse(result: unknown): SMSIrPayload {
  const response = result as SMSIrRawResponse;
  return response?.data && typeof response.data === 'object' ? response.data : (result as SMSIrPayload);
}

function isSMSIrSuccess(payload: SMSIrPayload, rawResult?: unknown): boolean {
  const raw = rawResult as SMSIrRawResponse;
  return payload?.IsSuccessful === true ||
    payload?.status === 1 ||
    payload?.status === 200 ||
    payload?.StatusCode === 200 ||
    payload?.data?.status === 1 ||
    payload?.data?.status === 200 ||
    payload?.data?.code === 200 ||
    (!payload?.Message && !payload?.message && raw?.status === 200);
}

function getSMSIrMessageId(payload: SMSIrPayload): string | undefined {
  const messageId =
    payload?.MessageId ||
    payload?.messageId ||
    payload?.PackId ||
    payload?.data?.messageId ||
    payload?.data?.batchKey ||
    payload?.data?.packId;

  return messageId ? messageId.toString() : undefined;
}

function getSMSIrErrorMessage(payload: SMSIrPayload, fallback: string): string {
  return payload?.Message ||
    payload?.message ||
    payload?.data?.message ||
    payload?.error ||
    fallback;
}

function toSMSIrParameters(parameters: Record<string, string | number>) {
  return Object.entries(parameters).map(([name, value]) => ({
    name,
    value: String(value),
  }));
}

export function getSMSStoreName(): string {
  return process.env.NEXT_PUBLIC_APP_NAME || 'HS6Tools';
}

export function getSMSSiteUrl(): string {
  return 'https://hs6tools.com/fa';
}

export function formatSMSAmountInRials(amount: number): string {
  return new Intl.NumberFormat('fa-IR').format(amount);
}

export function formatShippingAddressForSMS(address?: {
  addressLine1?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
} | null): string {
  if (!address) return 'آدرس ثبت‌شده';

  return [
    address.state,
    address.city,
    address.addressLine1,
    address.postalCode ? `کدپستی ${address.postalCode}` : null,
  ].filter(Boolean).join('، ');
}

/**
 * Initialize SMS.ir client
 * Official package: smsir-js
 * Documentation: https://sms.ir/web-service/پکیج-های-وب-سرویس/
 * API: Direct API key authentication (no token system)
 */
function getSMSIrClient() {
  const apiKey = process.env.SMSIR_API_KEY;
  const lineNumber = process.env.SMSIR_LINE_NUMBER || '';

  if (!apiKey) {
    throw new Error('SMSIR_API_KEY is not set in environment variables');
  }

  if (!SMSIr) {
    throw new Error('smsir-js package is not installed. Run: npm install smsir-js');
  }

  const client = new SMSIr(apiKey, lineNumber);
  
  // Debug: Log available methods on the client
  console.log('🔍 [getSMSIrClient] Client object structure:', {
    hasSend: typeof client.send === 'function',
    hasVerifySend: typeof client.verifySend === 'function',
    hasSendVerify: typeof client.sendVerify === 'function',
    hasVerify: typeof client.verify === 'function',
    availableMethods: Object.getOwnPropertyNames(Object.getPrototypeOf(client)).filter(name => name !== 'constructor'),
    clientType: typeof client,
    clientConstructor: client.constructor?.name,
  });

  return client;
}

/**
 * Send SMS using SMS.ir (Official smsir-js package)
 */
async function sendSMSViaSMSIr(options: SendSMSOptions): Promise<SMSResponse> {
  try {
    const lineNumber = options.sender || process.env.SMSIR_LINE_NUMBER || '';

    console.log('📱 [sendSMS] SMS.ir - Attempting to send SMS:', {
      receptor: options.receptor,
      lineNumber: lineNumber || 'default',
      messageLength: options.message.length,
    });

    const smsir = getSMSIrClient();
    
    // SMS.ir API uses SendBulk for sending SMS (even to single number)
    // Method signature in smsir-js: SendBulk(message, mobiles, sendDate, lineNumber)
    if (typeof smsir.SendBulk !== 'function') {
      throw new Error(`SMS.ir client does not have 'SendBulk' method. Available methods: ${Object.getOwnPropertyNames(Object.getPrototypeOf(smsir)).join(', ')}`);
    }
    
    // Use SendBulk with single number
    // Note: lineNumber must be a valid number or undefined/null, not empty string
    let result;
    try {
      // Only pass lineNumber if it's a valid non-empty string
      const validLineNumber = lineNumber && lineNumber.trim() !== '' ? lineNumber : undefined;
      
      result = await smsir.SendBulk(
        options.message,     // message text
        [options.receptor],  // mobileNumbers array
        null,                // sendDate (null = send immediately)
        validLineNumber      // line number (undefined if not set, SMS.ir will use default)
      );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Extract error message from Axios error or other errors
      const errorMessage = error?.response?.data?.Message || 
                          error?.response?.data?.message ||
                          error?.message || 
                          String(error);
      const statusCode = error?.response?.status || error?.statusCode || 500;
      
      console.error('❌ [sendSMS] SMS.ir - API call failed:', {
        error: errorMessage,
        statusCode,
        receptor: options.receptor,
        errorType: error?.constructor?.name,
        responseData: error?.response?.data,
      });
      
      return {
        success: false,
        error: errorMessage,
        status: statusCode,
        provider: 'smsir',
      };
    }

    // Safe JSON stringify to avoid circular reference errors
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const safeStringify = (obj: any): string => {
      try {
        const seen = new WeakSet();
        return JSON.stringify(obj, (key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
              return '[Circular]';
            }
            seen.add(value);
          }
          return value;
        });
      } catch {
        return String(obj);
      }
    };

    const payload = unwrapSMSIrResponse(result);

    console.log('📱 [sendSMS] SMS.ir - API response:', {
      isSuccessful: payload?.IsSuccessful,
      message: payload?.Message || payload?.message,
      statusCode: payload?.StatusCode || payload?.status,
      packId: payload?.PackId || payload?.data?.packId,
      fullResponse: result ? safeStringify(result) : 'null',
    });

    if (isSMSIrSuccess(payload, result)) {
      const packId = getSMSIrMessageId(payload);
      console.log('✅ [sendSMS] SMS.ir - SMS sent successfully:', {
        packId,
        receptor: options.receptor,
      });
      return {
        success: true,
        message: 'SMS sent successfully',
        messageId: packId,
        status: payload?.StatusCode || payload?.status || 200,
        provider: 'smsir',
      };
    } else {
      const errorMessage = getSMSIrErrorMessage(payload, 'Failed to send SMS via SMS.ir');
      console.error('❌ [sendSMS] SMS.ir - SMS sending failed:', {
        error: errorMessage,
        receptor: options.receptor,
        statusCode: payload?.StatusCode || payload?.status,
      });
      return {
        success: false,
        error: errorMessage,
        status: payload?.StatusCode || payload?.status || 500,
        provider: 'smsir',
      };
    }
  } catch (error) {
    console.error('❌ [sendSMS] SMS.ir - Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown SMS.ir error',
      status: 500,
      provider: 'smsir',
    };
  }
}

/**
 * Send verification code using SMS.ir template (Official smsir-js package)
 * Uses verifySend method: smsir.verifySend(mobile, templateId, parameters)
 */
async function sendVerificationCodeViaSMSIr(
  options: VerifyLookupOptions
): Promise<SMSResponse> {
  try {
    // For SMS.ir, template should be the Template ID (Pattern Code - number)
    const templateId = parseInt(options.template, 10);
    if (isNaN(templateId)) {
      throw new Error(`Invalid SMS.ir template ID: ${options.template}. Template must be a number (Pattern Code).`);
    }

    console.log('📱 [sendVerificationCode] SMS.ir - Attempting to send verification code:', {
      receptor: options.receptor,
      templateId,
      token: options.token,
    });

    const smsir = getSMSIrClient();
    
    // SMS.ir API uses SendVerifyCode for verification codes
    // Method signature: SendVerifyCode(mobile, templateId, parameters)
    if (typeof smsir.SendVerifyCode !== 'function') {
      const availableMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(smsir));
      throw new Error(`SMS.ir client does not have 'SendVerifyCode' method. Available methods: ${availableMethods.join(', ')}`);
    }
    
    const parameters = toSMSIrParameters(options.parameters || { OTP: options.token });

    // Call SendVerifyCode with mobile, templateId, and parameters
    let result;
    try {
      result = await smsir.SendVerifyCode(
        options.receptor,
        templateId,
        parameters
      );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Extract error message from Axios error or other errors
      const errorMessage = error?.response?.data?.Message || 
                          error?.response?.data?.message ||
                          error?.message || 
                          String(error);
      const statusCode = error?.response?.status || error?.statusCode || 500;
      
      console.error('❌ [sendVerificationCode] SMS.ir - API call failed:', {
        error: errorMessage,
        statusCode,
        receptor: options.receptor,
        templateId,
        parameters,
        errorType: error?.constructor?.name,
        responseData: error?.response?.data,
      });
      
      return {
        success: false,
        error: errorMessage,
        status: statusCode,
        provider: 'smsir',
      };
    }

    // Safe JSON stringify to avoid circular reference errors
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const safeStringify = (obj: any): string => {
      try {
        const seen = new WeakSet();
        return JSON.stringify(obj, (key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
              return '[Circular]';
            }
            seen.add(value);
          }
          return value;
        });
      } catch {
        return String(obj);
      }
    };

    const payload = unwrapSMSIrResponse(result);

    console.log('📱 [sendVerificationCode] SMS.ir - API response:', {
      isSuccessful: payload?.IsSuccessful,
      message: payload?.Message || payload?.message,
      statusCode: payload?.StatusCode,
      status: payload?.status,
      messageId: getSMSIrMessageId(payload),
      data: payload?.data,
      fullResponse: result ? safeStringify(result) : 'null',
    });

    if (isSMSIrSuccess(payload, result)) {
      const messageId = getSMSIrMessageId(payload);
      console.log('✅ [sendVerificationCode] SMS.ir - Verification code sent successfully:', {
        messageId,
        receptor: options.receptor,
      });
      return {
        success: true,
        message: 'Verification code sent successfully',
        messageId,
        status: payload?.StatusCode || payload?.status || payload?.data?.code || 200,
        provider: 'smsir',
      };
    } else {
      const errorMessage = getSMSIrErrorMessage(
        payload,
        payload?.data?.code ? `SMS.ir error code: ${payload.data.code}` : 'Failed to send verification code via SMS.ir'
      );
      const statusCode = payload?.StatusCode || payload?.status || payload?.data?.code || 500;
      
      console.error('❌ [sendVerificationCode] SMS.ir - Failed:', {
        error: errorMessage,
        receptor: options.receptor,
        templateId,
        statusCode,
        fullResponse: safeStringify(result),
      });
      
      return {
        success: false,
        error: errorMessage,
        status: statusCode,
        provider: 'smsir',
      };
    }
  } catch (error) {
    console.error('❌ [sendVerificationCode] SMS.ir - Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown SMS.ir error',
      status: 500,
      provider: 'smsir',
    };
  }
}

// ============================================================================
// Kavenegar Implementation (Fallback)
// ============================================================================

/**
 * Initialize Kavenegar API client
 */
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
 * Send SMS using Kavenegar
 */
async function sendSMSViaKavenegar(options: SendSMSOptions): Promise<SMSResponse> {
  try {
    const api = getKavenegarClient();
    const sender = options.sender || process.env.KAVENEGAR_SENDER || '2000660110';

    console.log('📱 [sendSMS] Kavenegar - Attempting to send SMS:', {
      receptor: options.receptor,
      sender,
      messageLength: options.message.length,
    });

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.error('📱 [sendSMS] Kavenegar - Timeout: No response after 30 seconds');
        resolve({
          success: false,
          error: 'SMS service timeout - please try again',
          status: 408,
          provider: 'kavenegar',
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
            
            console.log('📱 [sendSMS] Kavenegar - Callback received:', {
              status,
              message,
              entriesCount: entries?.length || 0,
              hasMessageId: entries?.[0]?.messageid ? true : false,
            });

            if (status === 200 && entries && entries.length > 0 && entries[0]?.messageid) {
              console.log('✅ [sendSMS] Kavenegar - SMS sent successfully:', {
                messageId: entries[0].messageid,
                status: entries[0].status,
                receptor: options.receptor,
              });
              resolve({
                success: true,
                message: 'SMS sent successfully',
                messageId: entries[0].messageid.toString(),
                status: entries[0].status,
                provider: 'kavenegar',
              });
            } else {
              const isTestAccountLimitation = status === 501 || 
                (message && (message.includes('صاحب حساب') || message.includes('account owner')));
              
              const isAccountVerificationError = message && (
                message.includes('احراز هویت نشده') ||
                message.includes('احراز هویت نشده است') ||
                message.includes('not verified') ||
                message.includes('account not verified') ||
                message.includes('account verification') ||
                message.includes('verification required')
              );
              
              let errorMessage = message || 'Failed to send SMS';
              const errorDetails: Record<string, string | number | boolean | undefined> = {
                status,
                message,
                receptor: options.receptor,
              };

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
                  if (isAccountVerificationError) {
                    errorMessage = 'Account verification required. Please verify your Kavenegar account in the panel (https://console.kavenegar.com).';
                  } else {
                    errorMessage = 'Access forbidden. Please check your account permissions and sender number.';
                  }
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
                  break;
              }
              
              if (isTestAccountLimitation) {
                console.warn('⚠️ [sendSMS] Kavenegar - Test account limitation:', {
                  ...errorDetails,
                  note: 'In Kavenegar test/sandbox mode, SMS can only be sent to the account owner\'s number.',
                });
              } else if (isAccountVerificationError) {
                console.error('❌ [sendSMS] Kavenegar - Account verification required:', {
                  ...errorDetails,
                  errorMessage,
                  action: 'Please verify your Kavenegar account at https://console.kavenegar.com',
                });
              } else {
                console.error('❌ [sendSMS] Kavenegar - SMS sending failed:', {
                  ...errorDetails,
                  entries: entries,
                  errorMessage,
                });
              }
              
              const response: SMSResponse = {
                success: false,
                error: errorMessage,
                status: status,
                provider: 'kavenegar',
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
        console.error('❌ [sendSMS] Kavenegar - API call error:', apiError);
        resolve({
          success: false,
          error: apiError instanceof Error ? apiError.message : 'Unknown API error',
          status: 500,
          provider: 'kavenegar',
        });
      }
    });
  } catch (error) {
    console.error('❌ [sendSMS] Kavenegar - Error initializing:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      provider: 'kavenegar',
    };
  }
}

/**
 * Send verification code using Kavenegar Lookup template
 */
async function sendVerificationCodeViaKavenegar(
  options: VerifyLookupOptions
): Promise<SMSResponse> {
  try {
    const api = getKavenegarClient();

    console.log('📱 [sendVerificationCode] Kavenegar - Attempting to send verification code:', {
      receptor: options.receptor,
      template: options.template,
      token: options.token,
    });

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.error('📱 [sendVerificationCode] Kavenegar - Timeout: No response after 30 seconds');
        resolve({
          success: false,
          error: 'SMS service timeout - please try again',
          status: 408,
          provider: 'kavenegar',
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
            
            console.log('📱 [sendVerificationCode] Kavenegar - Callback received:', {
              status,
              message,
              entriesCount: entries?.length || 0,
              hasMessageId: entries?.[0]?.messageid ? true : false,
            });

            if (status === 200 && entries && entries.length > 0 && entries[0]?.messageid) {
              console.log('✅ [sendVerificationCode] Kavenegar - SMS sent successfully:', {
                messageId: entries[0].messageid,
                status: entries[0].status,
                receptor: options.receptor,
              });
              resolve({
                success: true,
                message: 'Verification code sent successfully',
                messageId: entries[0].messageid.toString(),
                status: entries[0].status,
                provider: 'kavenegar',
              });
            } else {
              const isTestAccountLimitation = status === 501 || 
                (message && (message.includes('صاحب حساب') || message.includes('account owner')));
              
              const isAccountVerificationError = message && (
                message.includes('احراز هویت نشده') ||
                message.includes('احراز هویت نشده است') ||
                message.includes('not verified') ||
                message.includes('account not verified') ||
                message.includes('account verification') ||
                message.includes('verification required')
              );
              
              let errorMessage = message || 'Failed to send verification code';
              const errorDetails: Record<string, string | number | boolean | undefined> = {
                status,
                message,
                receptor: options.receptor,
                template: options.template,
              };

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
                  if (isAccountVerificationError) {
                    errorMessage = 'Account verification required. Please verify your Kavenegar account in the panel (https://console.kavenegar.com).';
                  } else {
                    errorMessage = 'Access forbidden. Please check your account permissions and template access.';
                  }
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
                  break;
              }
              
              if (isTestAccountLimitation) {
                console.warn('⚠️ [sendVerificationCode] Kavenegar - Test account limitation:', {
                  ...errorDetails,
                  note: 'In Kavenegar test/sandbox mode, SMS can only be sent to the account owner\'s number.',
                });
              } else if (isAccountVerificationError) {
                console.error('❌ [sendVerificationCode] Kavenegar - Account verification required:', {
                  ...errorDetails,
                  errorMessage,
                  action: 'Please verify your Kavenegar account at https://console.kavenegar.com',
                });
              } else {
                console.error('❌ [sendVerificationCode] Kavenegar - SMS sending failed:', {
                  ...errorDetails,
                  entries: entries,
                  errorMessage,
                });
              }
              
              const response: SMSResponse = {
                success: false,
                error: errorMessage,
                status: status,
                provider: 'kavenegar',
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
        console.error('❌ [sendVerificationCode] Kavenegar - API call error:', apiError);
        resolve({
          success: false,
          error: apiError instanceof Error ? apiError.message : 'Unknown API error',
          status: 500,
          provider: 'kavenegar',
        });
      }
    });
  } catch (error) {
    console.error('❌ [sendVerificationCode] Kavenegar - Error initializing:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      provider: 'kavenegar',
    };
  }
}

// ============================================================================
// Unified Public API
// ============================================================================

/**
 * Send a simple SMS message
 * Automatically uses SMS.ir if configured, otherwise falls back to Kavenegar
 */
export async function sendSMS(options: SendSMSOptions): Promise<SMSResponse> {
  const provider = detectSMSProvider();

  if (provider === 'smsir') {
    return sendSMSViaSMSIr(options);
  } else if (provider === 'kavenegar') {
    return sendSMSViaKavenegar(options);
  } else {
    const error = 'No SMS service configured. Please set SMSIR_API_KEY or KAVENEGAR_API_KEY.';
    console.error('❌ [sendSMS]', error);
    return {
      success: false,
      error,
      provider: 'none',
    };
  }
}

/**
 * Send verification code using template
 * For SMS.ir: template should be Template ID (number)
 * For Kavenegar: template should be template name (string)
 */
export async function sendVerificationCode(
  options: VerifyLookupOptions
): Promise<SMSResponse> {
  const provider = detectSMSProvider();

  if (provider === 'smsir') {
    return sendVerificationCodeViaSMSIr(options);
  } else if (provider === 'kavenegar') {
    return sendVerificationCodeViaKavenegar(options);
  } else {
    const error = 'No SMS service configured. Please set SMSIR_API_KEY or KAVENEGAR_API_KEY.';
    console.error('❌ [sendVerificationCode]', error);
    return {
      success: false,
      error,
      provider: 'none',
    };
  }
}

/**
 * Send an SMS.ir fast-send template by environment variable name.
 * This intentionally targets SMS.ir only because template ids are provider-specific.
 */
export async function sendTemplateSMS(options: TemplateSMSOptions): Promise<SMSResponse> {
  const provider = detectSMSProvider();

  if (provider !== 'smsir') {
    return {
      success: false,
      error: 'SMS.ir is not configured. Template SMS requires SMSIR_API_KEY and smsir-js.',
      provider,
    };
  }

  const templateValue = process.env[options.templateEnvKey] || DEFAULT_SMSIR_TEMPLATE_IDS[options.templateEnvKey];
  if (!templateValue) {
    return {
      success: false,
      error: `${options.templateEnvKey} is not set`,
      provider: 'smsir',
    };
  }

  const templateId = parseInt(templateValue, 10);
  if (isNaN(templateId)) {
    return {
      success: false,
      error: `${options.templateEnvKey} must be a numeric SMS.ir Template ID`,
      provider: 'smsir',
    };
  }

  try {
    const smsir = getSMSIrClient();
    if (typeof smsir.SendVerifyCode !== 'function') {
      const availableMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(smsir));
      throw new Error(`SMS.ir client does not have 'SendVerifyCode' method. Available methods: ${availableMethods.join(', ')}`);
    }

    const parameters = toSMSIrParameters(options.parameters || {});

    console.log('📱 [sendTemplateSMS] SMS.ir - Attempting template SMS:', {
      receptor: options.receptor,
      templateEnvKey: options.templateEnvKey,
      templateId,
      parameterNames: parameters.map(parameter => parameter.name),
    });

    const result = await smsir.SendVerifyCode(
      options.receptor,
      templateId,
      parameters
    );
    const payload = unwrapSMSIrResponse(result);

    console.log('📱 [sendTemplateSMS] SMS.ir - API response:', {
      templateEnvKey: options.templateEnvKey,
      templateId,
      isSuccessful: payload?.IsSuccessful,
      message: payload?.Message || payload?.message,
      statusCode: payload?.StatusCode || payload?.status,
      messageId: getSMSIrMessageId(payload),
      fullResponse: safeStringify(result),
    });

    if (isSMSIrSuccess(payload, result)) {
      return {
        success: true,
        message: 'Template SMS sent successfully',
        messageId: getSMSIrMessageId(payload),
        status: payload?.StatusCode || payload?.status || payload?.data?.code || 200,
        provider: 'smsir',
      };
    }

    return {
      success: false,
      error: getSMSIrErrorMessage(payload, 'Failed to send template SMS via SMS.ir'),
      status: payload?.StatusCode || payload?.status || payload?.data?.code || 500,
      provider: 'smsir',
    };
  } catch (error) {
    const smsIrError = error as SMSIrErrorResponse;
    const errorMessage =
      smsIrError.response?.data?.Message ||
      smsIrError.response?.data?.message ||
      (error instanceof Error ? error.message : 'Unknown SMS.ir template error');

    console.error('❌ [sendTemplateSMS] SMS.ir - Error:', {
      error: errorMessage,
      templateEnvKey: options.templateEnvKey,
      receptor: options.receptor,
      responseData: smsIrError.response?.data,
    });

    return {
      success: false,
      error: errorMessage,
      status: smsIrError.response?.status || 500,
      provider: 'smsir',
    };
  }
}

/**
 * Send SMS to multiple recipients
 * Currently only supports Kavenegar (SMS.ir bulk send can be added later)
 */
export async function sendBulkSMS(
  receptors: string[],
  message: string,
  sender?: string
): Promise<SMSResponse> {
  const provider = detectSMSProvider();

  if (provider === 'kavenegar') {
    try {
      const api = getKavenegarClient();
      const senderNumber = sender || process.env.KAVENEGAR_SENDER || '2000660110';
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
                provider: 'kavenegar',
              });
            } else {
              resolve({
                success: false,
                error: message || 'Failed to send bulk SMS',
                status: status,
                provider: 'kavenegar',
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
        provider: 'kavenegar',
      };
    }
  } else {
    // For SMS.ir, send individually (bulk API can be added later)
    console.warn('⚠️ [sendBulkSMS] Bulk SMS via SMS.ir not yet implemented. Sending individually...');
    const results = await Promise.all(
      receptors.map(receptor => sendSMS({ receptor, message, sender }))
    );
    const successCount = results.filter(r => r.success).length;
    return {
      success: successCount > 0,
      message: `SMS sent to ${successCount} of ${receptors.length} recipients`,
      provider: provider === 'smsir' ? 'smsir' : 'none',
    };
  }
}

/**
 * Get SMS delivery status
 * Currently only supports Kavenegar (SMS.ir status API can be added later)
 */
export async function getSMSStatus(messageId: string): Promise<SMSResponse> {
  const provider = detectSMSProvider();

  if (provider === 'kavenegar') {
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
                provider: 'kavenegar',
              });
            } else {
              resolve({
                success: false,
                error: message || 'Failed to get SMS status',
                status: status,
                provider: 'kavenegar',
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
        provider: 'kavenegar',
      };
    }
  } else {
    return {
      success: false,
      error: 'SMS status check is only available for Kavenegar. Check SMS.ir panel for status.',
      provider: provider === 'smsir' ? 'smsir' : 'none',
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
    const amountInTomans = Math.round(amount / 10);
    const formattedAmount = new Intl.NumberFormat('fa-IR').format(amountInTomans);
    let message = `سلام ${customerName}، سفارش ${orderNumber} مرجوع شد.\nمبلغ ${formattedAmount} تومان طی 3-5 روز کاری به حساب شما بازگردانده می‌شود.`;
    if (refId) {
      message += `\nکد پیگیری: ${refId}`;
    }
    return message;
  },
} as const;

export const SMSIRFastSendTemplates = {
  SIGNUP_VERIFY: (code: string) =>
    `کد تایید شما ${code} می‌باشد. این کد ۵ دقیقه اعتبار دارد.\n${getSMSSiteUrl()}`,

  WELCOME_SIMPLE: (customerName: string) =>
    `${customerName} عزیز، به فروشگاه HS6Tools خوش آمدید. از همراهی شما بسیار خوشحالیم.\n${getSMSSiteUrl()}`,

  WELCOME_INFO: (customerName: string) =>
    `${customerName} جان، خوش اومدی!\nثبت‌نام شما در HS6Tools با موفقیت انجام شد. همیشه با جدیدترین تخفیف‌ها و پیشنهادات ویژه در جریان باشید. ممنون که به ما اعتماد کردید!\n${getSMSSiteUrl()}`,

  LOGIN_OTP: (code: string) =>
    `کد ورود شما به HS6Tools: ${code}\nاین کد تا ۲ دقیقه اعتبار دارد.\n${getSMSSiteUrl()}`,

  PASSWORD_RESET: (code: string) =>
    `کد بازیابی رمز عبور شما: ${code}\nلطفا این کد را در صفحه بازیابی HS6Tools وارد کنید.\n${getSMSSiteUrl()}`,

  PURCHASE_CONFIRMED: (orderNumber: string) =>
    `خرید شما با موفقیت ثبت شد. سفارش شماره ${orderNumber} در حال پردازش است. به‌زودی مراحل بعدی از طریق پیامک اطلاع‌رسانی می‌شود. از اعتماد شما سپاسگزاریم.\n${getSMSSiteUrl()}`,

  INVOICE: (invoiceNumber: string, amount: number) =>
    `فاکتور شماره ${invoiceNumber} به مبلغ ${formatSMSAmountInRials(amount)} ریال صادر شد.\n${getSMSSiteUrl()}`,

  POST_TRACKING: (customerName: string, orderNumber: string, address: string, trackingNumber: string) =>
    `${customerName} عزیز، سفارش شما با شماره ${orderNumber} از طریق پست به آدرس ${address} ارسال شد.\nکد رهگیری پستی: ${trackingNumber}\n${getSMSSiteUrl()}`,

  ORDER_PROCESSING: (orderNumber?: string) =>
    orderNumber
      ? `وضعیت سفارش ${orderNumber} به "در حال پردازش" تغییر کرد. به محض ارسال، کد رهگیری برایتان پیامک خواهد شد.\n${getSMSSiteUrl()}`
      : `وضعیت سفارش شما به "در حال پردازش" تغییر کرد. به محض ارسال، کد رهگیری برایتان پیامک خواهد شد.\n${getSMSSiteUrl()}`,
} as const;

/**
 * Helper function to send SMS safely (non-blocking)
 * This function catches errors and logs them without throwing
 * Use this when SMS failure shouldn't break the main flow
 */
export async function sendSMSSafe(
  options: SendSMSOptions,
  errorContext?: string
): Promise<void> {
  try {
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
      provider: detectSMSProvider(),
    });

    const result = await sendSMS(options);
    if (!result.success) {
      const isTestAccountLimitation = result.status === 501 && 
        result.error?.includes('صاحب حساب');
      
      if (isTestAccountLimitation && isDevelopment) {
        console.warn(`⚠️ [SMS] Test account limitation${errorContext ? ` (${errorContext})` : ''}:`, {
          error: result.error,
          status: result.status,
          receptor: options.receptor,
          provider: result.provider,
          note: 'In test/sandbox mode, SMS can only be sent to the account owner\'s number.',
          messagePreview: options.message.substring(0, 100) + '...',
        });
      } else {
        console.error(`❌ [SMS] Failed to send SMS${errorContext ? ` (${errorContext})` : ''}:`, {
          error: result.error,
          status: result.status,
          receptor: options.receptor,
          provider: result.provider,
        });
      }
    } else {
      console.log(`✅ [SMS] SMS sent successfully${errorContext ? ` (${errorContext})` : ''}:`, {
        messageId: result.messageId,
        status: result.status,
        receptor: options.receptor,
        provider: result.provider,
      });
    }
  } catch (error) {
    console.error(`❌ [SMS] Error sending SMS${errorContext ? ` (${errorContext})` : ''}:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      receptor: options.receptor,
    });
  }
}

export async function sendTemplateSMSSafe(
  options: TemplateSMSOptions,
  fallbackMessage: string,
  errorContext?: string
): Promise<void> {
  try {
    const skipSMSInDev = process.env.SKIP_SMS_IN_DEV === 'true';
    const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

    if (skipSMSInDev && isDevelopment) {
      console.log(`📱 [SMS Template] SMS skipped in development mode${errorContext ? ` (${errorContext})` : ''}:`, {
        receptor: options.receptor,
        templateEnvKey: options.templateEnvKey,
        parameterNames: Object.keys(options.parameters || {}),
        fallbackPreview: fallbackMessage.substring(0, 100) + '...',
        note: 'Set SKIP_SMS_IN_DEV=false to enable SMS in development',
      });
      return;
    }

    const phoneDigits = options.receptor.replace(/\D/g, '');
    if (phoneDigits.length !== 11 || !phoneDigits.startsWith('09')) {
      console.error(`[SMS Template] Invalid phone number format${errorContext ? ` (${errorContext})` : ''}:`, options.receptor);
      return;
    }

    const result = await sendTemplateSMS(options);
    if (result.success) {
      console.log(`✅ [SMS Template] Template SMS sent successfully${errorContext ? ` (${errorContext})` : ''}:`, {
        receptor: options.receptor,
        templateEnvKey: options.templateEnvKey,
        messageId: result.messageId,
        status: result.status,
      });
      return;
    }

    console.warn(`⚠️ [SMS Template] Template SMS failed, using plain SMS fallback${errorContext ? ` (${errorContext})` : ''}:`, {
      receptor: options.receptor,
      templateEnvKey: options.templateEnvKey,
      error: result.error,
      status: result.status,
    });

    await sendSMSSafe(
      {
        receptor: options.receptor,
        message: fallbackMessage,
      },
      errorContext ? `${errorContext} (template fallback)` : 'Template SMS fallback'
    );
  } catch (error) {
    console.error(`❌ [SMS Template] Error sending template SMS${errorContext ? ` (${errorContext})` : ''}:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      receptor: options.receptor,
      templateEnvKey: options.templateEnvKey,
    });

    await sendSMSSafe(
      {
        receptor: options.receptor,
        message: fallbackMessage,
      },
      errorContext ? `${errorContext} (template error fallback)` : 'Template SMS error fallback'
    );
  }
}

/**
 * Send low stock alert to admin users
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
