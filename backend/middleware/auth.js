// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming User model is in ../models/User

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // else if (req.cookies.token) { // If using cookies for token
    //  token = req.cookies.token;
    // }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route (no token)' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password'); // Attach user to request, exclude password

        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Not authorized, user not found' });
        }
        if (!req.user.isActive) {
            return res.status(403).json({ success: false, error: 'Account is deactivated. Please contact administrator.' });
        }

        next();
    } catch (err) {
        console.error('Token verification error:', err.message);
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, error: 'Not authorized to access this route (invalid token)' });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, error: 'Not authorized to access this route (token expired)' });
        }
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            // This should ideally not happen if 'protect' middleware runs first
            return res.status(401).json({ success: false, error: 'User role not available. Authorization failed.' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `User role '${req.user.role}' is not authorized to access this route. Allowed roles: ${roles.join(', ')}`
            });
        }
        next();
    };
};