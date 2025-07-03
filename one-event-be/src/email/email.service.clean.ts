import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import { join } from 'path';
import { readFileSync } from 'fs';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    void this.createTransporter();
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
      const template = this.loadTemplate(templateName);
      const html = template(context);

      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@oneevent.com',
        to,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);

      if (process.env.NODE_ENV !== 'production') {
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  async sendRegistrationConfirmation(
    to: string,
    userName: string,
    eventTitle: string,
    eventDate: string,
    eventLocation: string,
  ) {
    return this.sendEmail(
      to,
      `Registration Confirmed: ${eventTitle}`,
      'registration-confirmation',
      {
        userName,
        eventTitle,
        eventDate,
        eventLocation,
      },
    );
  }

  async sendRegistrationApproved(
    to: string,
    userName: string,
    eventTitle: string,
    eventDate: string,
    eventLocation: string,
  ) {
    return this.sendEmail(
      to,
      `Registration Approved: ${eventTitle}`,
      'registration-approved',
      {
        userName,
        eventTitle,
        eventDate,
        eventLocation,
      },
    );
  }

  async sendEventCancellation(
    to: string,
    userName: string,
    eventTitle: string,
    reason?: string,
  ) {
    return this.sendEmail(
      to,
      `Event Cancelled: ${eventTitle}`,
      'event-cancellation',
      {
        userName,
        eventTitle,
        reason: reason || 'Unforeseen circumstances',
      },
    );
  }

  async sendEventReminder(
    to: string,
    userName: string,
    eventTitle: string,
    eventDate: string,
    eventLocation: string,
  ) {
    return this.sendEmail(
      to,
      `Reminder: ${eventTitle} is Tomorrow!`,
      'event-reminder',
      {
        userName,
        eventTitle,
        eventDate,
        eventLocation,
      },
    );
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
