const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    integrationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Integration',
        required: true
    },
    externalId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: String,
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    tags: [String],
    metadata: {
        source: String,
        lastInteraction: Date,
        customFields: mongoose.Schema.Types.Mixed
    },
    referralCode: {
        type: String,
        sparse: true
    }
}, {
    timestamps: true
});

// Indexes for faster queries
contactSchema.index({ businessId: 1, email: 1 });
contactSchema.index({ integrationId: 1, externalId: 1 });
contactSchema.index({ referralCode: 1 }, { sparse: true });

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact; 