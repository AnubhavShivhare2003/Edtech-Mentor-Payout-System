const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'mentor'],
    required: true
  },
  hourlyRate: {
    type: Number,
    required: function() {
      return this.role === 'mentor';
    }
  },
  taxInfo: {
    pan: {
      type: String,
      // required: function() {
      //   return this.role === 'mentor';
      // }
    },
    gst: String
  },
  bankDetails: {
    accountNumber: {
      type: String,
      // required: function() {
      //   return this.role === 'mentor';
      // }
    },
    ifsc: {
      type: String,
      // required: function() {
      //   return this.role === 'mentor';
      // }
    },
    bankName: {
      type: String,
      // required: function() {
      //   return this.role === 'mentor';
      // }
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  settings: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    language: {
      type: String,
      enum: ['en', 'hi'],
      default: 'en'
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (exclude sensitive data)
userSchema.methods.toPublicProfile = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.bankDetails;
  return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 