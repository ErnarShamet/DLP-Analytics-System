// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // For reset token

const UserSchema = new mongoose.Schema({
    username: { type: String, required: [true, 'Username is required'], unique: true, trim: true, lowercase: true, minlength: 3 },
    fullName: { type: String, required: [true, 'Full name is required'], trim: true },
    email: {
        type: String, required: [true, 'Email is required'], unique: true, trim: true, lowercase: true,
        match: [ /^\w+([.-]?\w+)@\w+([.-]?\w+)(\.\w{2,3})+$/, 'Please add a valid email' ],
    },
    password: { type: String, required: [true, 'Password is required'], minlength: 8, select: false },
    role: {
        type: String,
        enum: ['User', 'Analyst', 'IncidentResponder', 'Admin', 'SuperAdmin'],
        default: 'User',
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false }, // Store encrypted
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, { timestamps: true }); // timestamps: true automatically adds createdAt and updatedAt

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare entered password
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate JWT Access Token
UserSchema.methods.getSignedJwtAccessToken = function () {
    return jwt.sign({ id: this._id, role: this.role, username: this.username }, process.env.JWT_SECRET, { // Added username to payload
        expiresIn: process.env.JWT_EXPIRE_ACCESS || '1h',
    });
};

// Method to generate and hash password reset token
UserSchema.methods.getResetPasswordToken = function() {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire (e.g., 10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken; // Return the unhashed token (to be sent to user)
};

// Method to generate JWT Refresh Token (can have different payload/expiry)
// UserSchema.methods.getSignedJwtRefreshToken = function () { /* ... */ };

module.exports = mongoose.model('User', UserSchema);