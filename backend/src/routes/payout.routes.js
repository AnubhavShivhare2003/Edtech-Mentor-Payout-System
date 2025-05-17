const { Router } = require('express');
const { body, query } = require('express-validator');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const payoutController = require('../controllers/payout.controller');

const router = Router();

// Validation middleware
const receiptValidation = [
  body('mentor').isMongoId(),
  body('sessions').isArray(),
  body('sessions.*').isMongoId(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('customMessage').optional().isString()
];

const dateRangeValidation = [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
];

const paymentValidation = [
  body('paymentReference').notEmpty(),
  body('paymentDate').isISO8601()
];

// Receipt routes
router.post('/receipts', authenticate, authorizeAdmin, receiptValidation, payoutController.createReceipt);
router.get('/receipts', authenticate, dateRangeValidation, payoutController.getReceipts);
router.get('/receipts/:id', authenticate, payoutController.getReceiptById);
router.put('/receipts/:id', authenticate, authorizeAdmin, receiptValidation, payoutController.updateReceipt);
router.delete('/receipts/:id', authenticate, authorizeAdmin, payoutController.deleteReceipt);
router.post('/receipts/:id/send', authenticate, authorizeAdmin, payoutController.sendReceipt);
router.get('/receipts/:id/download', authenticate, payoutController.downloadReceipt);

// Payment routes
router.post('/receipts/:id/mark-paid', authenticate, authorizeAdmin, paymentValidation, payoutController.markReceiptAsPaid);
router.get('/summary', authenticate, dateRangeValidation, payoutController.getPayoutSummary);
router.get('/pending', authenticate, authorizeAdmin, payoutController.getPendingPayouts);

// Simulation routes
router.post('/simulate', authenticate, authorizeAdmin, [
  body('mentor').isMongoId(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601()
], payoutController.simulatePayout);

module.exports = router; 