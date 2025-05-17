const Chat = require('../models/chat.model');
const User = require('../models/user.model');
const logger = require('../utils/logger');

const chatController = {
  // Send a message
  sendMessage: async (req, res) => {
    try {
      const { to, message, attachments } = req.body;
      const from = req.user.id;

      const chat = new Chat({
        from,
        to,
        message,
        attachments
      });

      await chat.save();

      // Emit socket event if socket.io is set up
      if (req.app.get('io')) {
        req.app.get('io').to(to).emit('new-message', {
          id: chat._id,
          from,
          message,
          attachments,
          createdAt: chat.createdAt
        });
      }

      res.status(201).json({
        message: 'Message sent successfully',
        chat
      });
    } catch (error) {
      logger.error('Send message error:', error);
      res.status(500).json({
        message: 'Error sending message'
      });
    }
  },

  // Upload attachment
  uploadAttachment: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: 'No file uploaded'
        });
      }

      res.json({
        message: 'File uploaded successfully',
        filename: req.file.filename,
        path: req.file.path
      });
    } catch (error) {
      logger.error('Upload attachment error:', error);
      res.status(500).json({
        message: 'Error uploading file'
      });
    }
  },

  // Get messages for a conversation
  getMessages: async (req, res) => {
    try {
      const { with: otherUser, limit = 50, before } = req.query;
      const userId = req.user.id;

      const query = {
        $or: [
          { from: userId, to: otherUser },
          { from: otherUser, to: userId }
        ]
      };

      if (before) {
        query.createdAt = { $lt: new Date(before) };
      }

      const messages = await Chat.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .populate('from', 'name email')
        .populate('to', 'name email');

      res.json(messages);
    } catch (error) {
      logger.error('Get messages error:', error);
      res.status(500).json({
        message: 'Error fetching messages'
      });
    }
  },

  // Get all conversations
  getConversations: async (req, res) => {
    try {
      const userId = req.user.id;

      // Get the latest message for each unique conversation partner
      const conversations = await Chat.aggregate([
        {
          $match: {
            $or: [{ from: userId }, { to: userId }]
          }
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: ['$from', userId] },
                '$to',
                '$from'
              ]
            },
            lastMessage: { $first: '$$ROOT' },
            unreadCount: {
              $sum: {
                $cond: [
                  { $and: [
                    { $eq: ['$to', userId] },
                    { $eq: ['$read', false] }
                  ]},
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      // Populate user details for each conversation
      const populatedConversations = await User.populate(conversations, {
        path: '_id',
        select: 'name email role'
      });

      res.json(populatedConversations);
    } catch (error) {
      logger.error('Get conversations error:', error);
      res.status(500).json({
        message: 'Error fetching conversations'
      });
    }
  },

  // Mark message as read
  markMessageAsRead: async (req, res) => {
    try {
      const messageId = req.params.id;
      const userId = req.user.id;

      const message = await Chat.findOneAndUpdate(
        { _id: messageId, to: userId, read: false },
        { read: true },
        { new: true }
      );

      if (!message) {
        return res.status(404).json({
          message: 'Message not found or already read'
        });
      }

      // Emit socket event if socket.io is set up
      if (req.app.get('io')) {
        req.app.get('io').to(message.from.toString()).emit('message-read', messageId);
      }

      res.json({
        message: 'Message marked as read',
        messageId
      });
    } catch (error) {
      logger.error('Mark message as read error:', error);
      res.status(500).json({
        message: 'Error marking message as read'
      });
    }
  },

  // Delete message
  deleteMessage: async (req, res) => {
    try {
      const messageId = req.params.id;
      const userId = req.user.id;

      const message = await Chat.findOneAndDelete({
        _id: messageId,
        from: userId
      });

      if (!message) {
        return res.status(404).json({
          message: 'Message not found or unauthorized'
        });
      }

      res.json({
        message: 'Message deleted successfully',
        messageId
      });
    } catch (error) {
      logger.error('Delete message error:', error);
      res.status(500).json({
        message: 'Error deleting message'
      });
    }
  },

  // Get user status
  getUserStatus: async (req, res) => {
    try {
      // This would typically be managed by your socket.io implementation
      // For now, return a simple online status
      res.json({
        status: 'online'
      });
    } catch (error) {
      logger.error('Get user status error:', error);
      res.status(500).json({
        message: 'Error getting user status'
      });
    }
  },

  // Send typing status
  sendTypingStatus: async (req, res) => {
    try {
      const { to } = req.body;
      const from = req.user.id;

      // Emit socket event if socket.io is set up
      if (req.app.get('io')) {
        req.app.get('io').to(to).emit('typing-status', {
          userId: from,
          isTyping: true
        });
      }

      res.json({
        message: 'Typing status sent'
      });
    } catch (error) {
      logger.error('Send typing status error:', error);
      res.status(500).json({
        message: 'Error sending typing status'
      });
    }
  }
};

module.exports = chatController; 