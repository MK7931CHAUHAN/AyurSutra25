const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require('../models/userModels');
const EmailService = require('../utils/emailService');
const { generateToken } = require("../utils/token");

/* ======================================================
   CREATE DEFAULT ADMIN (auto-run on server start)
====================================================== */
async function createDefaultAdmin() {
  try {
    await User.createDefaultAdmin();
  } catch (error) {
    console.error('Failed to create default admin:', error);
  }
}

// Run once when server starts
createDefaultAdmin();

/* ======================================================
   REGISTER USER
====================================================== */
// exports.register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password)
//       return res.status(400).json({ success: false, message: "All fields required" });

//     const existing = await User.findOne({ email });
//     if (existing) return res.status(400).json({ success: false, message: "Email already registered" });

//     // Create verification token
//     const verifyToken = generateToken();
//     const user = await User.create({
//       name,
//       email,
//       password,
//       isVerified: false,
//       verifyToken,
//       verifyTokenExpiry: Date.now() + 24*60*60*1000
//     });

//     const verifyLink = `${req.protocol}://${req.get("host")}/api/auth/verify-email?token=${verifyToken}&email=${email}`;
//     await EmailService.sendVerificationEmail(email, name, verifyLink);

//     res.status(201).json({ success: true, message: "Registration successful. Please verify your email to login." });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, message: "Registration failed" });
//   }
// };


exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields required"
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      isEmailVerified: true   // ✅ AUTO VERIFIED
    });

    res.status(201).json({
      success: true,
      message: "Registration successful. You can now login."
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Registration failed"
    });
  }
};

// 🔹 LOGIN

exports.login = async (req, res) => {
  try {
    let { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Email or phone and password required"
      });
    }

    identifier = identifier.trim().toLowerCase();

    // ✅ MUST SELECT PASSWORD
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
};


// exports.login = async (req, res) => {
//   try {
//     let { identifier, password } = req.body;

//     if (!identifier || !password) {
//       return res.status(400).json({ success: false, message: "Email or phone and password required" });
//     }

//     identifier = identifier.trim().toLowerCase(); // remove spaces & normalize

//     // Find by email or phone
//     const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] });
//     if (!user) {
//       console.log("Login failed, identifier not found:", identifier);
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     if (!user.isEmailVerified) {
//       return res.status(401).json({
//         success: false,
//         code: "EMAIL_NOT_VERIFIED",
//         message: "Please verify your email to login"
//       });
//     }


//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRE }
//     );

//     res.status(200).json({
//       success: true,
//       token,
//       user: { id: user._id, name: user.name, email: user.email, role: user.role }
//     });

//   } catch (error) {
//     console.error("LOGIN ERROR:", error);
//     res.status(500).json({ success: false, message: "Login failed" });
//   }
// };


// 🔹 VERIFY EMAIL
// exports.verifyEmail = async (req, res) => {
//   try {
//     const { token, email } = req.query;

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.redirect(
//         "https://ayursutrahealth.vercel.app/login?error=user_not_found"
//       );
//     }

//     if (
//       user.emailVerificationToken !== token ||
//       Date.now() > user.emailVerificationExpire
//     ) {
//       return res.redirect(
//         "https://ayursutrahealth.vercel.app/login?error=invalid_token"
//       );
//     }

//     // ✅ VERIFY SUCCESS
//     user.isEmailVerified = true;
//     user.emailVerificationToken = undefined;
//     user.emailVerificationExpire = undefined;
//     await user.save();

//     // ✅ FRONTEND LOGIN PAGE REDIRECT
//     return res.redirect(
//       "https://ayursutrahealth.vercel.app/login?verified=true"
//     );

//   } catch (error) {
//     console.error(error);
//     return res.redirect(
//       "https://ayursutrahealth.vercel.app/login?error=server_error"
//     );
//   }
// };



//-----------------------very otp--------
// ----------------- VERIFY OTP & GENERATE RESET TOKEN -----------------
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ success: false, message: "Email और OTP दोनों चाहिए" });

    // DB से user fetch करो + OTP fields select करो
    const user = await User.findOne({ email }).select(
      "+resetPasswordOTP +resetPasswordOTPExpiry"
    );
    if (!user) return res.status(404).json({ success: false, message: "User नहीं मिला" });

    console.log("EMAIL:", email);
    console.log("SENT OTP:", otp);
    console.log("DB OTP:", user.resetPasswordOTP);
    console.log("EXPIRY:", user.resetPasswordOTPExpiry, "NOW:", Date.now());

    // OTP और expiry check
    if (!user.resetPasswordOTP || user.resetPasswordOTP !== otp || Date.now() > new Date(user.resetPasswordOTPExpiry).getTime()) {
      return res.status(400).json({ success: false, message: "Invalid या expired OTP" });
    }

    // ✅ Reset token generate करो
    const resetToken = generateToken();

    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpiry = undefined;

    await user.save();

    console.log("RESET TOKEN GENERATED:", resetToken);

    res.status(200).json({ success: true, resetToken });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ success: false, message: "OTP verification failed" });
  }
};

// ----------------- RESET PASSWORD -----------------
exports.resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword)
      return res.status(400).json({ success: false, message: "सभी fields required हैं" });

    // DB से user fetch करो + reset token fields select करो
    const user = await User.findOne({ email }).select(
      "+resetPasswordToken +resetPasswordTokenExpiry"
    );
    if (!user) return res.status(404).json({ success: false, message: "User नहीं मिला" });

    console.log("DB TOKEN:", user.resetPasswordToken);
    console.log("DB EXPIRY:", user.resetPasswordTokenExpiry);
    console.log("PROVIDED TOKEN:", resetToken);

    const cleanToken = resetToken.trim(); // Extra space remove करो

    // Token validity check
    if (
      !user.resetPasswordToken ||
      user.resetPasswordToken !== cleanToken ||
      !user.resetPasswordTokenExpiry ||
      Date.now() > new Date(user.resetPasswordTokenExpiry).getTime()
    ) {
      return res.status(400).json({ success: false, message: "Invalid या expired reset token" });
    }

    // ✅ Password update करो
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiry = undefined;

    await user.save();

    console.log("Password reset successful for:", email);

    res.status(200).json({ success: true, message: "Password reset सफलतापूर्वक हुआ" });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ success: false, message: "Reset password failed" });
  }
};



// ✅ FORGOT PASSWORD - Send OTP

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP & expiry in DB
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpiry = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();

    console.log("OTP saved in DB:", user.resetPasswordOTP, user.resetPasswordOTPExpiry);

    // Send OTP email
    await EmailService.sendOTPEmail(user.email, otp, user.name);

    res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error("Forgot password error:", err.message);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

/* ======================================================
   GET CURRENT USER
====================================================== */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

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
      message: "Failed to fetch user details"
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
   CHECK ADMIN (for testing)
====================================================== */
exports.checkAdmin = async (req, res) => {
  try {
    const admin = await User.findOne({ 
      email: 'mkchauhan9263@gmail.com',
      role: 'admin' 
    });
    
    if (admin) {
      res.status(200).json({
        success: true,
        message: "Admin account exists",
        admin: {
          name: admin.name,
          email: admin.email,
          role: admin.role,
          isActive: admin.isActive
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Admin account not found"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};