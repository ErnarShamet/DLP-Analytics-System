// backend/controllers/policyController.js
const Policy = require('../models/Policy');
const User = require('../models/User'); // For createdBy/updatedBy

// @desc    Get all policies
// @route   GET /api/policies
// @access  Private (Analyst, Admin)
exports.getPolicies = async (req, res, next) => {
    try {
        const policies = await Policy.find().populate('createdBy', 'username').populate('updatedBy', 'username').sort({ name: 1 });
        res.status(200).json({ success: true, count: policies.length, data: policies });
    } catch (error) {
        console.error("GetPolicies error:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get single policy
// @route   GET /api/policies/:id
// @access  Private (Analyst, Admin)
exports.getPolicy = async (req, res, next) => {
    try {
        const policy = await Policy.findById(req.params.id).populate('createdBy', 'username fullName').populate('updatedBy', 'username fullName');
        if (!policy) {
            return res.status(404).json({ success: false, error: `Policy not found with id of ${req.params.id}` });
        }
        res.status(200).json({ success: true, data: policy });
    } catch (error) {
        console.error("GetPolicy error:", error);
        if (error.kind === 'ObjectId') {
             return res.status(404).json({ success: false, error: `Policy not found with id of ${req.params.id}` });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Create policy
// @route   POST /api/policies
// @access  Private/Admin
exports.createPolicy = async (req, res, next) => {
    const { name, description, isEnabled, conditions, actions } = req.body;
    try {
        const policy = await Policy.create({
            name,
            description,
            isEnabled,
            conditions,
            actions,
            createdBy: req.user.id, // from protect middleware
            updatedBy: req.user.id
        });
        res.status(201).json({ success: true, data: policy, message: "Policy created successfully" });
    } catch (error) {
        console.error("CreatePolicy error:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages.join(', ') });
        }
        if (error.code === 11000) { // Duplicate key error for name
            return res.status(400).json({ success: false, error: 'Policy name already exists.' });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Update policy
// @route   PUT /api/policies/:id
// @access  Private/Admin
exports.updatePolicy = async (req, res, next) => {
    const { name, description, isEnabled, conditions, actions } = req.body;
    const updateFields = { name, description, isEnabled, conditions, actions, updatedBy: req.user.id };

    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);
    if(Object.keys(updateFields).length <= 1 && updateFields.updatedBy) { // only updatedBy
        return res.status(400).json({ success: false, error: 'No fields to update provided.' });
    }

    try {
        let policy = await Policy.findById(req.params.id);
        if (!policy) {
            return res.status(404).json({ success: false, error: `Policy not found with id of ${req.params.id}` });
        }

        // Ensure name uniqueness if changed
        if (name && name !== policy.name) {
            const existingPolicy = await Policy.findOne({ name: name, _id: { $ne: policy._id } });
            if (existingPolicy) {
                return res.status(400).json({ success: false, error: 'Another policy with this name already exists.' });
            }
        }
        
        // The pre-save hook in Policy.js handles version increment if not new and modified.
        // For findByIdAndUpdate, the hook might not run by default for version.
        // Let's update manually or ensure the hook works as expected.
        // Option 1: Fetch, modify, save (runs hooks)
        Object.assign(policy, updateFields);
        // policy.version +=1; // pre-save hook should do this
        const updatedPolicy = await policy.save();

        // Option 2: Use findByIdAndUpdate and manually increment version if needed (pre-save hook does this)
        // updateFields.$inc = { version: 1 }; // This can be tricky if other parts are also updated.
        // const updatedPolicy = await Policy.findByIdAndUpdate(req.params.id, updateFields, {
        // new: true,
        // runValidators: true
        // });

        res.status(200).json({ success: true, data: updatedPolicy, message: "Policy updated successfully" });
    } catch (error) {
        console.error("UpdatePolicy error:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages.join(', ') });
        }
        if (error.code === 11000) { // Duplicate key error for name
            return res.status(400).json({ success: false, error: 'Policy name already exists.' });
        }
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, error: `Policy not found with id of ${req.params.id}` });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete policy
// @route   DELETE /api/policies/:id
// @access  Private/Admin
exports.deletePolicy = async (req, res, next) => {
    try {
        const policy = await Policy.findById(req.params.id);
        if (!policy) {
            return res.status(404).json({ success: false, error: `Policy not found with id of ${req.params.id}` });
        }

        // Add pre-delete checks (e.g., if policy is active in alerts)
        await policy.deleteOne();

        res.status(200).json({ success: true, data: {}, message: "Policy deleted successfully" });
    } catch (error) {
        console.error("DeletePolicy error:", error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, error: `Policy not found with id of ${req.params.id}` });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
