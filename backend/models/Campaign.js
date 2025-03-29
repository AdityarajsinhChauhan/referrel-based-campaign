const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BusinessProfile',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    taskType: {
        type: String,
        required: true,
        enum: ['review', 'purchase', 'form', 'other']
    },
    taskDescription: {
        type: String,
        required: true
    },
    rewardType: {
        type: String,
        required: true,
        enum: ['discount', 'cashback', 'gift', 'other']
    },
    rewardValue: {
        type: Number,
        required: true
    },
    rewardDetails: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    notificationMessage: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'active', 'paused', 'completed'],
        default: 'draft'
    },
    totalReferrals: {
        type: Number,
        default: 0
    },
    totalRewardsGiven: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

campaignSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Campaign', campaignSchema); 