const Session = require('../models/session.model');
const User = require('../models/user.model');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

const sessionController = {
  // Create new session
  createSession: async (req, res) => {
    try {
      const mentor = await User.findById(req.user.id);
      if (!mentor) {
        return res.status(404).json({
          message: 'Mentor not found'
        });
      }

      // Calculate duration in minutes
      const startTime = new Date(req.body.startTime);
      const endTime = new Date(req.body.endTime);
      const duration = Math.round((endTime - startTime) / (1000 * 60));

      const session = new Session({
        ...req.body,
        mentor: req.user.id,
        duration,
        baseRate: mentor.hourlyRate,
        attachments: req.files?.map(file => ({
          filename: file.filename,
          path: file.path,
          uploadedAt: new Date()
        })) || []
      });

      await session.save();

      res.status(201).json({
        message: 'Session created successfully',
        session
      });
    } catch (error) {
      logger.error('Create session error:', error);
      res.status(500).json({
        message: 'Error creating session'
      });
    }
  },

  // Get sessions with filters and pagination
  getSessions: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        sessionType,
        startDate,
        endDate
      } = req.query;

      const query = {};

      // Apply filters based on user role
      if (req.user.role === 'mentor') {
        query.mentor = req.user.id;
      } else if (req.query.mentor) {
        query.mentor = req.query.mentor;
      }

      if (status) query.status = status;
      if (sessionType) query.sessionType = sessionType;
      if (startDate || endDate) {
        query.startTime = {};
        if (startDate) query.startTime.$gte = new Date(startDate);
        if (endDate) query.startTime.$lte = new Date(endDate);
      }

      const sessions = await Session.find(query)
        .populate('mentor', 'name email')
        .populate('approvedBy', 'name')
        .sort({ startTime: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await Session.countDocuments(query);

      res.json({
        sessions,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Get sessions error:', error);
      res.status(500).json({
        message: 'Error fetching sessions'
      });
    }
  },

  // Get session statistics
  getSessionStats: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const query = {};

      if (startDate || endDate) {
        query.startTime = {};
        if (startDate) query.startTime.$gte = new Date(startDate);
        if (endDate) query.startTime.$lte = new Date(endDate);
      }

      const stats = await Session.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalDuration: { $sum: '$duration' },
            totalPayout: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'approved'] },
                  { $ifNull: ['$payoutDetails.finalPayout', 0] },
                  0
                ]
              }
            }
          }
        }
      ]);

      res.json({ stats });
    } catch (error) {
      logger.error('Get session stats error:', error);
      res.status(500).json({
        message: 'Error fetching session statistics'
      });
    }
  },

  // Get session by ID
  getSessionById: async (req, res) => {
    try {
      const session = await Session.findById(req.params.id)
        .populate('mentor', 'name email')
        .populate('approvedBy', 'name');

      if (!session) {
        return res.status(404).json({
          message: 'Session not found'
        });
      }

      // Check access rights
      if (req.user.role === 'mentor' && session.mentor._id.toString() !== req.user.id) {
        return res.status(403).json({
          message: 'Access denied'
        });
      }

      res.json({ session });
    } catch (error) {
      logger.error('Get session by ID error:', error);
      res.status(500).json({
        message: 'Error fetching session'
      });
    }
  },

  // Update session
  updateSession: async (req, res) => {
    try {
      const session = await Session.findById(req.params.id);
      if (!session) {
        return res.status(404).json({
          message: 'Session not found'
        });
      }

      // Check ownership and editability
      if (session.mentor.toString() !== req.user.id || !session.canEdit()) {
        return res.status(403).json({
          message: 'Cannot edit this session'
        });
      }

      // Calculate new duration if times are updated
      if (req.body.startTime && req.body.endTime) {
        const startTime = new Date(req.body.startTime);
        const endTime = new Date(req.body.endTime);
        req.body.duration = Math.round((endTime - startTime) / (1000 * 60));
      }

      // Add new attachments if any
      if (req.files?.length) {
        const newAttachments = req.files.map(file => ({
          filename: file.filename,
          path: file.path,
          uploadedAt: new Date()
        }));
        session.attachments.push(...newAttachments);
      }

      // Update fields
      Object.assign(session, req.body);
      await session.save();

      res.json({
        message: 'Session updated successfully',
        session
      });
    } catch (error) {
      logger.error('Update session error:', error);
      res.status(500).json({
        message: 'Error updating session'
      });
    }
  },

  // Delete session
  deleteSession: async (req, res) => {
    try {
      const session = await Session.findById(req.params.id);
      if (!session) {
        return res.status(404).json({
          message: 'Session not found'
        });
      }

      // Check ownership and status
      if (session.mentor.toString() !== req.user.id || !session.canEdit()) {
        return res.status(403).json({
          message: 'Cannot delete this session'
        });
      }

      // Delete attachments
      for (const attachment of session.attachments) {
        await fs.unlink(attachment.path).catch(err => 
          logger.error(`Error deleting file ${attachment.path}:`, err)
        );
      }

      await session.deleteOne();

      res.json({
        message: 'Session deleted successfully'
      });
    } catch (error) {
      logger.error('Delete session error:', error);
      res.status(500).json({
        message: 'Error deleting session'
      });
    }
  },

  // Approve session
  approveSession: async (req, res) => {
    try {
      const session = await Session.findById(req.params.id);
      if (!session) {
        return res.status(404).json({
          message: 'Session not found'
        });
      }

      if (session.status !== 'pending') {
        return res.status(400).json({
          message: 'Session cannot be approved'
        });
      }

      session.status = 'approved';
      session.approvedBy = req.user.id;
      await session.save();

      res.json({
        message: 'Session approved successfully',
        session
      });
    } catch (error) {
      logger.error('Approve session error:', error);
      res.status(500).json({
        message: 'Error approving session'
      });
    }
  },

  // Reject session
  rejectSession: async (req, res) => {
    try {
      const session = await Session.findById(req.params.id);
      if (!session) {
        return res.status(404).json({
          message: 'Session not found'
        });
      }

      if (session.status !== 'pending') {
        return res.status(400).json({
          message: 'Session cannot be rejected'
        });
      }

      session.status = 'rejected';
      session.rejectionReason = req.body.rejectionReason;
      await session.save();

      res.json({
        message: 'Session rejected successfully',
        session
      });
    } catch (error) {
      logger.error('Reject session error:', error);
      res.status(500).json({
        message: 'Error rejecting session'
      });
    }
  },

  // Delete attachment
  deleteAttachment: async (req, res) => {
    try {
      const session = await Session.findById(req.params.id);
      if (!session) {
        return res.status(404).json({
          message: 'Session not found'
        });
      }

      // Check ownership and editability
      if (session.mentor.toString() !== req.user.id || !session.canEdit()) {
        return res.status(403).json({
          message: 'Cannot modify this session'
        });
      }

      const attachmentIndex = session.attachments.findIndex(
        a => a._id.toString() === req.params.attachmentId
      );

      if (attachmentIndex === -1) {
        return res.status(404).json({
          message: 'Attachment not found'
        });
      }

      // Delete file
      const attachment = session.attachments[attachmentIndex];
      await fs.unlink(attachment.path).catch(err => 
        logger.error(`Error deleting file ${attachment.path}:`, err)
      );

      // Remove from session
      session.attachments.splice(attachmentIndex, 1);
      await session.save();

      res.json({
        message: 'Attachment deleted successfully',
        session
      });
    } catch (error) {
      logger.error('Delete attachment error:', error);
      res.status(500).json({
        message: 'Error deleting attachment'
      });
    }
  }
};

module.exports = sessionController; 