const express = require('express');
const { body, query } = require('express-validator');
const receiptController = require('../controllers/receipt.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// Validation middleware
const generateReceiptValidation = [
  body('mentorId').isMongoId().withMessage('Invalid mentor ID'),
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('endDate').isISO8601().withMessage('Invalid end date'),
  body('notes').optional().isString().withMessage('Notes must be a string')
];

const updateStatusValidation = [
  body('status').isIn(['pending', 'paid', 'cancelled']).withMessage('Invalid status'),
  body('paymentDate').optional().isISO8601().withMessage('Invalid payment date'),
  body('paymentMethod').optional().isString().withMessage('Payment method must be a string')
];

const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('mentorId').optional().isMongoId().withMessage('Invalid mentor ID'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date')
];

// Routes
router.post(
  '/generate',
  authenticate,
  authorizeAdmin,
  generateReceiptValidation,
  validateRequest,
  receiptController.generateReceipt
);

router.get(
  '/',
  authenticate,
  queryValidation,
  validateRequest,
  receiptController.getReceiptHistory
);

router.get(
  '/:receiptId',
  authenticate,
  receiptController.getReceiptById
);

router.patch(
  '/:receiptId/status',
  authenticate,
  authorizeAdmin,
  updateStatusValidation,
  validateRequest,
  receiptController.updateReceiptStatus
);

router.get(
  '/:receiptId/audit',
  authenticate,
  receiptController.getAuditLogs
);

module.exports = router; 