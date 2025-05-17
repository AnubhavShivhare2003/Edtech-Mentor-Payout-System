const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = await verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

const authorizeMentor = (req, res, next) => {
  if (req.user?.role !== 'mentor') {
    return res.status(403).json({ message: 'Access denied. Mentor only.' });
  }
  next();
};

module.exports = {
  verifyToken,
  authenticate,
  authorizeAdmin,
  authorizeMentor
}; 