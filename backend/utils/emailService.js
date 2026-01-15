const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    this.transporter.verify((err) => {
      if (err) {
        console.error("❌ SMTP Error:", err.message);
        this.isConnected = false;
      } else {
        console.log("✅ SMTP Connected Successfully");
        this.isConnected = true;
      }
    });
  }

  async sendEmail({ to, subject, html }) {
    if (!this.isConnected) return;

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        html
      });
      console.log("📩 Email sent to:", to);
    } catch (error) {
      console.error("❌ Failed to send email:", error.message);
    }
  }

  async sendVerificationEmail(to, name, verifyLink) {
    return this.sendEmail({
      to,
      subject: "Verify your email 🌿",
      html: `
        <h2>Hello ${name}</h2>
        <p>Welcome to <b>AyurSutra</b>!</p>
        <a href="${verifyLink}">Verify Email</a>
      `
    });
  }

  async sendOTPEmail(to, otp, name) {
    return this.sendEmail({
      to,
      subject: "Password Reset OTP 🌿",
      html: `
        <h2>Hello ${name}</h2>
        <h3>${otp}</h3>
        <p>Valid for 10 minutes</p>
      `
    });
  }

  async sendPasswordResetSuccess(to, name) {
    return this.sendEmail({
      to,
      subject: "Password Reset Successful 🌿",
      html: `
        <h2>Hello ${name}</h2>
        <p>Your password has been reset successfully.</p>
      `
    });
  }
}

module.exports = new EmailService();
