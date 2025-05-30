const Session = require('../models/session.model');
const Receipt = require('../models/receipt.model');
const User = require('../models/user.model');
const { createAuditLog } = require('../models/audit.model');
const logger = require('../utils/logger');

const payoutController = {
  // Create a new receipt
  createReceipt: async (req, res) => {
    try {
      const { mentor, sessions, startDate, endDate, customMessage } = req.body;

      // Calculate payout details
      const sessionDocs = await Session.find({ _id: { $in: sessions } });
      const totalSessions = sessionDocs.length;
      const totalDuration = sessionDocs.reduce((acc, session) => acc + session.duration, 0);
      const basePayout = sessionDocs.reduce((acc, session) => acc + session.payoutDetails.basePayout, 0);
      const platformFee = sessionDocs.reduce((acc, session) => acc + session.payoutDetails.platformFee, 0);
      const taxes = sessionDocs.reduce((acc, session) => acc + session.payoutDetails.taxes, 0);
      const finalPayout = sessionDocs.reduce((acc, session) => acc + session.payoutDetails.finalPayout, 0);

      const receipt = new Receipt({
        mentor,
        sessions,
        startDate,
        endDate,
        payoutDetails: {
          totalSessions,
          totalDuration,
          basePayout,
          platformFee,
          taxes,
          finalPayout
        },
        customMessage
      });

      await receipt.save();

      // Create audit log
      await createAuditLog(req.user.id, 'create', 'receipt', receipt._id, [{
        field: 'status',
        oldValue: null,
        newValue: 'draft'
      }], req);

      res.status(201).json({
        message: 'Receipt created successfully',
        receipt
      });
    } catch (error) {
      logger.error('Create receipt error:', error);
      res.status(500).json({
        message: 'Error creating receipt'
      });
    }
  },

  // Get all receipts
  getReceipts: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const query = {};

      if (startDate && endDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      // Add role-based filtering
      if (req.user.role === 'mentor') {
        query.mentor = req.user.id;
      }

      const receipts = await Receipt.find(query)
        .populate('mentor', 'name email')
        .populate('sessions')
        .sort({ createdAt: -1 });

      res.json(receipts);
    } catch (error) {
      logger.error('Get receipts error:', error);
      res.status(500).json({
        message: 'Error fetching receipts'
      });
    }
  },

  // Get receipt by ID
  getReceiptById: async (req, res) => {
    try {
      const receipt = await Receipt.findById(req.params.id)
        .populate('mentor', 'name email')
        .populate('sessions');

      if (!receipt) {
        return res.status(404).json({
          message: 'Receipt not found'
        });
      }

      // Check authorization
      if (req.user.role === 'mentor' && receipt.mentor.toString() !== req.user.id) {
        return res.status(403).json({
          message: 'Not authorized to view this receipt'
        });
      }

      res.json(receipt);
    } catch (error) {
      logger.error('Get receipt by ID error:', error);
      res.status(500).json({
        message: 'Error fetching receipt'
      });
    }
  },

  // Update receipt
  updateReceipt: async (req, res) => {
    try {
      const receipt = await Receipt.findById(req.params.id);

      if (!receipt) {
        return res.status(404).json({
          message: 'Receipt not found'
        });
      }

      if (receipt.status !== 'draft') {
        return res.status(400).json({
          message: 'Can only update draft receipts'
        });
      }

      const updates = req.body;
      const oldReceipt = receipt.toObject();

      Object.assign(receipt, updates);
      await receipt.save();

      // Create audit log
      await createAuditLog(req.user.id, 'update', 'receipt', receipt._id, [{
        field: 'receipt',
        oldValue: oldReceipt,
        newValue: receipt.toObject()
      }], req);

      res.json({
        message: 'Receipt updated successfully',
        receipt
      });
    } catch (error) {
      logger.error('Update receipt error:', error);
      res.status(500).json({
        message: 'Error updating receipt'
      });
    }
  },

  // Delete receipt
  deleteReceipt: async (req, res) => {
    try {
      const receipt = await Receipt.findById(req.params.id);

      if (!receipt) {
        return res.status(404).json({
          message: 'Receipt not found'
        });
      }

      if (receipt.status !== 'draft') {
        return res.status(400).json({
          message: 'Can only delete draft receipts'
        });
      }

      await receipt.deleteOne();

      // Create audit log
      await createAuditLog(req.user.id, 'delete', 'receipt', receipt._id, [{
        field: 'status',
        oldValue: receipt.status,
        newValue: 'deleted'
      }], req);

      res.json({
        message: 'Receipt deleted successfully'
      });
    } catch (error) {
      logger.error('Delete receipt error:', error);
      res.status(500).json({
        message: 'Error deleting receipt'
      });
    }
  },

  // Send receipt
  sendReceipt: async (req, res) => {
    try {
      const receipt = await Receipt.findById(req.params.id);

      if (!receipt) {
        return res.status(404).json({
          message: 'Receipt not found'
        });
      }

      if (receipt.status !== 'draft') {
        return res.status(400).json({
          message: 'Can only send draft receipts'
        });
      }

      receipt.status = 'sent';
      await receipt.save();

      // Create audit log
      await createAuditLog(req.user.id, 'update', 'receipt', receipt._id, [{
        field: 'status',
        oldValue: 'draft',
        newValue: 'sent'
      }], req);

      // TODO: Send email notification

      res.json({
        message: 'Receipt sent successfully',
        receipt
      });
    } catch (error) {
      logger.error('Send receipt error:', error);
      res.status(500).json({
        message: 'Error sending receipt'
      });
    }
  },

  // Mark receipt as paid
  markReceiptAsPaid: async (req, res) => {
    try {
      const { paymentReference, paymentDate } = req.body;
      const receipt = await Receipt.findById(req.params.id);

      if (!receipt) {
        return res.status(404).json({
          message: 'Receipt not found'
        });
      }

      if (receipt.status !== 'sent') {
        return res.status(400).json({
          message: 'Can only mark sent receipts as paid'
        });
      }

      receipt.status = 'paid';
      receipt.paymentReference = paymentReference;
      receipt.paymentDate = paymentDate;
      await receipt.save();

      // Update session statuses
      await Session.updateMany(
        { _id: { $in: receipt.sessions } },
        { status: 'paid', paidAt: new Date(), paymentReference }
      );

      // Create audit log
      await createAuditLog(req.user.id, 'update', 'receipt', receipt._id, [{
        field: 'status',
        oldValue: 'sent',
        newValue: 'paid'
      }], req);

      res.json({
        message: 'Receipt marked as paid successfully',
        receipt
      });
    } catch (error) {
      logger.error('Mark receipt as paid error:', error);
      res.status(500).json({
        message: 'Error marking receipt as paid'
      });
    }
  },

  // Get payout summary
  getPayoutSummary: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const query = {
        status: 'paid'
      };

      if (startDate && endDate) {
        query.paymentDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      if (req.user.role === 'mentor') {
        query.mentor = req.user.id;
      }

      const receipts = await Receipt.find(query);

      const summary = {
        totalReceipts: receipts.length,
        totalPayout: receipts.reduce((acc, receipt) => acc + receipt.payoutDetails.finalPayout, 0),
        totalSessions: receipts.reduce((acc, receipt) => acc + receipt.payoutDetails.totalSessions, 0),
        totalDuration: receipts.reduce((acc, receipt) => acc + receipt.payoutDetails.totalDuration, 0),
        totalPlatformFee: receipts.reduce((acc, receipt) => acc + receipt.payoutDetails.platformFee, 0),
        totalTaxes: receipts.reduce((acc, receipt) => acc + receipt.payoutDetails.taxes, 0)
      };

      res.json(summary);
    } catch (error) {
      logger.error('Get payout summary error:', error);
      res.status(500).json({
        message: 'Error fetching payout summary'
      });
    }
  },

  // Get pending payouts
  getPendingPayouts: async (req, res) => {
    try {
      const receipts = await Receipt.find({ status: 'sent' })
        .populate('mentor', 'name email')
        .populate('sessions')
        .sort({ createdAt: 1 });

      res.json(receipts);
    } catch (error) {
      logger.error('Get pending payouts error:', error);
      res.status(500).json({
        message: 'Error fetching pending payouts'
      });
    }
  },

  // Simulate payout
  simulatePayout: async (req, res) => {
    try {
      const { mentor, startDate, endDate } = req.body;

      const sessions = await Session.find({
        mentor,
        startTime: { $gte: new Date(startDate), $lte: new Date(endDate) },
        status: 'approved'
      });

      const totalSessions = sessions.length;
      const totalDuration = sessions.reduce((acc, session) => acc + session.duration, 0);
      const basePayout = sessions.reduce((acc, session) => acc + session.payoutDetails.basePayout, 0);
      const platformFee = sessions.reduce((acc, session) => acc + session.payoutDetails.platformFee, 0);
      const taxes = sessions.reduce((acc, session) => acc + session.payoutDetails.taxes, 0);
      const finalPayout = sessions.reduce((acc, session) => acc + session.payoutDetails.finalPayout, 0);

      res.json({
        sessionCount: totalSessions,
        totalDuration,
        payoutDetails: {
          basePayout,
          platformFee,
          taxes,
          finalPayout
        },
        sessions: sessions.map(s => ({
          id: s._id,
          date: s.startTime,
          duration: s.duration,
          type: s.sessionType,
          payout: s.payoutDetails
        }))
      });
    } catch (error) {
      logger.error('Simulate payout error:', error);
      res.status(500).json({
        message: 'Error simulating payout'
      });
    }
  },

  // Download receipt
  downloadReceipt: async (req, res) => {
    try {
      const receipt = await Receipt.findById(req.params.id)
        .populate('mentor', 'name email hourlyRate')
        .populate({
          path: 'sessions',
          select: 'startTime endTime duration sessionType payoutDetails'
        });

      if (!receipt) {
        return res.status(404).json({
          message: 'Receipt not found'
        });
      }

      // Check authorization
      if (req.user.role === 'mentor' && receipt.mentor.toString() !== req.user.id) {
        return res.status(403).json({
          message: 'Not authorized to download this receipt'
        });
      }

      // Create PDF document
      const doc = new PDFDocument();
      const filename = `receipt-${receipt._id}.pdf`;

      // Set response headers for file download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Pipe the PDF directly to the response
      doc.pipe(res);

      // Add content to PDF
      doc.fontSize(20).text('Mentor Payout Receipt', { align: 'center' });
      doc.moveDown();

      // Mentor Details
      doc.fontSize(14).text('Mentor Details');
      doc.fontSize(12)
        .text(`Name: ${receipt.mentor.name}`)
        .text(`Email: ${receipt.mentor.email}`)
        .text(`Hourly Rate: ₹${receipt.mentor.hourlyRate}`);
      doc.moveDown();

      // Receipt Details
      doc.fontSize(14).text('Receipt Details');
      doc.fontSize(12)
        .text(`Receipt ID: ${receipt._id}`)
        .text(`Status: ${receipt.status}`)
        .text(`Period: ${new Date(receipt.startDate).toLocaleDateString()} to ${new Date(receipt.endDate).toLocaleDateString()}`);
      doc.moveDown();

      // Sessions Table
      doc.fontSize(14).text('Sessions');
      doc.moveDown();
      let yPos = doc.y;
      
      // Table headers
      const headers = ['Date', 'Type', 'Duration', 'Amount'];
      const colWidths = [150, 100, 100, 100];
      
      headers.forEach((header, i) => {
        doc.text(header, doc.x + (i > 0 ? colWidths.slice(0, i).reduce((a, b) => a + b, 0) : 0), yPos);
      });
      
      doc.moveDown();
      yPos = doc.y;

      // Table rows
      receipt.sessions.forEach(session => {
        const cols = [
          new Date(session.startTime).toLocaleDateString(),
          session.sessionType,
          `${session.duration} mins`,
          `₹${session.payoutDetails.finalPayout}`
        ];

        cols.forEach((col, i) => {
          doc.text(col, doc.x + (i > 0 ? colWidths.slice(0, i).reduce((a, b) => a + b, 0) : 0), yPos);
        });

        doc.moveDown();
        yPos = doc.y;
      });

      doc.moveDown();

      // Summary
      doc.fontSize(14).text('Summary');
      doc.fontSize(12)
        .text(`Total Sessions: ${receipt.payoutDetails.totalSessions}`)
        .text(`Total Duration: ${receipt.payoutDetails.totalDuration} mins`)
        .text(`Base Payout: ₹${receipt.payoutDetails.basePayout}`)
        .text(`Platform Fee: ₹${receipt.payoutDetails.platformFee}`)
        .text(`Taxes: ₹${receipt.payoutDetails.taxes}`)
        .text(`Final Payout: ₹${receipt.payoutDetails.finalPayout}`);

      // Payment Details if paid
      if (receipt.status === 'paid') {
        doc.moveDown();
        doc.fontSize(14).text('Payment Details');
        doc.fontSize(12)
          .text(`Payment Reference: ${receipt.paymentReference}`)
          .text(`Payment Date: ${new Date(receipt.paymentDate).toLocaleDateString()}`);
      }

      // Finalize PDF
      doc.end();

    } catch (error) {
      logger.error('Download receipt error:', error);
      res.status(500).json({
        message: 'Error downloading receipt'
      });
    }
  },
  generateReceipt: async (req, res) => {
  try {
    const { mentor, startDate, endDate, customMessage } = req.body;

    const sessions = await Session.find({
      mentor,
      startTime: { $gte: new Date(startDate), $lte: new Date(endDate) },
      status: 'approved'
    });

    if (sessions.length === 0) {
      return res.status(400).json({ message: 'No approved sessions found in the given date range' });
    }

    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((acc, s) => acc + s.duration, 0);
    const basePayout = sessions.reduce((acc, s) => acc + s.payoutDetails.basePayout, 0);
    const platformFee = sessions.reduce((acc, s) => acc + s.payoutDetails.platformFee, 0);
    const taxes = sessions.reduce((acc, s) => acc + s.payoutDetails.taxes, 0);
    const finalPayout = sessions.reduce((acc, s) => acc + s.payoutDetails.finalPayout, 0);

    const receipt = new Receipt({
      mentor,
      sessions: sessions.map(s => s._id),
      startDate,
      endDate,
      payoutDetails: {
        totalSessions,
        totalDuration,
        basePayout,
        platformFee,
        taxes,
        finalPayout
      },
      customMessage,
      status: 'draft'
    });

    await receipt.save();

    await createAuditLog(req.user.id, 'create', 'receipt', receipt._id, [
      { field: 'status', oldValue: null, newValue: 'draft' }
    ], req);

    res.status(201).json({
      message: 'Receipt generated successfully',
      receipt
    });
  } catch (error) {
    logger.error('Generate receipt error:', error);
    res.status(500).json({ message: 'Error generating receipt' });
  }
},

  // Calculate payout for a date range
  calculatePayout: async (req, res) => {
    try {
      const { mentorId, startDate, endDate } = req.body;

      // Get all approved sessions for the date range
      const sessions = await Session.find({
        mentor: mentorId,
        status: 'approved',
        startTime: { $gte: new Date(startDate) },
        endTime: { $lte: new Date(endDate) }
      });

      // Calculate totals
      const subtotal = sessions.reduce((sum, session) => sum + session.adjustedRate, 0);
      const platformFee = (subtotal * PLATFORM_FEE_PERCENTAGE) / 100;
      const taxAmount = (subtotal - platformFee) * TAX_RATE;
      const totalAmount = subtotal - platformFee - taxAmount;

      res.json({
        sessions,
        payoutDetails: {
          subtotal,
          platformFee,
          taxAmount,
          totalAmount,
          currency: 'USD'
        }
      });
    } catch (error) {
      logger.error('Payout calculation error:', error);
      res.status(500).json({ message: 'Error calculating payout' });
    }
  },

  // Generate receipt
  generateReceipt: async (req, res) => {
    try {
      const { mentorId, startDate, endDate, notes } = req.body;

      // Calculate payout
      const { sessions, payoutDetails } = await payoutController.calculatePayout(req, res);

      // Create receipt
      const receipt = new Receipt({
        mentor: mentorId,
        sessions: sessions.map(s => s._id),
        startDate,
        endDate,
        payoutDetails,
        notes,
        auditLog: [{
          action: 'created',
          performedBy: req.user._id,
          details: 'Receipt generated'
        }]
      });

      await receipt.save();

      // Send notification to mentor
      await Message.create({
        sender: req.user._id,
        recipient: mentorId,
        content: `A new receipt (${receipt.receiptNumber}) has been generated for your sessions from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}.`,
        relatedTo: {
          type: 'receipt',
          id: receipt._id
        }
      });

      res.status(201).json({
        message: 'Receipt generated successfully',
        receipt
      });
    } catch (error) {
      logger.error('Receipt generation error:', error);
      res.status(500).json({ message: 'Error generating receipt' });
    }
  },

  // Get receipt history
  getReceiptHistory: async (req, res) => {
    try {
      const { mentorId, page = 1, limit = 10 } = req.query;
      const query = mentorId ? { mentor: mentorId } : {};

      const receipts = await Receipt.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('mentor', 'name email')
        .populate('sessions');

      const total = await Receipt.countDocuments(query);

      res.json({
        receipts,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Receipt history error:', error);
      res.status(500).json({ message: 'Error fetching receipt history' });
    }
  },

  // Get audit logs
  getAuditLogs: async (req, res) => {
    try {
      const { receiptId } = req.params;
      const receipt = await Receipt.findById(receiptId)
        .populate('auditLog.performedBy', 'name email');

      if (!receipt) {
        return res.status(404).json({ message: 'Receipt not found' });
      }

      res.json(receipt.auditLog);
    } catch (error) {
      logger.error('Audit log error:', error);
      res.status(500).json({ message: 'Error fetching audit logs' });
    }
  },

  // Create a new payout
  createPayout: async (req, res) => {
    try {
      const {
        mentorId,
        receipts,
        period,
        amount,
        paymentDetails,
        notes
      } = req.body;

      // Verify mentor exists
      const mentor = await User.findById(mentorId);
      if (!mentor) {
        return res.status(404).json({
          success: false,
          message: 'Mentor not found',
          data: null
        });
      }

      // Verify all receipts exist and belong to the mentor
      const receiptDocs = await Receipt.find({
        _id: { $in: receipts },
        mentor: mentorId
      });

      if (receiptDocs.length !== receipts.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more receipts not found or do not belong to the mentor',
          data: null
        });
      }

      // Verify receipts are not already part of another payout
      const existingPayout = await Payout.findOne({
        receipts: { $in: receipts }
      });

      if (existingPayout) {
        return res.status(400).json({
          success: false,
          message: 'One or more receipts are already part of another payout',
          data: null
        });
      }

      // Create payout
      const payout = new Payout({
        mentor: mentorId,
        receipts,
        period: {
          startDate: new Date(period.startDate),
          endDate: new Date(period.endDate)
        },
        amount: {
          subtotal: amount.subtotal,
          platformFee: amount.platformFee,
          taxAmount: amount.taxAmount,
          totalAmount: amount.subtotal - amount.platformFee - amount.taxAmount,
          currency: 'USD'
        },
        paymentDetails: {
          method: paymentDetails.method,
          accountDetails: paymentDetails.accountDetails || new Map()
        },
        notes
      });

      // Add audit log entry
      await payout.addAuditLog(
        'payout_created',
        req.user._id,
        'Payout created for receipts'
      );

      await payout.save();

      // Update receipt statuses to 'paid'
      await Receipt.updateMany(
        { _id: { $in: receipts } },
        { 
          $set: { 
            status: 'paid',
            paymentDate: new Date(),
            paymentMethod: paymentDetails.method
          }
        }
      );

      res.status(201).json({
        success: true,
        message: 'Payout created successfully',
        data: payout
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating payout',
        error: error.message
      });
    }
  }
};

module.exports = payoutController; 