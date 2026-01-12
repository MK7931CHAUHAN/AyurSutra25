// controllers/authController.js
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require('../models/userModels');
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
/* ======================================================
   CREATE DEFAULT ADMIN (Auto run once)
====================================================== */
async function createDefaultAdmin() {
  try {
    const exists = await User.findOne({ email: "admin@cse.com" });
    if (exists) return;

    await User.create({
      name: "Administrator",
      email: "admin@cse.com",
      password: "Admin@123",
      role: "admin"
    });

    console.log("✅ Default admin created");
  } catch (error) {
    console.error("Admin creation failed:", error.message);
  }
}
createDefaultAdmin();

/* ======================================================
   REGISTER USER (Unified - supports email/phone)
====================================================== */
exports.register = async (req, res) => {
  try {
    // console.log('Register API - Request body:', req.body);
    
    const { name, email, phone, password, role = "patient" } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required"
      });
    }

    // Ensure email is lowercase
    const emailLower = email.toLowerCase();
    
    // Check for existing user (email OR phone)
    const existingUser = await User.findOne({
      $or: [
        { email: emailLower },
        ...(phone ? [{ phone }] : [])
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `User with ${existingUser.email === emailLower ? 'email' : 'phone number'} already exists`
      });
    }

    // Create user - password will be automatically hashed by the pre-save hook
    const user = await User.create({ 
      name: name.trim(), 
      email: emailLower, 
      phone: phone ? phone.trim() : '', 
      password, 
      role: role || "patient",
      isActive: true 
    });

    // console.log('Register API - User created:', user.email);

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "your-secret-key-change-in-production",
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        photo: user.photo
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed: " + error.message
    });
  }
};


/* ======================================================
   LOGIN USER (Supports email OR phone)
====================================================== */
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/Phone and password are required"
      });
    }

    // Find user by email OR phone
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { phone: identifier }
      ]
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated"
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "your-secret-key-change-in-production",
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        photo: user.photo,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed: " + error.message
    });
  }
};

// /* ======================================================
//    FORGOT PASSWORD (Generate Reset Token)
// ====================================================== */
// exports.forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is required"
//       });
//     }

//     // Find user by email
//     const user = await User.findOne({ email });

//     if (!user) {
//       // For security, don't reveal if user exists
//       return res.status(200).json({
//         success: true,
//         message: "If your email exists, you will receive a reset link"
//       });
//     }

//     // Generate reset token
//     const resetToken = crypto.randomBytes(32).toString("hex");

//     // Hash token and set expiry (10 minutes)
//     user.resetPasswordToken = crypto
//       .createHash("sha256")
//       .update(resetToken)
//       .digest("hex");
    
//     user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

//     await user.save({ validateBeforeSave: false });

//     // In production, send email here
//     console.log("Reset Token:", resetToken); // Remove in production

//     res.status(200).json({
//       success: true,
//       message: "Password reset email sent",
//       resetToken: resetToken, // In production, don't send token in response
//       expiresIn: "10 minutes"
//     });

//   } catch (error) {
//     console.error("Forgot password error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error: " + error.message
//     });
//   }
// };

// /* ======================================================
//    VERIFY RESET TOKEN
// ====================================================== */
// exports.verifyResetToken = async (req, res) => {
//   try {
//     const { token } = req.params;

//     if (!token) {
//       return res.status(400).json({
//         success: false,
//         message: "Token is required"
//       });
//     }

//     // Hash the token
//     const resetPasswordToken = crypto
//       .createHash("sha256")
//       .update(token)
//       .digest("hex");

//     // Find user with valid token
//     const user = await User.findOne({
//       resetPasswordToken,
//       resetPasswordExpire: { $gt: Date.now() }
//     });

//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid or expired reset token"
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Token is valid",
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email
//       }
//     });

//   } catch (error) {
//     console.error("Verify token error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error: " + error.message
//     });
//   }
// };

// /* ======================================================
//    RESET PASSWORD
// ====================================================== */
// exports.resetPassword = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { password, confirmPassword } = req.body;

//     // Validation
//     if (!password || !confirmPassword) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Password and confirmation are required" 
//       });
//     }

