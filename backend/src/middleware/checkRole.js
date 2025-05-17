const checkRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }

    if (typeof role === 'string' && req.user.role !== role) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    if (Array.isArray(role) && !role.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    next();
  };
};

module.exports = checkRole; 