// backend/controllers/incidentController.js
const Incident = require('../models/Incident');
const Alert = require('../models/Alert'); // For linking alerts
const User = require('../models/User');   // For assignee, createdBy

// @desc    Get all incidents
// @route   GET /api/incidents
// @access  Private (IncidentResponder, Analyst, Admin)
exports.getIncidents = async (req, res, next) => {
    try {
        // Add filtering, sorting, pagination
        const incidents = await Incident.find()
            .populate('assignee', 'username fullName')
            .populate('createdBy', 'username')
            .populate('relatedAlerts', 'title severity')
            .sort({ priority: 1, createdAt: -1 }); // Example sort: High priority first, then newest

        res.status(200).json({ success: true, count: incidents.length, data: incidents });
    } catch (error) {
        console.error("GetIncidents error:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get single incident
// @route   GET /api/incidents/:id
// @access  Private
exports.getIncident = async (req, res, next) => {
    try {
        const incident = await Incident.findById(req.params.id)
            .populate('assignee', 'username fullName email role')
            .populate('createdBy', 'username fullName')
            .populate('updatedBy', 'username fullName')
            .populate('relatedAlerts') // Populate full alert details if needed
            .populate('comments.user', 'username fullName');

        if (!incident) {
            return res.status(404).json({ success: false, error: `Incident not found with id of ${req.params.id}` });
        }
        res.status(200).json({ success: true, data: incident });
    } catch (error) {
        console.error("GetIncident error:", error);
        if (error.kind === 'ObjectId') {
             return res.status(404).json({ success: false, error: `Incident not found with id of ${req.params.id}` });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Create incident
// @route   POST /api/incidents
// @access  Private (IncidentResponder, Analyst, Admin)
exports.createIncident = async (req, res, next) => {
    const { title, description, severity, priority, status, assignee, relatedAlerts, tags } = req.body;
    try {
        const incidentData = {
            title,
            description,
            severity: severity || 'Medium',
            priority: priority || 'Medium',
            status: status || 'Open',
            assignee,
            relatedAlerts,
            tags,
            createdBy: req.user.id, // From protect middleware
            updatedBy: req.user.id,
        };

        const incident = await Incident.create(incidentData);
        res.status(201).json({ success: true, data: incident, message: "Incident created successfully" });
    } catch (error) {
        console.error("CreateIncident error:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages.join(', ') });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Update incident
// @route   PUT /api/incidents/:id
// @access  Private (IncidentResponder, Analyst, Admin)
exports.updateIncident = async (req, res, next) => {
    const { title, description, severity, priority, status, assignee, relatedAlerts, resolutionDetails, tags } = req.body;
    const updateFields = { title, description, severity, priority, status, assignee, relatedAlerts, resolutionDetails, tags, updatedBy: req.user.id };

    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);
     if(Object.keys(updateFields).length <= 1 && updateFields.updatedBy) {
        return res.status(400).json({ success: false, error: 'No fields to update provided.' });
    }

    try {
        let incident = await Incident.findById(req.params.id);
        if (!incident) {
            return res.status(404).json({ success: false, error: `Incident not found with id of ${req.params.id}` });
        }

        // Add specific logic, e.g., if status changes to 'Resolved', resolutionDetails might be required
        if (status === 'Resolved' && !resolutionDetails && !incident.resolutionDetails) {
            // return res.status(400).json({ success: false, error: 'Resolution details are required when resolving an incident.' });
        }

        incident = await Incident.findByIdAndUpdate(req.params.id, { $set: updateFields }, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: incident, message: "Incident updated successfully" });
    } catch (error) {
        console.error("UpdateIncident error:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages.join(', ') });
        }
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, error: `Incident not found with id of ${req.params.id}` });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Add comment to incident
// @route   POST /api/incidents/:id/comments
// @access  Private
exports.addIncidentComment = async (req, res, next) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ success: false, error: 'Comment text is required.' });
    }
    try {
        const incident = await Incident.findById(req.params.id);
        if (!incident) {
            return res.status(404).json({ success: false, error: `Incident not found with id of ${req.params.id}` });
        }

        const comment = {
            user: req.user.id,
            text,
            createdAt: Date.now()
        };

        incident.comments.unshift(comment); // Add to the beginning of the array
        incident.updatedBy = req.user.id;
        await incident.save();

        // Populate user for the new comment before sending response
        const populatedIncident = await Incident.findById(incident._id).populate('comments.user', 'username fullName');

        res.status(201).json({ success: true, data: populatedIncident.comments[0], message: "Comment added successfully" });
    } catch (error) {
        console.error("AddIncidentComment error:", error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, error: `Incident not found with id of ${req.params.id}` });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};


// @desc    Delete incident (use with caution)
// @route   DELETE /api/incidents/:id
// @access  Private/Admin
exports.deleteIncident = async (req, res, next) => {
    try {
        const incident = await Incident.findById(req.params.id);
        if (!incident) {
            return res.status(404).json({ success: false, error: `Incident not found with id of ${req.params.id}` });
        }

        await incident.deleteOne();
        res.status(200).json({ success: true, data: {}, message: "Incident deleted successfully" });
    } catch (error) {
        console.error("DeleteIncident error:", error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, error: `Incident not found with id of ${req.params.id}` });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};