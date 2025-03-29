const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
        required: true
    },
    referrerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    referralCode: {
        type: String,
        required: true,
        unique: true
    },
    clicks: [{
        timestamp: {
            type: Date,
            default: Date.now
        },
        ipAddress: String,
        userAgent: String
    }],
    conversions: [{
        referredCustomerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer'
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'rejected'],
            default: 'pending'
        },
        rewardClaimed: {
            type: Boolean,
            default: false
        },
        taskCompletedAt: Date,
        taskCompletionProof: String, // URL or description of proof
        rewardClaimedAt: Date,
        rewardAmount: Number,
        rewardType: {
            type: String,
            enum: ['discount', 'cashback', 'gift', 'other']
        }
    }],
    totalClicks: {
        type: Number,
        default: 0
    },
    totalConversions: {
        type: Number,
        default: 0
    },
    totalRewardsClaimed: {
        type: Number,
        default: 0
    },
    totalRewardsAmount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastClickAt: Date,
    lastConversionAt: Date
});

// Index for quick lookups
referralSchema.index({ referralCode: 1 });
referralSchema.index({ campaignId: 1, referrerId: 1 });

// Update totals when new clicks or conversions are added
referralSchema.pre('save', function(next) {
    if (this.isModified('clicks')) {
        this.totalClicks = this.clicks.length;
        this.lastClickAt = this.clicks[this.clicks.length - 1]?.timestamp;
    }
    if (this.isModified('conversions')) {
        this.totalConversions = this.conversions.length;
        this.lastConversionAt = this.conversions[this.conversions.length - 1]?.timestamp;
        
        // Update reward totals
        this.totalRewardsClaimed = this.conversions.filter(c => c.rewardClaimed).length;
        this.totalRewardsAmount = this.conversions.reduce((sum, c) => sum + (c.rewardClaimed ? (c.rewardAmount || 0) : 0), 0);
    }
    next();
});

const Referral = mongoose.model('Referral', referralSchema);

module.exports = Referral; 