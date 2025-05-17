const { Router } = require('express');
const { body, query } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const chatController = require('../controllers/chat.controller');
const multer = require('multer');

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads/chat',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Validation middleware
const messageValidation = [
  body('to').isMongoId(),
  body('message').notEmpty(),
  body('attachments').optional().isArray()
];

const conversationValidation = [
  query('with').isMongoId(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('before').optional().isISO8601()
];

// Routes
router.post('/messages', authenticate, messageValidation, chatController.sendMessage);
router.post('/messages/attachment', authenticate, upload.single('file'), chatController.uploadAttachment);
router.get('/messages', authenticate, conversationValidation, chatController.getMessages);
router.get('/conversations', authenticate, chatController.getConversations);
router.post('/messages/:id/read', authenticate, chatController.markMessageAsRead);
router.delete('/messages/:id', authenticate, chatController.deleteMessage);

// Real-time status routes
router.get('/status', authenticate, chatController.getUserStatus);
router.post('/status/typing', authenticate, [
  body('to').isMongoId()
], chatController.sendTypingStatus);

module.exports = router; 