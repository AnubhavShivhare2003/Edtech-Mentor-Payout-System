const { Router } = require('express');
const authRoutes = require('./auth.routes');
const sessionRoutes = require('./session.routes');
const payoutRoutes = require('./payout.routes');
const chatRoutes = require('./chat.routes');
const userRoutes = require('./user.routes');
const { authenticate } = require('../middleware/auth');

const router = Router();

// Public routes
router.use('/auth', authRoutes);

// Protected routes
router.use('/sessions', authenticate, sessionRoutes);
router.use('/payouts', authenticate, payoutRoutes);
router.use('/chat', authenticate, chatRoutes);
router.use('/users', authenticate, userRoutes);

module.exports = router; 