const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  payoutNumber: {
    type: String,
    required: true,
    unique: true
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receipts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Receipt'
  }],
  period: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  amount: {
    subtotal: {
      type: Number,
      required: true
    },
    platformFee: {
      type: Number,
      required: true
    },
    taxAmount: {
      type: Number,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentDetails: {
    method: {
      type: String,
      enum: ['bank_transfer', 'paypal', 'stripe', 'other'],
      required: true
    },
    accountDetails: {
      type: Map,
      of: String
    },
    transactionId: String,
    paymentDate: Date
  },
  notes: String,
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  auditLog: [{
    action: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String
  }]
}, {
  timestamps: true
});

// Generate payout number
payoutSchema.pre('save', async function(next) {
  if (!this.payoutNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await this.constructor.countDocuments();
    this.payoutNumber = `PAY-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Calculate total amount before saving
payoutSchema.pre('save', function(next) {
  if (this.isModified('amount.subtotal') || this.isModified('amount.platformFee') || this.isModified('amount.taxAmount')) {
    this.amount.totalAmount = this.amount.subtotal - this.amount.platformFee - this.amount.taxAmount;
  }
  next();
});

// Add audit log entry
payoutSchema.methods.addAuditLog = function(action, performedBy, details) {
  this.auditLog.push({
    action,
    performedBy,
    details,
    timestamp: new Date()
  });
  return this.save();
};

module.exports = mongoose.model('Payout', payoutSchema); 