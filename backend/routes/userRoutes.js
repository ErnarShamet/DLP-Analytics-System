// backend/routes/userRoutes.js
const express = require('express');
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth'); // Using the new middleware file name

const router = express.Router();

// All routes below are protected and require admin role
router.use(protect);
router.use(authorize('Admin', 'SuperAdmin')); // Only Admins and SuperAdmins can manage users

router.route('/')
    .get(getUsers)
    .post(createUser);

router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;