//     if (password !== confirmPassword) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Passwords do not match" 
//       });
//     }

//     if (!token) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Reset token is required" 
//       });
//     }

//     // Hash token
//     const resetPasswordToken = crypto
//       .createHash("sha256")
//       .update(token)
//       .digest("hex");

//     // Find user with valid token
//     const user = await User.findOne({
//       resetPasswordToken,
//       resetPasswordExpire: { $gt: Date.now() }
//     });

//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid or expired reset link"
//       });
//     }

//     // Update password
//     user.password = password;
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpire = undefined;

//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: "Password has been reset successfully"
//     });

//   } catch (error) {
//     console.error("Reset password error:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error: " + error.message 
//     });
//   }
// };

/* ======================================================
   CHANGE PASSWORD (Logged in users)
====================================================== */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // From auth middleware

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new password are required"
      });
    }

    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Update to new password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message
    });
  }
};

/* ======================================================
   LOGOUT
====================================================== */
exports.logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};

/* ======================================================
   GET CURRENT USER
====================================================== */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message
    });
  }
};



// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Helper function to send email
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `"AYURSUTRA" <${process.env.EMAIL_USER || 'noreply@ayursutra.com'}>`,
      to: options.email,
      subject: options.subject,
      html: options.html
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', options.email);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Email could not be sent');
  }
};

/* ======================================================
   FORGOT PASSWORD (Generate Reset Token with Email)
====================================================== */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // For security, don't reveal if user exists
      return res.status(200).json({
        success: true,
        message: "If your email exists, you will receive a reset link"
      });
    }

    // Generate reset token (6-digit code)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash token and set expiry (10 minutes)
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    // Email content
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6; margin: 0;">AYURSUTRA</h1>
          <p style="color: #6b7280; margin-top: 5px;">Ayurvedic Management System</p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #111827; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            You requested to reset your password. Use the 6-digit verification code below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background-color: #3b82f6; color: white; font-size: 28px; font-weight: bold; letter-spacing: 10px; padding: 15px 30px; border-radius: 8px;">
              ${resetToken}
            </div>
          </div>
          
          <p style="color: #4b5563; line-height: 1.6;">
            Or click the button below to reset your password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #3b82f6; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <strong>Important:</strong> This reset link will expire in 10 minutes.
            If you didn't request this, please ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p>© ${new Date().getFullYear()} AYURSUTRA. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    `;

    // Send email
    await sendEmail({
      email: user.email,
      subject: 'AYURSUTRA - Password Reset Request',
      html: html
    });

    // Also send the token in response for development
    if (process.env.NODE_ENV === 'development') {
      console.log('Reset Token (Dev only):', resetToken);
    }

    res.status(200).json({
      success: true,
      message: "Password reset email sent successfully",
      token: resetToken, // For development/testing
      expiresIn: "10 minutes"
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    
    // Reset user's token if email fails
    if (error.message === 'Email could not be sent') {
      await User.findByIdAndUpdate(user._id, {
        resetPasswordToken: undefined,
        resetPasswordExpire: undefined
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message
    });
  }
};

/* ======================================================
   VERIFY RESET TOKEN (6-digit code)
====================================================== */
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token || token.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "Invalid token format"
      });
    }

    // Hash the token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    res.status(200).json({
      success: true,
      message: "Token is valid",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Verify token error:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message
    });
  }
};

/* ======================================================
   RESET PASSWORD (with token verification)
====================================================== */
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // Validation
    if (!password || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Password and confirmation are required" 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Passwords do not match" 
      });
    }

    if (!token || token.length !== 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid reset token format" 
      });
    }

    // Hash token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // Send confirmation email
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #10b981; margin: 0;">AYURSUTRA</h1>
          <p style="color: #6b7280; margin-top: 5px;">Ayurvedic Management System</p>
        </div>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #065f46; margin-top: 0;">✅ Password Reset Successful</h2>
          <p style="color: #047857; line-height: 1.6;">
            Your password has been reset successfully. You can now login with your new password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
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

    await sendEmail({
      email: user.email,
      subject: 'AYURSUTRA - Password Reset Successful',
      html: html
    });

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully"
    });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error: " + error.message 
    });
  }
};