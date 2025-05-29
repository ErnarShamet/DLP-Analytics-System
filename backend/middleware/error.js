// backend/middleware/error.js
// Basic error handler middleware
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log to console for dev
    console.error('Error Handler Stack:');
    console.error(err); // Log the original error object for more details

    // Mongoose bad ObjectId
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        const message = `Resource not found with id of ${err.value}`;
        error = { statusCode: 404, message, success: false };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        const message = `Duplicate field value entered for '${field}': '${value}'. This value must be unique.`;
        error = { statusCode: 400, message, success: false };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        const message = messages.join('. ');
        error = { statusCode: 400, message, success: false };
    }

    // JWT errors (already handled in auth middleware, but can be a fallback)
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token. Authorization denied.';
        error = { statusCode: 401, message, success: false };
    }
    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired. Authorization denied.';
        error = { statusCode: 401, message, success: false };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    });
};

module.exports = { errorHandler };