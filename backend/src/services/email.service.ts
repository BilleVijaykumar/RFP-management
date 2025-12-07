import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  /**
   * Send RFP email to vendor
   */
  async sendRFPEmail(
    to: string,
    vendorName: string,
    rfp: {
      title: string;
      description?: string;
      requirements: any;
      budget?: number;
      deadline?: string;
      paymentTerms?: string;
      warranty?: string;
      deliveryTerms?: string;
    }
  ): Promise<string> {
    try {
      const requirementsText = Array.isArray(rfp.requirements)
        ? rfp.requirements.map((req: any, idx: number) => {
            let text = `${idx + 1}. ${req.item}`;
            if (req.quantity) text += ` (Quantity: ${req.quantity})`;
            if (req.specifications) text += ` - ${req.specifications}`;
            return text;
          }).join('\n')
        : JSON.stringify(rfp.requirements, null, 2);

      const emailBody = `
Dear ${vendorName},

We are requesting a proposal for the following procurement:

RFP Title: ${rfp.title}

${rfp.description ? `Description:\n${rfp.description}\n\n` : ''}

Requirements:
${requirementsText}

${rfp.budget ? `Budget: $${rfp.budget.toLocaleString()}\n` : ''}
${rfp.deadline ? `Deadline: ${rfp.deadline}\n` : ''}
${rfp.paymentTerms ? `Payment Terms: ${rfp.paymentTerms}\n` : ''}
${rfp.warranty ? `Warranty Required: ${rfp.warranty}\n` : ''}
${rfp.deliveryTerms ? `Delivery Terms: ${rfp.deliveryTerms}\n` : ''}

Please provide your proposal including:
- Detailed pricing (itemized if possible)
- Payment terms
- Warranty information
- Delivery timeline
- Any additional terms or conditions

Please reply to this email with your proposal.

Thank you,
Procurement Team
      `.trim();

      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject: `RFP: ${rfp.title}`,
        text: emailBody,
        html: emailBody.replace(/\n/g, '<br>')
      });

      logger.info(`RFP email sent to ${to}: ${info.messageId}`);
      return info.messageId || '';
    } catch (error) {
      logger.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Test email connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      logger.error('Email connection test failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();

