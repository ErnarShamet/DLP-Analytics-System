// backend/routes/alertRoutes.js
const express = require('express');
const {
    getAlerts,
    getAlert,
    createAlert,
    updateAlert,
    deleteAlert
} = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/auth'); // Using the new middleware file name

const router = express.Router();

// Protect all routes for alerts
router.use(protect);

router.route('/')
    .get(authorize('Analyst', 'IncidentResponder', 'Admin', 'SuperAdmin'), getAlerts) // Broader access for viewing
    .post(authorize('Admin', 'SuperAdmin', 'System'), createAlert); // System role might be conceptual for API keys

router.route('/:id')
    .get(authorize('Analyst', 'IncidentResponder', 'Admin', 'SuperAdmin'), getAlert)
    .put(authorize('Analyst', 'IncidentResponder', 'Admin', 'SuperAdmin'), updateAlert)
    .delete(authorize('Admin', 'SuperAdmin'), deleteAlert); // Stricter for deletion

module.exports = router;