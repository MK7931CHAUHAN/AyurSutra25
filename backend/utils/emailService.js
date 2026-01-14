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

  async sendVerificationEmail(to, name, verifyLink) {
    if (!this.isConnected) return;

    const mailOptions = {
  from: process.env.SMTP_FROM,
  to,
  subject: "Verify your email 🌿",
  html: `
    <h2>Hello ${name}</h2>
    <p>Welcome to <b>AyurSutra</b>!</p>
    <p>Please verify your email to continue.</p>

    <p>
      <a 
        href="${verifyLink}" 
        style="
          display:inline-block;
          padding:10px 20px;
          background:#16a34a;
          color:#fff;
          text-decoration:none;
          border-radius:6px;
          font-weight:bold;
        "
        target="_blank"
      >
        Verify Email
      </a>
    </p>

    <p>This link is valid for 24 hours.</p>
  `
};


    try {
      await this.transporter.sendMail(mailOptions);
      console.log("📩 Verification email sent to:", to);
    } catch (error) {
      console.error("❌ Failed to send verification email:", error.message);
    }
  }

  async sendOTPEmail(to, otp, name) {
    if (!this.isConnected) return;

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject: "Password Reset OTP 🌿",
      html: `
        <h2>Hello ${name}</h2>
        <p>Your OTP for password reset is:</p>
        <h3 style="text-align:center;">${otp}</h3>
        <p>This OTP is valid for 10 minutes.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log("📩 OTP email sent to:", to);
    } catch (error) {
      console.error("❌ Failed to send OTP email:", error.message);
    }
  }

  async sendPasswordResetSuccess(to, name) {
    if (!this.isConnected) return;

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject: "Password Reset Successful 🌿",
      html: `
        <h2>Hello ${name}</h2>
        <p>Your password has been reset successfully.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log("📩 Password reset success email sent to:", to);
    } catch (error) {
      console.error("❌ Failed to send reset success email:", error.message);
    }
  }
}

module.exports = new EmailService();
