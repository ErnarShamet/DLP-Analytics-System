// backend/models/Alert.js
const mongoose = require('mongoose');

const AlertHistorySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true }, // e.g., "Status changed to Investigating", "Note added"
    timestamp: { type: Date, default: Date.now },
    details: mongoose.Schema.Types.Mixed, // Optional additional details for the history entry
}, { _id: false });

const AlertSchema = new mongoose.Schema({
    title: { type: String, required: [true, 'Alert title is required'], trim: true },
    description: { type: String, trim: true },
    severity: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical', 'Informational'],
        default: 'Medium',
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: ['New', 'Acknowledged', 'Investigating', 'Resolved', 'Closed', 'FalsePositive'],
        default: 'New',
        required: true,
        index: true,
    },
    policyTriggered: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy', index: true },
    userInvolved: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }], // Can be multiple users
    dataSnapshot: { type: mongoose.Schema.Types.Mixed }, // Snapshot of relevant data at the time of alert
    source: { type: String, trim: true }, // e.g., 'Endpoint Agent', 'Network Sensor', 'Cloud Service X'
    tags: [{ type: String, trim: true, lowercase: true }],
    notes: [{
        text: String,
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }],
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, default: null }, // User assigned to handle this alert
    incidentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident', index: true, default: null }, // Link to an incident if one is created
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // User who manually generated it, or null for system
    history: [AlertHistorySchema],
    timestamp: { type: Date, default: Date.now, index: true }, // When the alert was generated/occurred
}, { timestamps: true }); // Adds createdAt and updatedAt

// Example: Auto-add history entry on status change
AlertSchema.pre('save', function(next) {
    if (this.isModified('status') && !this.isNew) {
        this.history.push({
            // user: this.updatedBy, // if you track updatedBy directly on the model
            action: `Status changed to ${this.status}`,
            timestamp: new Date()
        });
    }
    next();
});


module.exports = mongoose.model('Alert', AlertSchema);