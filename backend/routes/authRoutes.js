// backend/routes/authRoutes.js
const express = require('express');
const {
    registerUser,
    loginUser,
    getMe,
    forgotPassword,
    resetPassword
    // refreshToken, // Uncomment if you implement refresh tokens
    // logoutUser    // Uncomment if you implement logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth'); // Using the new middleware file name

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// router.post('/refresh-token', refreshToken);
// router.post('/logout', protect, logoutUser);

module.exports = router;