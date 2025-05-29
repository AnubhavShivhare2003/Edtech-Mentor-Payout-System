const Receipt = require('../models/receipt.model');
const Session = require('../models/session.model');
const User = require('../models/user.model');
const { calculatePlatformFee, calculateTax } = require('../utils/payment.utils');

// Generate receipt for a mentor's sessions
exports.generateReceipt = async (req, res) => {
  try {
    const { mentorId, startDate, endDate, notes } = req.body;

    // Find all sessions for the mentor within the date range
    const sessions = await Session.find({
      mentor: mentorId,
      startTime: { $gte: new Date(startDate) },
      endTime: { $lte: new Date(endDate) },
      status: 'completed'
    });

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No completed sessions found for the specified period',
        data: null
      });
    }

    // Calculate total earnings
    const subtotal = sessions.reduce((total, session) => total + session.amount, 0);
    const platformFee = calculatePlatformFee(subtotal);
    const taxAmount = calculateTax(subtotal - platformFee);
    const totalAmount = subtotal - platformFee - taxAmount;

    // Create receipt
    const receipt = new Receipt({
      mentor: mentorId,
      sessions: sessions.map(session => session._id),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      payoutDetails: {
        subtotal,
        platformFee,
        taxAmount,
        totalAmount,
        currency: 'USD'
      },
      notes
    });

    // Add audit log entry
    await receipt.addAuditLog('receipt_created', req.user._id, 'Receipt generated for sessions');

    await receipt.save();

    res.status(201).json({
      success: true,
      message: 'Receipt generated successfully',
      data: receipt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating receipt',
      error: error.message
    });
  }
};

// Get receipt history
exports.getReceiptHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, mentorId, startDate, endDate } = req.query;
    const query = {};

    if (mentorId) query.mentor = mentorId;
    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate) };
      query.endDate = { $lte: new Date(endDate) };
    }

    const receipts = await Receipt.find(query)
      .populate('mentor', 'name email')
      .populate('sessions', 'startTime endTime amount')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Receipt.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Receipts retrieved successfully',
      data: {
        receipts,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving receipts',
      error: error.message
    });
  }
};

// Get receipt by ID
exports.getReceiptById = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.receiptId)
      .populate('mentor', 'name email')
      .populate('sessions', 'startTime endTime amount')
      .populate('auditLog.performedBy', 'name email');

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Receipt retrieved successfully',
      data: receipt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving receipt',
      error: error.message
    });
  }
};

// Update receipt status
exports.updateReceiptStatus = async (req, res) => {
  try {
    const { status, paymentDate, paymentMethod } = req.body;
    const receipt = await Receipt.findById(req.params.receiptId);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found',
        data: null
      });
    }

    receipt.status = status;
    if (paymentDate) receipt.paymentDate = new Date(paymentDate);
    if (paymentMethod) receipt.paymentMethod = paymentMethod;

    // Add audit log entry
    await receipt.addAuditLog(
      'status_updated',
      req.user._id,
      `Receipt status updated to ${status}`
    );

    await receipt.save();

    res.status(200).json({
      success: true,
      message: 'Receipt status updated successfully',
      data: receipt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating receipt status',
      error: error.message
    });
  }
};

// Get receipt audit logs
exports.getAuditLogs = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.receiptId)
      .populate('auditLog.performedBy', 'name email');

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Audit logs retrieved successfully',
      data: receipt.auditLog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving audit logs',
      error: error.message
    });
  }
}; 