const { Router } = require('express');
const { body } = require('express-validator');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const userController = require('../controllers/user.controller');
const multer = require('multer');

const router = Router();

// Configure multer for profile picture uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads/profiles',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  }
});

// Validation middleware
const profileUpdateValidation = [
  body('name').optional().trim().notEmpty(),
  body('hourlyRate').optional().isNumeric(),
  body('taxInfo.pan').optional().isLength({ min: 10, max: 10 }),
  body('taxInfo.gst').optional().isLength({ min: 15, max: 15 }),
  body('bankDetails').optional().isObject(),
  body('bankDetails.accountNumber').optional().notEmpty(),
  body('bankDetails.ifsc').optional().matches(/^[A-Z]{4}0[A-Z0-9]{6}$/),
  body('bankDetails.bankName').optional().notEmpty()
];

// Routes
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, profileUpdateValidation, userController.updateProfile);
router.post('/profile/picture', authenticate, upload.single('picture'), userController.updateProfilePicture);

// Admin only routes
router.get('/', authenticate, authorizeAdmin, userController.getAllUsers);
router.get('/mentors', authenticate, authorizeAdmin, userController.getAllMentors);
router.get('/:id', authenticate, authorizeAdmin, userController.getUserById);
router.put('/:id', authenticate, authorizeAdmin, profileUpdateValidation, userController.updateUser);
router.delete('/:id', authenticate, authorizeAdmin, userController.deleteUser);
router.post('/:id/activate', authenticate, authorizeAdmin, userController.activateUser);
router.post('/:id/deactivate', authenticate, authorizeAdmin, userController.deactivateUser);

// Settings routes
router.get('/settings', authenticate, userController.getSettings);
router.put('/settings', authenticate, [
  body('emailNotifications').optional().isBoolean(),
  body('timezone').optional().isString(),
  body('language').optional().isIn(['en', 'hi'])
], userController.updateSettings);

module.exports = router; 