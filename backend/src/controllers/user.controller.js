const User = require('../models/user.model');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

const userController = {
  // Get user profile
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      res.json(user);
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        message: 'Error fetching profile'
      });
    }
  },

  // Get all users (admin only)
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find({}, '-password');
      res.json(users);
    } catch (error) {
      logger.error('Get all users error:', error);
      res.status(500).json({
        message: 'Error fetching users'
      });
    }
  },

  // Get all mentors (admin only)
  getAllMentors: async (req, res) => {
    try {
      const mentors = await User.find({ role: 'mentor' }, '-password');
      res.json(mentors);
    } catch (error) {
      logger.error('Get all mentors error:', error);
      res.status(500).json({
        message: 'Error fetching mentors'
      });
    }
  },
  // Get mentor dashboard data
getMentorDashboard: async (req, res) => {
  try {
    const mentorId = req.params.mentorId;

    const mentor = await User.findById(mentorId).select('-password');

    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // Basic dashboard info
    const dashboardData = {
      name: mentor.name,
      email: mentor.email,
      role: mentor.role,
      hourlyRate: mentor.hourlyRate,
      status: mentor.status,
      taxInfo: mentor.taxInfo,
      bankDetails: mentor.bankDetails,
      createdAt: mentor.createdAt,
      updatedAt: mentor.updatedAt
      // Add session counts, earnings, ratings, etc. later
    };

    res.json({ dashboard: dashboardData });
  } catch (error) {
    logger.error('Error fetching mentor dashboard:', error);
    res.status(500).json({ message: 'Error fetching mentor dashboard' });
  }
},

  // Get user by ID (admin only)
  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id, '-password');
      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      res.json(user);
    } catch (error) {
      logger.error('Get user by ID error:', error);
      res.status(500).json({
        message: 'Error fetching user'
      });
    }
  },

  // Update user (admin only)
  updateUser: async (req, res) => {
    try {
      const updates = req.body;
      
      // Prevent updating sensitive fields
      delete updates.password;
      delete updates.email;

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      res.json({
        message: 'User updated successfully',
        user
      });
    } catch (error) {
      logger.error('Update user error:', error);
      res.status(500).json({
        message: 'Error updating user'
      });
    }
  },

  // Update user's own profile
  updateProfile: async (req, res) => {
    try {
      const updates = req.body;
      
      // Prevent updating sensitive fields
      delete updates.password;
      delete updates.email;
      delete updates.role;

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      res.json({
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({
        message: 'Error updating profile'
      });
    }
  },

  // Update profile picture
  updateProfilePicture: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: 'No file uploaded'
        });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      // Delete old profile picture if exists
      if (user.profilePicture) {
        try {
          await fs.unlink(path.join('uploads/profiles', user.profilePicture));
        } catch (error) {
          logger.error('Error deleting old profile picture:', error);
        }
      }

      user.profilePicture = req.file.filename;
      await user.save();

      res.json({
        message: 'Profile picture updated successfully',
        profilePicture: req.file.filename
      });
    } catch (error) {
      logger.error('Update profile picture error:', error);
      res.status(500).json({
        message: 'Error updating profile picture'
      });
    }
  },

  // Delete user (admin only)
  deleteUser: async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      // Delete profile picture if exists
      if (user.profilePicture) {
        try {
          await fs.unlink(path.join('uploads/profiles', user.profilePicture));
        } catch (error) {
          logger.error('Error deleting profile picture:', error);
        }
      }

      res.json({
        message: 'User deleted successfully'
      });
    } catch (error) {
      logger.error('Delete user error:', error);
      res.status(500).json({
        message: 'Error deleting user'
      });
    }
  },

  // Activate user (admin only)
  activateUser: async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: { isActive: true } },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      res.json({
        message: 'User activated successfully',
        user
      });
    } catch (error) {
      logger.error('Activate user error:', error);
      res.status(500).json({
        message: 'Error activating user'
      });
    }
  },

  // Deactivate user (admin only)
  deactivateUser: async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: { isActive: false } },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      res.json({
        message: 'User deactivated successfully',
        user
      });
    } catch (error) {
      logger.error('Deactivate user error:', error);
      res.status(500).json({
        message: 'Error deactivating user'
      });
    }
  },

  // Get user settings
  getSettings: async (req, res) => {
    try {
      const user = await User.findById(req.user.id, 'settings');
      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      res.json(user.settings || {});
    } catch (error) {
      logger.error('Get settings error:', error);
      res.status(500).json({
        message: 'Error fetching settings'
      });
    }
  },

  // Update user settings
  updateSettings: async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: { settings: req.body } },
        { new: true }
      ).select('settings');

      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      res.json({
        message: 'Settings updated successfully',
        settings: user.settings
      });
    } catch (error) {
      logger.error('Update settings error:', error);
      res.status(500).json({
        message: 'Error updating settings'
      });
    }
  }
};

module.exports = userController; 