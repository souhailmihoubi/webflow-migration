import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  private transporter: nodemailer.Transporter;
  private readonly recipientEmail = 'meublelartistou@gmail.com';

  constructor() {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
      // Production SMTP configuration
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      this.logger.log('📧 Using production SMTP for contact emails');
    } else {
      // Development: use Ethereal Email for testing
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
      this.logger.log('📧 Using Ethereal Email for development (contact)');
    }
  }

  async sendContactEmail(
    dto: CreateContactDto,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const info = await this.transporter.sendMail({
        from:
          process.env.EMAIL_FROM ||
          '"L\'Artistou Website" <noreply@lartistou.com>',
        to: this.recipientEmail,
        replyTo: dto.email || undefined,
        subject: `[Contact Form] ${dto.subject}`,
        html: `
          <!DOCTYPE HTML>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #1a1a1a; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background-color: #f9f9f9; }
              .field { margin-bottom: 15px; }
              .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; }
              .value { margin-top: 5px; padding: 10px; background-color: white; border-left: 3px solid #c5a572; }
              .footer { margin-top: 20px; padding: 15px; background-color: #eee; font-size: 12px; color: #666; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin: 0;">Nouveau Message de Contact</h2>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">Nom</div>
                  <div class="value">${dto.name}</div>
                </div>
                <div class="field">
                  <div class="label">Email</div>
                  <div class="value">${dto.email ? `<a href="mailto:${dto.email}">${dto.email}</a>` : 'Non fourni'}</div>
                </div>
                <div class="field">
                  <div class="label">Téléphone</div>
                  <div class="value">+216 ${dto.phone}</div>
                </div>
                <div class="field">
                  <div class="label">Sujet</div>
                  <div class="value">${dto.subject}</div>
                </div>
                <div class="field">
                  <div class="label">Message</div>
                  <div class="value" style="white-space: pre-wrap;">${dto.message}</div>
                </div>
              </div>
              <div class="footer">
                Ce message a été envoyé depuis le formulaire de contact du site L'Artistou.
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Nouveau Message de Contact
===========================

Nom: ${dto.name}
Email: ${dto.email}
Téléphone: +216 ${dto.phone}
Sujet: ${dto.subject}

Message:
${dto.message}

---
Ce message a été envoyé depuis le formulaire de contact du site L'Artistou.
        `,
      });

      // For development: log the preview URL
      if (process.env.NODE_ENV !== 'production') {
        this.logger.log('📧 Contact email sent!');
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          this.logger.log(`Preview URL: ${previewUrl}`);
        }
      }

      return {
        success: true,
        message: 'Votre message a été envoyé avec succès',
      };
    } catch (error) {
      this.logger.error('Failed to send contact email', error);
      throw error;
    }
  }
}
