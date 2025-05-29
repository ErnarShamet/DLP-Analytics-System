// backend/controllers/authController.js
const User = require('../models/User');
const crypto = require('crypto');
// const sendEmail = require('../utils/sendEmail'); // You'd need an email utility and configure it

// Utility to send token in response
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
    const accessToken = user.getSignedJwtAccessToken();
    // For refresh tokens in HttpOnly cookie:
    // const refreshToken = user.getSignedJwtRefreshToken();
    // const options = {
    //   expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE_REFRESH_DAYS || 7) * 24 * 60 * 60 * 1000),
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'strict' // Or 'lax'
    // };
    // res.cookie('refreshToken', refreshToken, options);

    res.status(statusCode).json({
        success: true,
        message,
        accessToken,
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
            isActive: user.isActive,
            twoFactorEnabled: user.twoFactorEnabled
        }
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res, next) => {
    const { username, fullName, email, password, role } = req.body;
    try {
        if (await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] })) {
            return res.status(400).json({ success: false, error: 'User already exists with this email or username' });
        }

        // Create user
        const user = await User.create({
            username,
            fullName,
            email,
            password,
            role: role || 'User' // Default role if not provided, or validate allowed roles for self-registration
        });

        sendTokenResponse(user, 201, res, 'User registered successfully');
    } catch (error) {
        console.error("Register error:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages.join(', ') });
        }
        res.status(500).json({ success: false, error: 'Server Error during registration' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res, next) => {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
        return res.status(400).json({ success: false, error: 'Please provide email/username and password' });
    }

    try {
        const user = await User.findOne({
            $or: [
                { email: emailOrUsername.toLowerCase() },
                { username: emailOrUsername.toLowerCase() }
            ]
        }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, error: 'Account is deactivated. Please contact administrator.' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        user.lastLogin = Date.now();
        await user.save({ validateBeforeSave: false }); // Skip validation as we are only updating lastLogin

        sendTokenResponse(user, 200, res, 'Login successful');
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, error: 'Server Error during login' });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    // req.user is set by the protect middleware
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error("GetMe error:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            // Send a generic message for security reasons
            return res.status(200).json({ success: true, data: 'If an account with that email exists, a password reset link has been sent.' });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken(); // You need to implement this method in User model
        await user.save({ validateBeforeSave: false });

        // Create reset URL
        const resetUrl = `${req.protocol}://${req.get('host')}/resetpassword/${resetToken}`; // This is for backend testing, frontend should have its own URL

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
        // Implement sendEmail utility
        // try {
        //     await sendEmail({
        //         email: user.email,
        //         subject: 'Password Reset Token',
        //         message
        //     });
        //     res.status(200).json({ success: true, data: 'Email sent' });
        // } catch (err) {
        //     console.error('Email sending error:', err);
        //     user.resetPasswordToken = undefined;
        //     user.resetPasswordExpire = undefined;
        //     await user.save({ validateBeforeSave: false });
        //     return res.status(500).json({ success: false, error: 'Email could not be sent' });
        // }
        console.log('Reset URL (for dev):', resetUrl); // For dev, replace with actual email sending
        res.status(200).json({ success: true, data: 'If an account with that email exists, a password reset token has been generated (check server logs for dev). Email sent (simulated).' });

    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};


// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, error: 'Invalid or expired token' });
        }

        // Set new password
        user.password = req.body.password; // The 'save' pre-hook in User model will hash it
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        sendTokenResponse(user, 200, res, 'Password reset successful');
    } catch (error) {
        console.error("Reset password error:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages.join(', ') });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Implement refreshToken and logoutUser if using cookie-based refresh tokens
// exports.refreshToken = async (req, res, next) => { /* ... */ };
// exports.logoutUser = async (req, res, next) => { /* ... */ };