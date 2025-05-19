const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const validateRequest = require('../middleware/validateRequest');
const { verifyToken,
  authenticate,
  authorizeAdmin,
  authorizeMentor } = require('../middleware/auth');
// const { authorizeAdmin } = require('../middleware/authorizeAdmin');

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role').equals('mentor').withMessage('Only mentor role is allowed during registration'),
  body('hourlyRate')
    .if(body('role').equals('mentor'))
    .isNumeric()
    .withMessage('Hourly rate is required for mentors')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const createAdminValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role').equals('admin').withMessage('Only admin role is allowed for this endpoint')
];

// Routes
router.post('/register', registerValidation, validateRequest, authController.register);
router.post('/login', loginValidation, validateRequest, authController.login);
router.post('/create-admin', authenticate, authorizeAdmin, createAdminValidation, validateRequest, authController.createAdmin);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getCurrentUser);
router.put('/profile', authenticate, authController.updateProfile);

module.exports = router; 