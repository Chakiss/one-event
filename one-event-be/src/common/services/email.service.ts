import * as nodemailer from 'nodemailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.createTransporter();
  }

  private createTransporter() {
    const emailHost = this.configService.get<string>('EMAIL_HOST');
    const emailPort = this.configService.get<number>('EMAIL_PORT');
    const emailUser = this.configService.get<string>('EMAIL_USER');
    const emailPass = this.configService.get<string>('EMAIL_PASS');
    const emailSecure = this.configService.get<boolean>('EMAIL_SECURE', false);

    this.logger.log('Creating email transporter...');
    
    if (!emailHost || !emailUser || !emailPass) {
      this.logger.warn(
        'Email configuration is incomplete. Email sending will be simulated.',
      );
      this.transporter = null;
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailSecure, // true for 465, false for other ports
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      this.logger.log('Email transporter created successfully');
    } catch (error) {
      this.logger.error('Failed to create email transporter:', error);
      this.transporter = null;
    }
  }

  async sendVerificationEmail(email: string, token: string, name: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3002');
    const verificationLink = `${frontendUrl}/auth/verify-email?token=${token}`;
    const emailFrom = this.configService.get<string>('EMAIL_FROM', 'OneEvent <noreply@oneevent.com>');

    const mailOptions = {
      from: emailFrom,
      to: email,
      subject: 'Verify Your Email - OneEvent Registration',
      html: this.getVerificationEmailTemplate(name, verificationLink, token),
    };

    try {
      if (!this.transporter) {
        this.logger.log('Email transporter not configured. Simulating email send...');
        this.logger.log(`--- SIMULATED EMAIL ---`);
        this.logger.log(`To: ${email}`);
        this.logger.log(`Subject: ${mailOptions.subject}`);
        this.logger.log(`Verification Link: ${verificationLink}`);
        this.logger.log(`Verification Token: ${token}`);
        this.logger.log(`--- END SIMULATED EMAIL ---`);
        return;
      }

      const info = await this.transporter.sendMail(mailOptions);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.log(
        `Verification email sent to ${email}: ${info.messageId || 'unknown'}`,
      );
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}:`, error);
      throw new Error('Failed to send verification email');
    }
  }

  private getVerificationEmailTemplate(name: string, verificationLink: string, token: string): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - OneEvent</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: white;
                border-radius: 10px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #3b82f6;
                margin-bottom: 10px;
            }
            .title {
                font-size: 24px;
                font-weight: bold;
                color: #1f2937;
                margin-bottom: 20px;
            }
            .content {
                margin-bottom: 30px;
                color: #4b5563;
                font-size: 16px;
            }
            .verify-button {
                display: inline-block;
                padding: 15px 30px;
                background-color: #3b82f6;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                text-align: center;
                margin: 20px 0;
            }
            .verify-button:hover {
                background-color: #2563eb;
            }
            .alternative {
                margin-top: 30px;
                padding: 20px;
                background-color: #f9fafb;
                border-radius: 8px;
                border-left: 4px solid #3b82f6;
            }
            .token {
                font-family: 'Courier New', monospace;
                background-color: #e5e7eb;
                padding: 10px;
                border-radius: 4px;
                word-break: break-all;
                margin: 10px 0;
            }
            .footer {
                margin-top: 40px;
                text-align: center;
                color: #6b7280;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">OneEvent</div>
                <div class="title">Verify Your Email Address</div>
            </div>
            
            <div class="content">
                <p>Hello <strong>${name}</strong>,</p>
                
                <p>Thank you for registering with OneEvent! To complete your registration and start using our enterprise event management platform, please verify your email address.</p>
                
                <p>Click the button below to verify your email:</p>
                
                <div style="text-align: center;">
                    <a href="${verificationLink}" class="verify-button">Verify Email Address</a>
                </div>
                
                <div class="alternative">
                    <p><strong>Alternative verification method:</strong></p>
                    <p>If the button above doesn't work, you can copy and paste the following link into your browser:</p>
                    <div style="word-break: break-all; color: #3b82f6;">${verificationLink}</div>
                    
                    <p style="margin-top: 20px;"><strong>Or enter this verification code manually:</strong></p>
                    <div class="token">${token}</div>
                </div>
                
                <p style="margin-top: 30px;"><strong>Security Note:</strong> This verification link will expire in 24 hours for security reasons. If you didn't create an account with OneEvent, please ignore this email.</p>
            </div>
            
            <div class="footer">
                <p>Best regards,<br>The OneEvent Team</p>
                <p style="margin-top: 20px; font-size: 12px;">
                    This is an automated email. Please do not reply to this message.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  async sendPasswordResetEmail(email: string, token: string, name: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3002');
    const resetLink = `${frontendUrl}/auth/reset-password?token=${token}`;
    const emailFrom = this.configService.get<string>('EMAIL_FROM', 'OneEvent <noreply@oneevent.com>');

    const mailOptions = {
      from: emailFrom,
      to: email,
      subject: 'Reset Your Password - OneEvent',
      html: this.getPasswordResetEmailTemplate(name, resetLink),
    };

    try {
      if (!this.transporter) {
        this.logger.log('Email transporter not configured. Simulating password reset email...');
        this.logger.log(`--- SIMULATED EMAIL ---`);
        this.logger.log(`To: ${email}`);
        this.logger.log(`Subject: ${mailOptions.subject}`);
        this.logger.log(`Reset Link: ${resetLink}`);
        this.logger.log(`--- END SIMULATED EMAIL ---`);
        return;
      }

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Password reset email sent to ${email}: ${(info as any).messageId || 'unknown'}`,
      );
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
      throw new Error('Failed to send password reset email');
    }
  }

  private getPasswordResetEmailTemplate(name: string, resetLink: string): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - OneEvent</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: white;
                border-radius: 10px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #3b82f6;
                margin-bottom: 10px;
            }
            .title {
                font-size: 24px;
                font-weight: bold;
                color: #1f2937;
                margin-bottom: 20px;
            }
            .content {
                margin-bottom: 30px;
                color: #4b5563;
                font-size: 16px;
            }
            .reset-button {
                display: inline-block;
                padding: 15px 30px;
                background-color: #ef4444;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                text-align: center;
                margin: 20px 0;
            }
            .reset-button:hover {
                background-color: #dc2626;
            }
            .footer {
                margin-top: 40px;
                text-align: center;
                color: #6b7280;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">OneEvent</div>
                <div class="title">Reset Your Password</div>
            </div>
            
            <div class="content">
                <p>Hello <strong>${name}</strong>,</p>
                
                <p>We received a request to reset your password for your OneEvent account. Click the button below to create a new password:</p>
                
                <div style="text-align: center;">
                    <a href="${resetLink}" class="reset-button">Reset Password</a>
                </div>
                
                <p><strong>Security Note:</strong> This password reset link will expire in 1 hour for security reasons. If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
            </div>
            
            <div class="footer">
                <p>Best regards,<br>The OneEvent Team</p>
                <p style="margin-top: 20px; font-size: 12px;">
                    This is an automated email. Please do not reply to this message.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}
