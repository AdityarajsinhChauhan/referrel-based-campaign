const mongoose = require('mongoose');

const businessProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    businessName: {
        type: String,
        required: true
    },
    industry: String,
    website: String,
    zapierIntegration: {
        isConnected: {
            type: Boolean,
            default: false
        },
        webhookUrl: String,
        apiKey: String,
        lastSync: Date,
        syncStatus: {
            type: String,
            enum: ['active', 'failed', 'pending', 'inactive'],
            default: 'inactive'
        }
    },
    customers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

businessProfileSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('BusinessProfile', businessProfileSchema); 