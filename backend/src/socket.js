const logger = require('./utils/logger');
const User = require('./models/user.model');

const setupSocketHandlers = (io) => {
  // Store active users
  const activeUsers = new Map();

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Handle user authentication
    socket.on('authenticate', async (token) => {
      try {
        const user = await User.findById(token.userId);
        if (!user) {
          socket.emit('auth_error', 'User not found');
          return;
        }

        // Store user info
        activeUsers.set(socket.id, {
          userId: user._id,
          role: user.role,
          name: user.name
        });

        // Join user-specific room
        socket.join(`user_${user._id}`);
        socket.emit('authenticated');

        // Notify admins about mentor connection if user is mentor
        if (user.role === 'mentor') {
          io.to('admin_room').emit('mentor_online', {
            userId: user._id,
            name: user.name
          });
        }

        // Join admin room if user is admin
        if (user.role === 'admin') {
          socket.join('admin_room');
        }
      } catch (error) {
        logger.error('Socket authentication error:', error);
        socket.emit('auth_error', 'Authentication failed');
      }
    });

    // Handle private messages
    socket.on('private_message', async (data) => {
      try {
        const sender = activeUsers.get(socket.id);
        if (!sender) {
          socket.emit('error', 'Not authenticated');
          return;
        }

        // Save message to database if needed
        // Emit to recipient
        io.to(`user_${data.to}`).emit('private_message', {
          from: sender.userId,
          message: data.message,
          timestamp: new Date()
        });
      } catch (error) {
        logger.error('Private message error:', error);
        socket.emit('error', 'Failed to send message');
      }
    });

    // Handle typing status
    socket.on('typing', (data) => {
      const sender = activeUsers.get(socket.id);
      if (sender) {
        io.to(`user_${data.to}`).emit('typing', {
          userId: sender.userId,
          isTyping: data.isTyping
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const user = activeUsers.get(socket.id);
      if (user) {
        // Notify admins about mentor disconnection if user was mentor
        if (user.role === 'mentor') {
          io.to('admin_room').emit('mentor_offline', {
            userId: user.userId,
            name: user.name
          });
        }
        activeUsers.delete(socket.id);
      }
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  // Utility function to get online users
  const getOnlineUsers = () => {
    return Array.from(activeUsers.values());
  };

  return {
    getOnlineUsers
  };
};

module.exports = {
  setupSocketHandlers
}; 