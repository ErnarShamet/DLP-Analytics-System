// backend/routes/incidentRoutes.js
const express = require('express');
const {
    getIncidents,
    getIncident,
    createIncident,
    updateIncident,
    deleteIncident,
    addIncidentComment
} = require('../controllers/incidentController');
const { protect, authorize } = require('../middleware/auth'); // Using the new middleware file name

const router = express.Router();

router.use(protect); // All incident routes are protected

const incidentManagementRoles = ['IncidentResponder', 'Analyst', 'Admin', 'SuperAdmin'];

router.route('/')
    .get(authorize(...incidentManagementRoles), getIncidents)
    .post(authorize(...incidentManagementRoles), createIncident);

router.route('/:id')
    .get(authorize(...incidentManagementRoles), getIncident)
    .put(authorize(...incidentManagementRoles), updateIncident)
    .delete(authorize('Admin', 'SuperAdmin'), deleteIncident); // Stricter for deletion

router.route('/:id/comments')
    .post(authorize(...incidentManagementRoles), addIncidentComment);

module.exports = router;