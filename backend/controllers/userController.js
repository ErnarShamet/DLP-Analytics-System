// backend/controllers/userController.js
const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find(); // Add pagination later
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        console.error("GetUsers error:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, error: `User not found with id of ${req.params.id}` });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error("GetUser error:", error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, error: `User not found with id of ${req.params.id}` });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Create user (admin creating users)
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
    const { username, fullName, email, password, role, isActive } = req.body;
    try {
        if (await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] })) {
            return res.status(400).json({ success: false, error: 'User already exists with this email or username' });
        }
        const user = await User.create({ username, fullName, email, password, role, isActive });
        res.status(201).json({ success: true, data: user, message: "User created successfully" });
    } catch (error) {
        console.error("CreateUser error:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages.join(', ') });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
    const { fullName, email, role, isActive, twoFactorEnabled } = req.body;
    const updateFields = { fullName, email, role, isActive, twoFactorEnabled };

    // Remove undefined fields so they don't overwrite existing data with null
    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);

    try {
        let user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, error: `User not found with id of ${req.params.id}` });
        }

        // Check for email/username conflicts if they are being changed
        if (email && email.toLowerCase() !== user.email.toLowerCase()) {
            if (await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } })) {
                return res.status(400).json({ success: false, error: 'Email already in use' });
            }
        }
        // Username updates would need similar logic if allowed

        user = await User.findByIdAndUpdate(req.params.id, updateFields, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: user, message: "User updated successfully" });
    } catch (error) {
        console.error("UpdateUser error:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages.join(', ') });
        }
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, error: `User not found with id of ${req.params.id}` });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, error: `User not found with id of ${req.params.id}` });
        }

        // Add any pre-delete logic here (e.g., reassign tasks)
        await user.deleteOne(); // Changed from .remove() which is deprecated

        res.status(200).json({ success: true, data: {}, message: "User deleted successfully" });
    } catch (error) {
        console.error("DeleteUser error:", error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, error: `User not found with id of ${req.params.id}` });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
