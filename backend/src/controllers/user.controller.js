const User = require('../models/user.model');
const Session = require('../models/session.model');
const Payout = require('../models/payout.model');
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
  },

  // Get mentor stats
  getMentorStats: async (req, res) => {
    try {
      const mentorId = req.params.mentorId;

      // Get mentor details
      const mentor = await User.findById(mentorId);
      if (!mentor || mentor.role !== 'mentor') {
        return res.status(404).json({ message: 'Mentor not found' });
      }

      // Get session stats
      const sessionStats = await Session.aggregate([
        { $match: { mentor: mentorId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalDuration: { $sum: '$duration' },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);

      // Get payout stats
      const payoutStats = await Payout.aggregate([
        { $match: { mentor: mentorId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);

      // Get unique students count
      const uniqueStudents = await Session.distinct('studentId', { mentor: mentorId });

      // Calculate average rating
      const sessionsWithRating = await Session.find({
        mentor: mentorId,
        rating: { $exists: true, $ne: null }
      });
      const averageRating = sessionsWithRating.length > 0
        ? sessionsWithRating.reduce((acc, session) => acc + session.rating, 0) / sessionsWithRating.length
        : 0;

      // Transform session stats
      const sessionCounts = {
        total: 0,
        completed: 0,
        scheduled: 0,
        active: 0
      };
      sessionStats.forEach(stat => {
        sessionCounts[stat._id] = stat.count;
        sessionCounts.total += stat.count;
      });

      // Transform payout stats
      const payoutAmounts = {
        total: 0,
        pending: 0,
        completed: 0
      };
      payoutStats.forEach(stat => {
        payoutAmounts[stat._id] = stat.totalAmount;
        payoutAmounts.total += stat.totalAmount;
      });

      // Compile final stats
      const stats = {
        totalSessions: sessionCounts.total,
        completedSessions: sessionCounts.completed || 0,
        scheduledSessions: sessionCounts.scheduled || 0,
        totalEarnings: payoutAmounts.total,
        pendingPayouts: payoutAmounts.pending || 0,
        completedPayouts: payoutAmounts.completed || 0,
        averageRating: Number(averageRating.toFixed(1)),
        totalStudents: uniqueStudents.length,
        activeSessions: sessionCounts.active || 0
      };

      res.json(stats);
    } catch (error) {
      logger.error('Get mentor stats error:', error);
      res.status(500).json({
        message: 'Error fetching mentor statistics'
      });
    }
  },

  // Get mentor dashboard data
  getMentorDashboard: async (req, res) => {
    try {
      const mentorId = req.params.mentorId;

      // Verify mentor exists and user has access
      const mentor = await User.findById(mentorId).select('-password');
      if (!mentor || mentor.role !== 'mentor') {
        return res.status(404).json({ message: 'Mentor not found' });
      }

      // Check if user is either the mentor themselves or an admin
      if (req.user.role !== 'admin' && req.user.id !== mentorId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Get recent sessions (last 5)
      const recentSessions = await Session.find({ mentor: mentorId })
        .sort({ startTime: -1 })
        .limit(5)
        .populate('studentId', 'name email');

      // Get recent payouts (last 5)
      const recentPayouts = await Payout.find({ mentor: mentorId })
        .sort({ createdAt: -1 })
        .limit(5);

      // Get session stats
      const sessionStats = await Session.aggregate([
        { $match: { mentor: mentorId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalDuration: { $sum: '$duration' },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);

      // Get payout stats
      const payoutStats = await Payout.aggregate([
        { $match: { mentor: mentorId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);

      // Get unique students count
      const uniqueStudents = await Session.distinct('studentId', { mentor: mentorId });

      // Calculate average rating
      const sessionsWithRating = await Session.find({
        mentor: mentorId,
        rating: { $exists: true, $ne: null }
      });
      const averageRating = sessionsWithRating.length > 0
        ? sessionsWithRating.reduce((acc, session) => acc + session.rating, 0) / sessionsWithRating.length
        : 0;

      // Transform session stats
      const sessionCounts = {
        total: 0,
        completed: 0,
        scheduled: 0,
        active: 0
      };
      sessionStats.forEach(stat => {
        sessionCounts[stat._id] = stat.count;
        sessionCounts.total += stat.count;
      });

      // Transform payout stats
      const payoutAmounts = {
        total: 0,
        pending: 0,
        completed: 0
      };
      payoutStats.forEach(stat => {
        payoutAmounts[stat._id] = stat.totalAmount;
        payoutAmounts.total += stat.totalAmount;
      });

      // Compile dashboard data
      const dashboardData = {
        mentor: {
          _id: mentor._id,
          name: mentor.name,
          email: mentor.email,
          hourlyRate: mentor.hourlyRate,
          status: mentor.status,
          bankDetails: mentor.bankDetails,
          taxInfo: mentor.taxInfo
        },
        stats: {
          totalSessions: sessionCounts.total,
          completedSessions: sessionCounts.completed || 0,
          scheduledSessions: sessionCounts.scheduled || 0,
          totalEarnings: payoutAmounts.total,
          pendingPayouts: payoutAmounts.pending || 0,
          completedPayouts: payoutAmounts.completed || 0,
          averageRating: Number(averageRating.toFixed(1)),
          totalStudents: uniqueStudents.length,
          activeSessions: sessionCounts.active || 0
        },
        recentSessions,
        recentPayouts
      };

      res.json(dashboardData);
    } catch (error) {
      logger.error('Get mentor dashboard error:', error);
      res.status(500).json({
        message: 'Error fetching mentor dashboard data'
      });
    }
  }
};

module.exports = userController; 