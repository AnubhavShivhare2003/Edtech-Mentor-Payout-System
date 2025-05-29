const express = require('express');
const { body } = require('express-validator');
const payoutController = require('../controllers/payout.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const generateReceipt = require('../controllers/receipt.controller');

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

const createPayoutValidation = [
  body('mentorId').isMongoId().withMessage('Invalid mentor ID'),
  body('receipts').isArray().withMessage('Receipts must be an array'),
  body('receipts.*').isMongoId().withMessage('Invalid receipt ID'),
  body('period.startDate').isISO8601().withMessage('Invalid start date'),
  body('period.endDate').isISO8601().withMessage('Invalid end date'),
  body('amount.subtotal').isNumeric().withMessage('Subtotal must be a number'),
  body('amount.platformFee').isNumeric().withMessage('Platform fee must be a number'),
  body('amount.taxAmount').isNumeric().withMessage('Tax amount must be a number'),
  body('paymentDetails.method').isIn(['bank_transfer', 'paypal', 'stripe', 'other']).withMessage('Invalid payment method'),
  body('notes').optional().isString().withMessage('Notes must be a string')
];

const updatePayoutStatusValidation = [
  body('status').isIn(['pending', 'processing', 'completed', 'failed', 'cancelled']).withMessage('Invalid status'),
  body('paymentDetails.transactionId').optional().isString().withMessage('Transaction ID must be a string'),
  body('paymentDetails.paymentDate').optional().isISO8601().withMessage('Invalid payment date')
];

// Payout Routes
router.post(
  '/calculate',
  authenticate,
  authorizeAdmin,
  calculatePayoutValidation,
  validateRequest,
  payoutController.calculatePayout
);

router.post(
  '/',
  authenticate,
  authorizeAdmin,
  createPayoutValidation,
  validateRequest,
  payoutController.createPayout
);

router.get(
  '/',
  authenticate,
  payoutController.getAllPayouts
);

router.get(
  '/mentor/:mentorId',
  authenticate,
  payoutController.getMentorPayouts
);

router.get(
  '/:payoutId',
  authenticate,
  payoutController.getPayoutById
);

router.patch(
  '/:payoutId/status',
  authenticate,
  authorizeAdmin,
  updatePayoutStatusValidation,
  validateRequest,
  payoutController.updatePayoutStatus
);

// Receipt Routes
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