const mongoose = require('mongoose');
const { Schema } = mongoose;

const chatSchema = new Schema({
  from: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  attachments: [String],
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create compound index for efficient querying of conversations
chatSchema.index({ from: 1, to: 1, createdAt: -1 });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat; 