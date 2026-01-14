const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    // 🔐 AUTH FIELDS
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true,
      validate: {
        validator: function(v) {
          // Only validate if email is provided
          if (!v) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please provide a valid email address'
      }
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      validate: {
        validator: function (v) {
          // Only validate if phone is provided
          if (!v) return true;
          return /^[6-9]\d{9}$/.test(v);
        },
        message: 'Phone number must be a valid 10-digit Indian mobile number starting with 6-9',
      },
      set: function (v) {
        return v ? v.replace(/\D/g, '') : v;
      },
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
      minlength: [6, 'Password must be at least 6 characters'],
    },

    photo: {
      type: String,
      default: 'default-avatar.png',
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

    lastLogin: {
      type: Date,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false
    },

    emailVerificationToken: String,
    emailVerificationExpire: Date,

    // Reset password fields
    resetPasswordOTP: {
      type: String,
      select: false,
    },
    
    resetPasswordOTPExpiry: {
      type: Date,
      select: false,
    },
    
    resetPasswordToken: {
      type: String,
      select: false,
    },
    
    resetPasswordTokenExpiry: {
      type: Date,
      select: false,
    }
  },
  {
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.password;
        delete ret.resetPasswordOTP;
        delete ret.resetPasswordOTPExpiry;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordTokenExpiry;
        return ret;
      }
    }
  }
);

/* =========================
   🔐 PASSWORD HASH - Only hash when password is modified
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
  return bcrypt.compare(enteredPassword, this.password);
};

/* =========================
   ✅ CREATE DEFAULT ADMIN
========================= */
UserSchema.statics.createDefaultAdmin = async function() {
  try {
    const adminEmail = 'mkchauhan9263@gmail.com';
    const adminExists = await this.findOne({ 
      email: adminEmail, 
      role: 'admin' 
    });
    
    if (!adminExists) {
      // Hash the password manually for default admin
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Mkchauhan@9263', salt);
      
      const adminData = {
        name: 'System Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        phone: '',
        isActive: true,
        status: 'active'
      };
      
      await this.create(adminData);
      console.log('✅ Default admin created successfully');
    } else {
      console.log('✅ Default admin already exists');
    }
  } catch (error) {
    console.error('❌ Failed to create default admin:', error.message);
  }
};

module.exports = mongoose.model('User', UserSchema);