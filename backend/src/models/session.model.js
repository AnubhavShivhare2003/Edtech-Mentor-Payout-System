const mongoose = require('mongoose');
const { Schema } = mongoose;

const sessionSchema = new Schema({
  mentor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionType: {
    type: String,
    enum: ['live', 'evaluation', 'recording_review'],
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  baseRate: {
    type: Number,
    required: true
  },
  adjustedRate: {
    type: Number
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  },
  attachments: [{
    filename: String,
    path: String,
    uploadedAt: Date
  }],
  payoutDetails: {
    basePayout: Number,
    taxes: Number,
    platformFee: Number,
    finalPayout: Number
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  paidAt: Date,
  paymentReference: String
}, {
  timestamps: true
});

// Calculate payout details before saving
sessionSchema.pre('save', async function(next) {
  if (this.isModified('status') && this.status === 'approved') {
    const rate = this.adjustedRate || this.baseRate;
    const basePayout = (rate * this.duration) / 60; // Convert duration to hours
    const platformFee = basePayout * 0.1; // 10% platform fee
    const taxes = basePayout * 0.18; // 18% GST
    const finalPayout = basePayout - platformFee - taxes;

    this.payoutDetails = {
      basePayout,
      taxes,
      platformFee,
      finalPayout
    };

    this.approvedAt = new Date();
  }
  next();
});

// Virtual for total amount
sessionSchema.virtual('totalAmount').get(function() {
  if (!this.payoutDetails) return 0;
  return this.payoutDetails.finalPayout;
});

// Method to check if session can be edited
sessionSchema.methods.canEdit = function() {
  return ['pending', 'rejected'].includes(this.status);
};

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session; 