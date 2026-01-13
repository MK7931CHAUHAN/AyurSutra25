// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const UserSchema = new mongoose.Schema(
//   {
//     // 🔐 AUTH FIELDS
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     email: {
//       type: String,
//       lowercase: true,
//       trim: true,
//       unique: true,
//       sparse: true,
//     },

//     phone: {
//       type: String,
//       unique: true,
//       sparse: true,
//       trim: true,
//       validate: {
//         validator: function (v) {
//           // Validate phone only for patients
//           if (this.role === 'patient' && v) {
//             return /^[6-9]\d{9}$/.test(v);
//           }
//           return true;
//         },
//         message:
//           'Phone number must be a valid 10-digit Indian mobile number starting with 6-9',
//       },
//       set: function (v) {
//         return v ? v.replace(/\D/g, '') : v;
//       },
//     },

//     password: {
//       type: String,
//       required: true,
//       select: false,
//     },

//     photo: {
//       type: String,
//       default: '',
//     },

//     role: {
//       type: String,
//       enum: ['admin', 'doctor', 'therapist', 'patient'],
//       default: 'patient',
//       required: true,
//     },

//     // 🔗 PATIENT PROFILE LINK
//     patientProfile: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Patient',
//       sparse: true,
//     },

//     status: {
//       type: String,
//       enum: ['active', 'inactive', 'suspended'],
//       default: 'active',
//     },

//     lastLogin: {
//       type: Date,
//     },

//     isActive: {
//       type: Boolean,
//       default: true,
//     },

//     resetPasswordToken: String,
//     resetPasswordExpire: Date,
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// );

// /* =========================
//    🔐 PASSWORD HASH
// ========================= */
// UserSchema.pre('save', async function () {
//   if (!this.isModified('password')) return;

//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });

// /* =========================
//    🔑 PASSWORD MATCH
// ========================= */
// UserSchema.methods.comparePassword = async function (enteredPassword) {
//   return bcrypt.compare(enteredPassword, this.password);
// };

// /* =========================
//    🚫 REMOVE PASSWORD FROM JSON
// ========================= */
// UserSchema.set('toJSON', {
//   transform: function (doc, ret) {
//     delete ret.password;
//     return ret;
//   },
// });

// module.exports = mongoose.model('User', UserSchema);


// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    // 🔐 AUTH FIELDS
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      validate: {
        validator: function (v) {
          // Validate phone only for patients
          if (this.role === 'patient' && v) {
            return /^[6-9]\d{9}$/.test(v);
          }
          return true;
        },
        message:
          'Phone number must be a valid 10-digit Indian mobile number starting with 6-9',
      },
      set: function (v) {
        return v ? v.replace(/\D/g, '') : v;
      },
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    photo: {
      type: String,
      default: '',
    },

    role: {
      type: String,
      enum: ['admin', 'doctor', 'therapist', 'patient'],
      default: 'patient',
      required: true,
    },

    // 🔗 PATIENT PROFILE LINK
    patientProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      sparse: true,
    },

    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },

    // Email verification fields
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // OTP fields
    resetPasswordOTP: String,
    resetPasswordOTPExpire: Date,
    otpAttempts: {
      type: Number,
      default: 0
    },
    otpLastAttempt: Date,

    // Password reset token fields
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    resetToken: String,
    resetTokenExpiry: Date,

    // Security fields
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: Date,
    
    lastLogin: {
      type: Date,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* =========================
   🔐 PASSWORD HASH
========================= */
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/* =========================
   🔑 PASSWORD MATCH
========================= */
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/* =========================
   🔒 ACCOUNT LOCK CHECK
========================= */
UserSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

/* =========================
   🚫 REMOVE PASSWORD FROM JSON
========================= */
UserSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.resetPasswordOTP;
    delete ret.emailVerificationToken;
    delete ret.resetPasswordToken;
    delete ret.resetToken;
    return ret;
  },
});

module.exports = mongoose.model('User', UserSchema);