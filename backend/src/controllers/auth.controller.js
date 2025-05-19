const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const logger = require('../utils/logger');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { email } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          message: 'User already exists with this email'
        });
      }

      // Create new user
      const user = new User(req.body);
      await user.save();

      // Generate token
      const token = generateToken(user);

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: user.toPublicProfile()
      });
    } catch (error) {
      console.error('User save error:', error);
      logger.error('Registration error:', error);
      res.status(500).json({
        message: 'Error registering user'
      });
    }
  },

  // Create admin user (admin only)
  createAdmin: async (req, res) => {
    try {
      const { email } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          message: 'User already exists with this email'
        });
      }

      // Create new admin user
      const user = new User({
        ...req.body,
        role: 'admin',
        status: 'active'
      });
      await user.save();

      // Generate token
      const token = generateToken(user);

      res.status(201).json({
        message: 'Admin user created successfully',
        token,
        user: user.toPublicProfile()
      });
    } catch (error) {
      console.error('Admin user creation error:', error);
      logger.error('Admin creation error:', error);
      res.status(500).json({
        message: 'Error creating admin user'
      });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          message: 'Invalid email or password'
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          message: 'Invalid email or password'
        });
      }

      // Check if user is active
      if (user.status !== 'active') {
        return res.status(401).json({
          message: 'Your account is not active. Please contact support.'
        });
      }

      // Generate token
      const token = generateToken(user);

      res.json({
        message: 'Login successful',
        token,
        user: user.toPublicProfile()
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        message: 'Error during login'
      });
    }
  },

  // Logout user
  logout: async (req, res) => {
    try {
      // In a real application, you might want to invalidate the token
      // For now, we'll just send a success response
      res.json({
        message: 'Logout successful'
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        message: 'Error during logout'
      });
    }
  },

  // Get current user
  getCurrentUser: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      res.json({
        user: user.toPublicProfile()
      });
    } catch (error) {
      logger.error('Get current user error:', error);
      res.status(500).json({
        message: 'Error fetching user data'
      });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const updates = req.body;
      
      // Prevent updating sensitive fields
      delete updates.password;
      delete updates.role;
      delete updates.email;

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      res.json({
        message: 'Profile updated successfully',
        user: user.toPublicProfile()
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({
        message: 'Error updating profile'
      });
    }
  }
};

module.exports = authController; 