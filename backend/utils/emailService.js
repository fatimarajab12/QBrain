import { emailConfig } from '../config/nodemailer.config.js';
import { getTemplate, EmailTemplates } from '../utils/emailTemplates.js';

class EmailService {
  constructor() {
    this.transporter = null;
  }

  async initialize() {
    this.transporter = await emailConfig.initialize();
  }

  async sendTemplateEmail(to, templateType, templateData) {
    try {
      const template = getTemplate(templateType, templateData);
      
      if (!template) {
        throw new Error(`Template ${templateType} not found`);
      }

      const mailOptions = {
        from: `"${process.env.BREVO_SENDER_NAME}" <${process.env.BREVO_SENDER_EMAIL}>`,
        to,
        subject: template.subject,
        html: template.html,
        text: this.generateTextVersion(template.html)
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`Email sent (${templateType}) to: ${to}`);
      
      return {
        success: true,
        messageId: result.messageId,
        to,
        templateType
      };
    } catch (error) {
      console.error(`Failed to send email (${templateType}) to ${to}:`, error);
      throw this.handleEmailError(error);
    }
  }

  async sendVerificationEmail(email, name, verificationToken) {
    const verificationLink = `${process.env.APP_URL}/api/auth/verify-email?token=${verificationToken}`;
    
    return await this.sendTemplateEmail(email, EmailTemplates.VERIFICATION, {
      userName: name,
      verificationLink,
      verificationToken
    });
  }

  async sendWelcomeEmail(email, name) {
    return await this.sendTemplateEmail(email, EmailTemplates.WELCOME, {
      userName: name
    });
  }

  async sendPasswordResetCode(email, code, name) {
    return await this.sendTemplateEmail(email, EmailTemplates.RESET_CODE, {
      userName: name,
      code
    });
  }

  generateTextVersion(html) {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  handleEmailError(error) {
    if (error.code === 'EAUTH') {
      return new Error('Email authentication failed. Check SMTP credentials.');
    } else if (error.code === 'EENVELOPE') {
      return new Error('Invalid email address.');
    } else if (error.code === 'ECONNECTION') {
      return new Error('Cannot connect to email server.');
    }
    
    return error;
  }

  getStatus() {
    return emailConfig.getStatus();
  }

  async close() {
    await emailConfig.close();
  }
}

export const emailService = new EmailService();
export default emailService;
