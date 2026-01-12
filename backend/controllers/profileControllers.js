const User = require("../models/userModels");
const bcrypt = require('bcryptjs');

/* ======================================================
   CREATE / COMPLETE MY PROFILE (Optional fields)
====================================================== */
exports.createMyProfile = async (req, res) => {
  try {
    const { number, bio, photo } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Add extra profile info
    if (number) user.number = number;
    if (bio) user.bio = bio;
    if (photo) user.photo = photo;

    await user.save();

    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        number: user.number,
        bio: user.bio,
        photo: user.photo,
        role: user.role,
        settings: user.settings || {}
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ======================================================
   READ MY PROFILE
====================================================== */
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Ensure settings object exists
    const userWithSettings = {
      ...user.toObject(),
      settings: user.settings || {
        notifications: {
          email: true,
          push: true,
          marketing: false
        },
        privacy: {
          profileVisible: true,
          showEmail: false,
          showPhone: false
        },
        preferences: {
          theme: "light",
          language: "en",
          timezone: "UTC"
        },
        security: {
          twoFactor: false,
          sessionTimeout: 30
        }
      }
    };

    res.status(200).json({
      success: true,
      user: userWithSettings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ======================================================
   UPDATE MY PROFILE (PARTIAL UPDATE)
====================================================== */
exports.updateMyProfile = async (req, res) => {
  try {
    const { name, number, bio, photo } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update only sent fields
    if (name) user.name = name;
    if (number) user.number = number;
    if (bio) user.bio = bio;
    if (photo) user.photo = photo;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        number: user.number,
        bio: user.bio,
        photo: user.photo,
        role: user.role,
        settings: user.settings || {}
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ======================================================
   UPDATE USER SETTINGS
====================================================== */
exports.updateSettings = async (req, res) => {
  try {
    const { notifications, privacy, preferences, security } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Initialize settings object if it doesn't exist
    if (!user.settings) {
      user.settings = {
        notifications: {
          email: true,
          push: true,
          marketing: false
        },
        privacy: {
          profileVisible: true,
          showEmail: false,
          showPhone: false
        },
        preferences: {
          theme: "light",
          language: "en",
          timezone: "UTC"
        },
        security: {
          twoFactor: false,
          sessionTimeout: 30
        }
      };
    }

    // Update settings
    if (notifications) {
      user.settings.notifications = {
        ...user.settings.notifications,
        ...notifications
      };
    }
    if (privacy) {
      user.settings.privacy = {
        ...user.settings.privacy,
        ...privacy
      };
    }
    if (preferences) {
      user.settings.preferences = {
        ...user.settings.preferences,
        ...preferences
      };
    }
    if (security) {
      user.settings.security = {
        ...user.settings.security,
        ...security
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      settings: user.settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ======================================================
   CHANGE PASSWORD
====================================================== */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ======================================================
   DELETE MY PROFILE (ACCOUNT DELETE)
====================================================== */
exports.deleteMyProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Account deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};