// services/email.service.js
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendEmail(options) {
    try {
      const mailOptions = {
        from: `"AYURSUTRA" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.html
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Email sent to:', options.email);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Email could not be sent');
    }
  }

  async sendOTPEmail(email, otp, name = 'User') {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6; margin: 0;">AYURSUTRA</h1>
          <p style="color: #6b7280; margin-top: 5px;">Ayurvedic Management System</p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #111827; margin-top: 0;">Password Reset OTP</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Hello ${name},<br>
            You requested to reset your password. Use the 6-digit OTP below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background-color: #3b82f6; color: white; font-size: 28px; font-weight: bold; letter-spacing: 10px; padding: 15px 30px; border-radius: 8px;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <strong>Important:</strong> This OTP will expire in 10 minutes.
            If you didn't request this, please ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p>© ${new Date().getFullYear()} AYURSUTRA. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      email,
      subject: 'AYURSUTRA - Password Reset OTP',
      html
    });
  }

  async sendVerificationEmail(email, token, name = 'User') {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6; margin: 0;">AYURSUTRA</h1>
          <p style="color: #6b7280; margin-top: 5px;">Ayurvedic Management System</p>
        </div>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #065f46; margin-top: 0;">Welcome to AYURSUTRA, ${name}!</h2>
          <p style="color: #047857; line-height: 1.6;">
            Thank you for registering. Please verify your email address to activate your account.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="display: inline-block; background-color: #10b981; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #a7f3d0;">
            <strong>Note:</strong> This link will expire in 24 hours.
            If you didn't create an account, please ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p>© ${new Date().getFullYear()} AYURSUTRA. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      email,
      subject: 'AYURSUTRA - Verify Your Email Address',
      html
    });
  }

  async sendPasswordResetSuccessEmail(email, name = 'User') {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6; margin: 0;">AYURSUTRA</h1>
          <p style="color: #6b7280; margin-top: 5px;">Ayurvedic Management System</p>
        </div>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #065f46; margin-top: 0;">Password Reset Successful</h2>
          <p style="color: #047857; line-height: 1.6;">
            Hello ${name},<br>
            Your password has been reset successfully. You can now login with your new password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/login" 
               style="display: inline-block; background-color: #10b981; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">
              Login to Your Account
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #a7f3d0;">
            If you did not perform this action, please contact our support team immediately.
          </p>
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p>© ${new Date().getFullYear()} AYURSUTRA. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      email,
      subject: 'AYURSUTRA - Password Reset Successful',
      html
    });
  }
}

module.exports = new EmailService();