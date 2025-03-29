const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    type: {
        type: String,
        enum: ['zapier', 'hubspot', 'salesforce'],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    config: {
        apiKey: String,
        webhookUrl: String,
        lastSync: Date,
        status: {
            type: String,
            enum: ['active', 'inactive', 'error'],
            default: 'inactive'
        }
    },
    metadata: {
        contactsCount: {
            type: Number,
            default: 0
        },
        lastSyncStatus: {
            type: String,
            enum: ['success', 'failed', 'in_progress'],
            default: 'in_progress'
        },
        errorMessage: String
    }
}, {
    timestamps: true
});

// Index for faster queries
integrationSchema.index({ businessId: 1, type: 1 });

const Integration = mongoose.model('Integration', integrationSchema);

module.exports = Integration; 