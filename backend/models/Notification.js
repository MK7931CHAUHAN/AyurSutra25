const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'patient_created',
      'doctor_created', 
      'therapy_created',
      'appointment_created',
      'appointment_updated',
      'appointment_cancelled',
      'system_alert',
      'profile_update',
      'password_changed'
    ]
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  // User who triggered the notification
  triggeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Users who should see this notification
  recipients: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'doctor', 'therapist', 'patient']
    },
    read: {
      type: Boolean,
      default: false
    },
    readAt: Date
  }],
  // Reference to related entity
  relatedTo: {
    model: {
      type: String,
      enum: ['Patient', 'Doctor', 'Therapy', 'Appointment', 'User']
    },
    id: mongoose.Schema.Types.ObjectId
  },
  // Role-based visibility
  visibleToRoles: [{
    type: String,
    enum: ['admin', 'doctor', 'therapist', 'patient']
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  icon: String,
  actionLink: String,
  isReadByAll: {
    type: Boolean,
    default: false
  },
  expiresAt: Date
}, {
  timestamps: true
});

// Index for better performance
notificationSchema.index({ 'recipients.user': 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);