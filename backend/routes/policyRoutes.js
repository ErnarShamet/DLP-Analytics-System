// backend/routes/policyRoutes.js
const express = require('express');
const {
    getPolicies,
    getPolicy,
    createPolicy,
    updatePolicy,
    deletePolicy
} = require('../controllers/policyController');
const { protect, authorize } = require('../middleware/auth'); // Using the new middleware file name

const router = express.Router();

router.use(protect); // All policy routes are protected

router.route('/')
    .get(authorize('Analyst', 'Admin', 'SuperAdmin'), getPolicies) // Analysts can view policies
    .post(authorize('Admin', 'SuperAdmin'), createPolicy); // Only Admins can create

router.route('/:id')
    .get(authorize('Analyst', 'Admin', 'SuperAdmin'), getPolicy)
    .put(authorize('Admin', 'SuperAdmin'), updatePolicy)
    .delete(authorize('Admin', 'SuperAdmin'), deletePolicy);

module.exports = router;