import nodemailer from 'nodemailer';

class EmailConfig {
  constructor() {
    this.transporter = null;
    this.isConnected = false;
  }

  async initialize() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.BREVO_SMTP_HOST,
        port: process.env.BREVO_SMTP_PORT,
        secure: false,
        auth: {
          user: process.env.BREVO_SMTP_USERNAME,
          pass: process.env.BREVO_SMTP_PASSWORD,
        },
        pool: true, 
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 1000,
        rateLimit: 5
      });

      // Verify connection
      await this.transporter.verify();
      this.isConnected = true;
      
      console.log('Email service initialized successfully');
      console.log('SMTP Server:', process.env.BREVO_SMTP_HOST);
      console.log('SMTP User:', process.env.BREVO_SMTP_USERNAME);
      
      return this.transporter;
    } catch (error) {
      this.isConnected = false;
      console.error('Email service initialization failed:', error.message);
      throw error;
    }
  }

  getTransporter() {
    if (!this.transporter || !this.isConnected) {
      throw new Error('Email service not initialized. Call initialize() first.');
    }
    return this.transporter;
  }

  getStatus() {
    return {
      isConnected: this.isConnected,
      host: process.env.BREVO_SMTP_HOST,
      user: process.env.BREVO_SMTP_USERNAME
    };
  }

  async close() {
    if (this.transporter) {
      await this.transporter.close();
      this.isConnected = false;
      console.log('Email connections closed');
    }
  }
}

export const emailConfig = new EmailConfig();
export default emailConfig;