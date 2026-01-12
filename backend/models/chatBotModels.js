const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    enum: ['user', 'bot'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

const conversationSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  language: {
    type: String,
    enum: ['English', 'Hindi', 'Punjabi'],
    default: 'English'
  },
  symptoms: [String],
  diagnosis: String,
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Low'
  },
  suggestedMedicines: [{
    name: String,
    dosage: String,
    description: String,
    activeIngredient: String,
    sideEffects: String,
    storage: String,
    timestamp: Date
  }],
  doctorReferred: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  followUpDate: Date,
  status: {
    type: String,
    enum: ['active', 'closed', 'referred', 'followup'],
    default: 'active'
  },
  messages: [messageSchema],
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: Date,
  voiceAssistantUsed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for faster queries
conversationSchema.index({ patientId: 1, createdAt: -1 });
conversationSchema.index({ doctorId: 1, status: 1 });
// conversationSchema.index({ sessionId: 1 });

module.exports = mongoose.model('ChatBotConversation', conversationSchema);