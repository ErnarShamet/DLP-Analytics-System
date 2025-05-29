// backend/models/Incident.js
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now }
});

const IncidentHistorySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true }, // e.g., "Status changed to Investigating", "Priority changed to High"
    timestamp: { type: Date, default: Date.now },
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
}, { _id: false });


const IncidentSchema = new mongoose.Schema({
    title: { type: String, required: [true, 'Incident title is required'], trim: true },
    description: { type: String, required: [true, 'Incident description is required'], trim: true },
    status: {
        type: String,
        enum: ['Open', 'Investigating', 'Contained', 'Eradicated', 'Recovered', 'LessonsLearned', 'Closed', 'OnHold'],
        default: 'Open',
        required: true,
        index: true,
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium',
        required: true,
        index: true,
    },
    severity: { // Can be derived from alerts or set manually
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical', 'Informational'],
        default: 'Medium',
    },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, default: null },
    relatedAlerts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Alert' }],
    comments: [CommentSchema],
    tags: [{ type: String, trim: true, lowercase: true }],
    resolutionDetails: {
        summary: { type: String, trim: true },
        resolvedAt: { type: Date },
        resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        actionsTaken: [String]
    },
    impactAssessment: {
        businessImpact: String,
        technicalImpact: String,
        dataImpact: String, // e.g., type of data, volume
    },
    sourceOfIncident: String, // e.g., Phishing, Malware, Insider Threat, Misconfiguration
    detectionTime: { type: Date, default: Date.now }, // When the incident was first detected/reported
    containmentTime: Date,
    eradicationTime: Date,
    recoveryTime: Date,
    history: [IncidentHistorySchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true }); // Adds createdAt and updatedAt

IncidentSchema.pre('save', function(next) {
    if (this.isModified() && !this.isNew) {
        this.updatedBy = this.updatedBy || (this._update && this._update.$set && this._update.$set.updatedBy); // try to capture user if available in update context
        // Simplified history for now, can be more granular
        this.history.push({
            action: 'Incident updated',
            timestamp: new Date(),
            // user: this.updatedBy // Requires updatedBy to be consistently set
        });
    }
    if (this.isModified('status') && this.status === 'Resolved' && !this.resolutionDetails.resolvedAt) {
        this.resolutionDetails.resolvedAt = new Date();
        // this.resolutionDetails.resolvedBy = this.updatedBy; // Assuming updatedBy is the resolver
    }
    next();
});


module.exports = mongoose.model('Incident', IncidentSchema);
