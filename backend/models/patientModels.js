const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },

    patientCode: {
      type: String,
      unique: true,
      uppercase: true,
      default: null // only admin-created patients will generate code
    },

    dateOfBirth: {
      type: Date,
      required: true
    },

    age: {
      type: Number,
      min: 0,
      max: 120
    },

    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
      lowercase: true
    },

    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Not Specified'],
      default: 'Not Specified'
    },

    allergies: {
      type: [String],
      default: []
    },

    medicalHistory: {
      type: [String],
      default: []
    },

    medicalRecords: [
      {
        recordType: {
          type: String,
          enum: ['consultation', 'diagnosis', 'prescription', 'lab_report', 'other']
        },
        title: String,
        description: String,
        date: { type: Date, default: Date.now },
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        fileUrl: String,
        notes: String
      }
    ],

    phone: String,
    email: String,

    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    },

    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'India' }
    },

    occupation: String,
    maritalStatus: { type: String, default: '' },
    status: {
      type: String,
      enum: ['active', 'inactive', 'critical', 'deceased'],
      default: 'active'
    },
    photo: String,
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// calculate age
patientSchema.pre('save', function () {
  if (this.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    this.age = age;
  }
});

module.exports = mongoose.model('Patient', patientSchema);
