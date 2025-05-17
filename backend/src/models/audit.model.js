const mongoose = require('mongoose');
const { Schema } = mongoose;

const auditSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  entityType: {
    type: String,
    enum: ['session', 'receipt', 'user', 'payout'],
    required: true
  },
  entityId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  changes: [{
    field: {
      type: String,
      required: true
    },
    oldValue: Schema.Types.Mixed,
    newValue: Schema.Types.Mixed
  }],
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Create indexes for efficient querying
auditSchema.index({ entityType: 1, entityId: 1 });
auditSchema.index({ user: 1, createdAt: -1 });

const Audit = mongoose.model('Audit', auditSchema);

// Helper function to create audit logs
const createAuditLog = async (user, action, entityType, entityId, changes, req) => {
  try {
    await Audit.create({
      user,
      action,
      entityType,
      entityId,
      changes,
      ipAddress: req?.ip,
      userAgent: req?.headers?.['user-agent']
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

module.exports = {
  Audit,
  createAuditLog
}; 