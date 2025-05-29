// backend/controllers/alertController.js
const Alert = require('../models/Alert');
const Policy = require('../models/Policy'); // May be needed for context
const User = require('../models/User');     // May be needed for context

// @desc    Get all alerts
// @route   GET /api/alerts
// @access  Private (Analyst, IncidentResponder, Admin)
exports.getAlerts = async (req, res, next) => {
    try {
        // Add filtering, sorting, pagination later
        const alerts = await Alert.find()
            .populate('policyTriggered', 'name')
            .populate('userInvolved', 'username fullName email')
            .sort({ timestamp: -1 });

        res.status(200).json({ success: true, count: alerts.length, data: alerts });
    } catch (error) {
        console.error("GetAlerts error:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get single alert
// @route   GET /api/alerts/:id
// @access  Private
exports.getAlert = async (req, res, next) => {
    try {
        const alert = await Alert.findById(req.params.id)
            .populate('policyTriggered', 'name description')
            .populate('userInvolved', 'username fullName email role');

        if (!alert) {
            return res.status(404).json({ success: false, error: `Alert not found with id of ${req.params.id}` });
        }
        res.status(200).json({ success: true, data: alert });
    } catch (error) {
        console.error("GetAlert error:", error);
        if (error.kind === 'ObjectId') {
             return res.status(404).json({ success: false, error: `Alert not found with id of ${req.params.id}` });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Create alert (Typically system-generated, but an API might be useful for manual or external input)
// @route   POST /api/alerts
// @access  Private/System or Admin
exports.createAlert = async (req, res, next) => {
    const { title, description, severity, status, policyTriggered, userInvolved, dataSnapshot, source, tags } = req.body;
    try {
        const alertData = {
            title,
            description,
            severity,
            status: status || 'New',
            policyTriggered,
            userInvolved,
            dataSnapshot,
            source,
            tags
        };
        // Add generatedBy (req.user.id if manually created by a logged-in user)
        // alertData.generatedBy = req.user ? req.user.id : null;


        const alert = await Alert.create(alertData);
        res.status(201).json({ success: true, data: alert, message: "Alert created successfully" });
    } catch (error) {
        console.error("CreateAlert error:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages.join(', ') });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Update alert (e.g., change status, add notes)
// @route   PUT /api/alerts/:id
// @access  Private (Analyst, IncidentResponder, Admin)
exports.updateAlert = async (req, res, next) => {
    const { status, severity, notes, assignedTo } = req.body; // Example fields to update
    const updateFields = { status, severity, notes, assignedTo };

    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);
    if(Object.keys(updateFields).length === 0) {
        return res.status(400).json({ success: false, error: 'No fields to update provided.' });
    }
    // Add updatedBy: req.user.id

    try {
        let alert = await Alert.findById(req.params.id);
        if (!alert) {
            return res.status(404).json({ success: false, error: `Alert not found with id of ${req.params.id}` });
        }

        // Add logic for allowed status transitions if necessary

        alert = await Alert.findByIdAndUpdate(req.params.id, { $set: updateFields, $push: { history: { user: req.user.id, action: `Alert updated: ${Object.keys(updateFields).join(', ')}`, timestamp: Date.now() } } }, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: alert, message: "Alert updated successfully" });
    } catch (error) {
        console.error("UpdateAlert error:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages.join(', ') });
        }
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, error: `Alert not found with id of ${req.params.id}` });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete alert (use with caution, maybe soft delete or archive)
// @route   DELETE /api/alerts/:id
// @access  Private/Admin
exports.deleteAlert = async (req, res, next) => {
    try {
        const alert = await Alert.findById(req.params.id);
        if (!alert) {
            return res.status(404).json({ success: false, error: `Alert not found with id of ${req.params.id}` });
        }

        // Consider soft delete: alert.isDeleted = true; await alert.save();
        await alert.deleteOne();

        res.status(200).json({ success: true, data: {}, message: "Alert deleted successfully" });
    } catch (error) {
        console.error("DeleteAlert error:", error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, error: `Alert not found with id of ${req.params.id}` });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};