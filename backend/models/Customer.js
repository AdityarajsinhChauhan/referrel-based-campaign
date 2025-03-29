const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BusinessProfile',
        required: true
    },
    email: {
        type: String,
        required: true
    },
    name: String,
    phone: String,
    crmId: String, // Original ID from the CRM system
    source: {
        type: String,
        enum: ['zapier', 'manual', 'referral'],
        default: 'manual'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'active'
    },
    metadata: {
        type: Map,
        of: String
    },
    lastInteraction: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

customerSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Compound index to ensure unique customers per business
customerSchema.index({ businessId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema); 