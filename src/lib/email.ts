import nodemailer from 'nodemailer';
import { prisma } from './prisma';

/**
 * Get email transporter from settings
 */
async function getTransporter() {
  const settings = await prisma.emailSettings.findFirst();
  
  if (!settings || !settings.isActive) {
    throw new Error('Email service is not configured or not active');
  }

  return nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure: settings.enableSSL,
    auth: {
      user: settings.smtpUser,
      pass: settings.smtpPassword,
    },
  });
}

/**
 * Send email
 */
export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  fromName?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const settings = await prisma.emailSettings.findFirst();
    
    if (!settings || !settings.isActive) {
      console.warn('Email service is not configured or not active. Email not sent.');
      return { success: false, error: 'Email service not configured' };
    }

    const transporter = await getTransporter();
    
    const mailOptions = {
      from: options.from || `${settings.fromName} <${settings.fromEmail}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    await transporter.sendMail(mailOptions);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Send quote email to customer
 */
export async function sendQuoteEmail(
  customerEmail: string,
  customerName: string,
  quoteNumber: string,
  message?: string
): Promise<{ success: boolean; error?: string }> {
  const emailHTML = `
    <!DOCTYPE html>
    <html dir="rtl" lang="fa">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Vazirmatn', Arial, sans-serif; direction: rtl; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 30px; }
        .content { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .button { display: inline-block; padding: 12px 24px; background: #f97316; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://hs6tools.com'}/logo.svg" alt="HS6Tools" style="max-width: 150px; height: auto; margin-bottom: 20px;" />
          <h1>HS6Tools</h1>
        </div>
        <div class="content">
          <h2>سلام ${customerName}،</h2>
          <p>پیشنهاد قیمت شما با شماره <strong>${quoteNumber}</strong> آماده است.</p>
          ${message ? `<p>${message}</p>` : ''}
          <p>لطفاً برای مشاهده جزئیات پیشنهاد قیمت، به پنل کاربری خود مراجعه کنید.</p>
          <a href="${process.env.NEXTAUTH_URL || 'https://hs6tools.com'}" class="button">مشاهده پیشنهاد قیمت</a>
        </div>
        <p style="text-align: center; color: #666; font-size: 12px;">
          این ایمیل به صورت خودکار ارسال شده است. لطفاً به آن پاسخ ندهید.
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `پیشنهاد قیمت شما آماده است - ${quoteNumber}`,
    html: emailHTML,
  });
}

