const mongoose = require('mongoose');
const { Schema } = mongoose;

const receiptSchema = new Schema({
  mentor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessions: [{
    type: Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  payoutDetails: {
    totalSessions: {
      type: Number,
      required: true
    },
    totalDuration: {
      type: Number,
      required: true
    },
    basePayout: {
      type: Number,
      required: true
    },
    platformFee: {
      type: Number,
      required: true
    },
    taxes: {
      type: Number,
      required: true
    },
    finalPayout: {
      type: Number,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid'],
    default: 'draft'
  },
  paymentReference: String,
  paymentDate: Date,
  receiptNumber: {
    type: String,
    required: true,
    unique: true
  },
  customMessage: String
}, {
  timestamps: true
});

// Generate receipt number before saving
receiptSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // Get the count of receipts for the current month
    const count = await mongoose.model('Receipt').countDocuments({
      createdAt: {
        $gte: new Date(date.getFullYear(), date.getMonth(), 1),
        $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1)
      }
    });

    // Format: RCP-YY-MM-XXXX (e.g., RCP-23-05-0001)
    this.receiptNumber = `RCP-${year}-${month}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

const Receipt = mongoose.model('Receipt', receiptSchema);

module.exports = Receipt; 