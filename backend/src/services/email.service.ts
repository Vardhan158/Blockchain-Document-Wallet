import nodemailer, { Transporter } from 'nodemailer';
import https from 'https';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

function sendBrevoApiEmail(
  apiKey: string,
  payload: {
    sender: { name: string; email: string };
    to: { email: string }[];
    subject: string;
    htmlContent: string;
  }
): Promise<{ messageId?: string }> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const options = {
      hostname: 'api.brevo.com',
      port: 443,
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, res => {
      let responseBody = '';
      res.on('data', chunk => {
        responseBody += chunk;
      });
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(responseBody));
          } catch (e) {
            resolve({ messageId: 'brevo_api_sent' });
          }
        } else {
          reject(new Error(`Brevo API returned status ${res.statusCode}: ${responseBody}`));
        }
      });
    });

    req.on('error', err => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

export class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private async initTransporter() {
    const smtpHost = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.BREVO_USER || process.env.SMTP_USER;
    const smtpPass = process.env.BREVO_PASS || process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: false,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      console.log(`📧 [BREVO EMAIL SERVICE] Configured Brevo SMTP Relay at ${smtpHost}:${smtpPort}`);
    }
  }

  /**
   * Sends real-time Email ID Verification OTP email using Brevo (Sendinblue) API / SMTP
   */
  public async sendOtpEmail(
    toEmail: string,
    otp: string
  ): Promise<{ sent: boolean; messageId?: string; previewUrl?: string }> {
    const brevoApiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_FROM_EMAIL || 'harshavardhandevang@gmail.com';
    const senderName = process.env.EMAIL_FROM_NAME || 'Utadmane Admin';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #0F172A; padding: 30px; color: #F8FAFC; border-radius: 12px; max-width: 500px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #6366F1; margin: 0; font-size: 24px;">🛡️ Blockchain Document Wallet</h2>
          <p style="color: #94A3B8; font-size: 13px; margin-top: 4px;">Sovereign Credential Identity Verification</p>
        </div>

        <div style="background-color: #1E293B; border-radius: 10px; padding: 20px; border: 1px solid #334155; text-align: center;">
          <p style="color: #CBD5E1; font-size: 14px; margin-top: 0;">Your 4-digit Email ID Verification OTP is:</p>
          <div style="background-color: #0F172A; display: inline-block; padding: 12px 28px; border-radius: 8px; border: 1.5px solid #6366F1; margin: 10px 0;">
            <span style="font-size: 32px; font-weight: 800; color: #FFFFFF; letter-spacing: 6px; font-family: monospace;">${otp}</span>
          </div>
          <p style="color: #94A3B8; font-size: 12px; margin-bottom: 0;">This code is valid for <strong>10 minutes</strong>. Do not share this OTP with anyone.</p>
        </div>

        <div style="text-align: center; margin-top: 20px; font-size: 11px; color: #64748B;">
          <p style="margin: 0;">If you did not request this email, please ignore it.</p>
          <p style="margin-top: 4px;">© 2026 ${senderName}. All rights reserved.</p>
        </div>
      </div>
    `;

    // Strategy 1: Attempt Brevo Transactional Email REST API via Native HTTPS
    if (brevoApiKey) {
      try {
        const response = await sendBrevoApiEmail(brevoApiKey, {
          sender: {
            name: senderName,
            email: senderEmail,
          },
          to: [{ email: toEmail }],
          subject: `${otp} is your Verification OTP - Blockchain Document Wallet`,
          htmlContent,
        });

        console.log('====================================================');
        console.log(`📧 [BREVO REAL-TIME EMAIL DELIVERED] Recipient: ${toEmail}`);
        console.log(`🆔 Brevo Message ID: ${response.messageId}`);
        console.log('====================================================');

        return {
          sent: true,
          messageId: response.messageId,
        };
      } catch (brevoApiErr: any) {
        console.warn(
          '⚠️ [BREVO API WARNING] REST API call failed, falling back to SMTP relay:',
          brevoApiErr.message
        );
      }
    }

    // Strategy 2: Fallback to Brevo SMTP Relay via Nodemailer
    try {
      if (!this.transporter) {
        await this.initTransporter();
      }

      if (this.transporter) {
        const info = await this.transporter.sendMail({
          from: `"${senderName}" <${senderEmail}>`,
          to: toEmail,
          subject: `${otp} is your Verification OTP - Blockchain Document Wallet`,
          text: `Your Blockchain Document Wallet 4-digit verification OTP is: ${otp}. Valid for 10 minutes.`,
          html: htmlContent,
        });

        console.log('====================================================');
        console.log(`📧 [BREVO SMTP EMAIL DELIVERED] Sent to: ${toEmail}`);
        console.log(`🆔 Message ID: ${info.messageId}`);
        console.log('====================================================');

        return {
          sent: true,
          messageId: info.messageId,
        };
      }
    } catch (smtpErr: any) {
      console.error(`❌ [BREVO SMTP ERROR] Failed to send email to ${toEmail}:`, smtpErr.message);
    }

    return { sent: false };
  }
}

export const emailService = new EmailService();
