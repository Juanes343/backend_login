const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    default: 'login'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    default: 'unknown'
  },
  userAgent: {
    type: String,
    default: 'unknown'
  },
  success: {
    type: Boolean,
    required: true,
    default: true
  },
  details: {
    type: String,
    default: ''
  }
}, {
  timestamps: true // Esto agrega createdAt y updatedAt automáticamente
});

// Índice para mejorar las consultas por usuario y fecha
logSchema.index({ userId: 1, timestamp: -1 });
logSchema.index({ userEmail: 1, timestamp: -1 });
logSchema.index({ timestamp: -1 });

const Log = mongoose.model('Log', logSchema);

module.exports = Log;