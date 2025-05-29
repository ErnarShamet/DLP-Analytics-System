// backend/models/Policy.js
const mongoose = require('mongoose');

const PolicyConditionSchema = new mongoose.Schema({
  field: { type: String, required: true }, // e.g., 'content', 'filename', 'destination_ip', 'user_group'
    operator: {
        type: String,
        required: true,
        enum: ['contains', 'not_contains', 'matches_regex', 'not_matches_regex', 'equals', 'not_equals', 'is_one_of', 'is_not_one_of', 'greater_than', 'less_than', 'starts_with', 'ends_with']
    },
  value: mongoose.Schema.Types.Mixed, // Can be string, array of strings, number, boolean
  dataType: { type: String, enum: ['string', 'number', 'boolean', 'date', 'array_string'], default: 'string' } // Helps UI and validation
}, { _id: false });

const PolicyActionSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['alert', 'block', 'log', 'encrypt', 'notify_user', 'quarantine', 'require_justification']
    },
  parameters: mongoose.Schema.Types.Mixed, // e.g., for 'alert', { severity: 'High' }; for 'notify_user', { message_template_id: 'xyz' }
}, { _id: false });

const PolicySchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Policy name is required'], unique: true, trim: true },
    description: { type: String, trim: true },
    isEnabled: { type: Boolean, default: true, index: true },
    // Simple structure: array of conditions (AND logic by default within this group)
    conditions: [PolicyConditionSchema],
    // To support "ANY of these conditions" (OR logic), you might wrap conditions:
    // conditionLogic: { type: String, enum: ['ALL', 'ANY'], default: 'ALL' }, // For the top-level conditions array
    // For more complex "AND groups of OR conditions" or vice-versa, you might need:
    // conditionGroups: [{
    //    logic: { type: String, enum: ['ALL', 'ANY'], default: 'ALL'},
    //    conditions: [PolicyConditionSchema]
    // }],
    actions: [PolicyActionSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    version: { type: Number, default: 1 },
    tags: [{ type: String, trim: true, lowercase: true }],
    scope: { // To define where the policy applies, e.g., specific user groups, departments, endpoints
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        userGroups: [String], // Could be AD groups or internal app groups
        // Add other scoping criteria like 'endpoints', 'applications' etc.
    }
}, { timestamps: true });

PolicySchema.pre('save', function(next) {
    if (this.isModified() && !this.isNew) { // Increment version on update only if not a new doc
        this.version += 1;
    }
    this.updatedAt = Date.now(); // Ensure updatedAt is set on every save where modified
    next();
});

module.exports = mongoose.model('Policy', PolicySchema);