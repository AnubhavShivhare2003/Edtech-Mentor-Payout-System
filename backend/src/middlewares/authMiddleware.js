// middlewares/auth.js
const jwt = require("jsonwebtoken");

const authMiddleware = (roles = []) => {
    // roles param can be a string or array
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({ msg: "No token provided" });
            }

            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = decoded; // decoded contains user data (id, role, etc.)

            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(403).json({ msg: "Access forbidden: Insufficient role" });
            }

            next();
        } catch (err) {
            console.error("Auth error:", err);
            return res.status(401).json({ msg: "Invalid or expired token" });
        }
    };
};

module.exports = authMiddleware;
