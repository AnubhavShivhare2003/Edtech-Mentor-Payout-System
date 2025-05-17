const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const sessionController = require('../controllers/session.controller');
const { authenticate, authorizeAdmin, authorizeMentor } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/sessions');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only .jpeg, .jpg, .png and .pdf files are allowed'));
  }
});

// Validation middleware
const sessionValidation = [
  body('sessionType')
    .isIn(['live', 'evaluation', 'recording_review'])
    .withMessage('Invalid session type'),
  body('startTime')
    .isISO8601()
    .withMessage('Invalid start time'),
  body('endTime')
    .isISO8601()
    .withMessage('Invalid end time')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  body('baseRate')
    .isNumeric()
    .withMessage('Base rate must be a number')
    .custom((value) => value > 0)
    .withMessage('Base rate must be greater than 0'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

// Routes
router.post('/',
  authenticate,
  authorizeMentor,
  upload.array('attachments', 5),
  sessionValidation,
  validateRequest,
  sessionController.createSession
);

router.get('/',
  authenticate,
  sessionController.getSessions
);

router.get('/stats',
  authenticate,
  authorizeAdmin,
  sessionController.getSessionStats
);

router.get('/:id',
  authenticate,
  sessionController.getSessionById
);

router.put('/:id',
  authenticate,
  authorizeMentor,
  upload.array('attachments', 5),
  sessionValidation,
  validateRequest,
  sessionController.updateSession
);

router.delete('/:id',
  authenticate,
  authorizeMentor,
  sessionController.deleteSession
);

// Admin routes
router.put('/:id/approve',
  authenticate,
  authorizeAdmin,
  sessionController.approveSession
);

router.put('/:id/reject',
  authenticate,
  authorizeAdmin,
  body('rejectionReason').trim().notEmpty().withMessage('Rejection reason is required'),
  validateRequest,
  sessionController.rejectSession
);

router.delete('/:id/attachment/:attachmentId',
  authenticate,
  sessionController.deleteAttachment
);

module.exports = router; 