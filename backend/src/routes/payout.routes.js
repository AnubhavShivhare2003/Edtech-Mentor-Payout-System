const express = require('express');
const { body } = require('express-validator');
const payoutController = require('../controllers/payout.controller');
const { authenticate } = require('../middleware/auth');
const { authorizeAdmin } = require('../middleware/authorizeAdmin');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// Validation middleware
const calculatePayoutValidation = [
  body('mentorId').isMongoId().withMessage('Invalid mentor ID'),
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('endDate').isISO8601().withMessage('Invalid end date')
];

const generateReceiptValidation = [
  ...calculatePayoutValidation,
  body('notes').optional().isString().withMessage('Notes must be a string')
];

// Routes
router.post(
  '/calculate',
  authenticate,
  authorizeAdmin,
  calculatePayoutValidation,
  validateRequest,
  payoutController.calculatePayout
);

router.post(
  '/receipts/generate',
  authenticate,
  authorizeAdmin,
  generateReceiptValidation,
  validateRequest,
  payoutController.generateReceipt
);

router.get(
  '/receipts',
  authenticate,
  payoutController.getReceiptHistory
);

router.get(
  '/receipts/:receiptId/audit',
  authenticate,
  payoutController.getAuditLogs
);

module.exports = router; 