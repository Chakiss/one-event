import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { SentMessageInfo } from 'nodemailer';
import * as handlebars from 'handlebars';
import { join } from 'path';
import { readFileSync } from 'fs';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private isInitialized = false;

  constructor() {
    void this.initializeTransporter();
  }

  private async initializeTransporter() {
    try {
      await this.createTransporter();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
    }
  }

  private async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initializeTransporter();
    }
  }

  private async createTransporter() {
    if (process.env.NODE_ENV === 'production') {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    templateName: string,
    context: Record<string, any>,
  ) {
    try {
      await this.ensureInitialized();

      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const template = this.loadTemplate(templateName);
      const html = template(context);

      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@oneevent.com',
        to,
        subject,
        html,
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const info: SentMessageInfo =
        await this.transporter.sendMail(mailOptions);

      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }

      return {
        success: true,
        messageId: (info as { messageId: string }).messageId,
      };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  async sendRegistrationConfirmation(
    to: string,
    registrationData: {
      guestName: string;
      guestEmail: string;
      guestPhone?: string;
      registrationId: string;
      eventTitle: string;
      eventDescription?: string;
      eventDate: string;
      eventTime: string;
      eventLocation?: string;
      eventUrl: string;
      customFields?: Record<string, any>;
      qrCodeUrl?: string;
      supportEmail?: string;
      unsubscribeUrl?: string;
    },
  ) {
    return this.sendEmail(
      to,
      `Registration Confirmed: ${registrationData.eventTitle}`,
      'registration-confirmation',
      {
        ...registrationData,
        supportEmail: registrationData.supportEmail || 'support@example.com',
        unsubscribeUrl:
          registrationData.unsubscribeUrl ||
          `${process.env.FRONTEND_URL}/unsubscribe`,
      },
    );
  }

  async sendEventReminder(
    to: string,
    reminderData: {
      guestName: string;
      registrationId: string;
      eventTitle: string;
      eventDescription?: string;
      eventDate: string;
      eventTime: string;
      eventLocation?: string;
      eventUrl: string;
      timeUntilEvent: string;
      eventInstructions?: string;
      qrCodeUrl?: string;
      supportEmail?: string;
      cancelUrl?: string;
    },
  ) {
    return this.sendEmail(
      to,
      `Reminder: ${reminderData.eventTitle} is Coming Up!`,
      'event-reminder',
      {
        ...reminderData,
        supportEmail: reminderData.supportEmail || 'support@example.com',
        cancelUrl:
          reminderData.cancelUrl ||
          `${process.env.FRONTEND_URL}/cancel-registration`,
      },
    );
  }

  async checkHealth(): Promise<{ status: string; message: string }> {
    try {
      await this.ensureInitialized();

      if (!this.transporter) {
        return {
          status: 'error',
          message: 'Email transporter not initialized',
        };
      }

      // Verify SMTP connection
      const isConnected = await this.transporter.verify();

      if (isConnected) {
        return {
          status: 'ok',
          message: 'Email service is working properly',
        };
      } else {
        return {
          status: 'error',
          message: 'SMTP connection failed',
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: `Email service error: ${(error as Error).message}`,
      };
    }
  }

  private loadTemplate(templateName: string): handlebars.TemplateDelegate {
    try {
      const templatePath = join(
        process.cwd(),
        'src',
        'email',
        'templates',
        `${templateName}.hbs`,
      );
      const templateSource = readFileSync(templatePath, 'utf8');
      return handlebars.compile(templateSource);
    } catch (error) {
      console.error(`Failed to load email template: ${templateName}`, error);
      // Fallback to basic template
      return handlebars.compile(
        '<h2>{{eventTitle}}</h2><p>Hello {{userName}},</p><p>{{message || "Thank you for using One Event!"}}</p>',
      );
    }
  }
}
