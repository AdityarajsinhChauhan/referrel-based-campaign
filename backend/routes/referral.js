const router = require('express').Router();
const Referral = require('../models/Referral');
const Campaign = require('../models/Campaign');
const Customer = require('../models/Customer');
const { isAuthenticated } = require('../middleware/auth');
const crypto = require('crypto');
const User = require('../models/User');
const BusinessProfile = require('../models/BusinessProfile');

// Generate a unique referral code
const generateReferralCode = async () => {
    let code;
    let isUnique = false;
    
    while (!isUnique) {
        // Generate a random 8-character code
        code = crypto.randomBytes(4).toString('hex');
        // Check if it's unique
        const existing = await Referral.findOne({ referralCode: code });
        if (!existing) {
            isUnique = true;
        }
    }
    
    return code;
};

// Generate a referral link for a customer
router.post('/generate', isAuthenticated, async (req, res) => {
    try {
        const { campaignId, customerId } = req.body;

        // Validate campaign and customer
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Check if referral link already exists
        let referral = await Referral.findOne({ campaignId, referrerId: customerId });
        
        if (!referral) {
            // Generate new referral link
            const referralCode = await generateReferralCode();
            
            referral = new Referral({
                campaignId,
                referrerId: customerId,
                referralCode
            });
            
            await referral.save();
        }

        res.json({
            referralCode: referral.referralCode,
            referralUrl: `${process.env.FRONTEND_URL}/r/${referral.referralCode}`,
            stats: {
                clicks: referral.totalClicks,
                conversions: referral.totalConversions
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Track referral link click
router.get('/track/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const referral = await Referral.findOne({ referralCode: code });

        if (!referral) {
            return res.status(404).json({ message: 'Referral link not found' });
        }

        // Record click with IP and user agent
        referral.clicks.push({
            timestamp: new Date(),
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });

        await referral.save();

        // Get campaign details
        const campaign = await Campaign.findById(referral.campaignId);
        
        res.json({
            campaign: {
                name: campaign.name,
                taskType: campaign.taskType,
                taskDescription: campaign.taskDescription,
                rewardType: campaign.rewardType,
                rewardValue: campaign.rewardValue
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Record a conversion
router.post('/convert/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const { referredCustomerId } = req.body;

        if (!referredCustomerId) {
            return res.status(400).json({ message: 'referredCustomerId is required' });
        }

        const referral = await Referral.findOne({ referralCode: code });
        if (!referral) {
            return res.status(404).json({ message: 'Referral link not found' });
        }

        // Get the campaign to find the business
        const campaign = await Campaign.findById(referral.campaignId);
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        // Try to find existing customer or user
        let customer = await Customer.findById(referredCustomerId);
        
        if (!customer) {
            // If not a customer ID, check if it's a user ID
            const user = await User.findById(referredCustomerId);
            if (user) {
                // Create a customer record for the user
                customer = new Customer({
                    businessId: campaign.businessId,
                    email: user.email,
                    name: user.name,
                    source: 'referral',
                    status: 'active'
                });
                await customer.save();

                // Add customer to business profile
                await BusinessProfile.findOneAndUpdate(
                    { userId: campaign.businessId },
                    { $push: { customers: customer._id } }
                );
            } else {
                return res.status(404).json({ message: 'Neither customer nor user found with provided ID' });
            }
        }

        // Check if this customer has already been converted
        const existingConversion = referral.conversions.find(
            conv => conv.referredCustomerId && conv.referredCustomerId.toString() === customer._id.toString()
        );
        if (existingConversion) {
            return res.status(400).json({ message: 'This customer has already been converted' });
        }

        // Add conversion record with the customer ID
        referral.conversions.push({
            referredCustomerId: customer._id,
            timestamp: new Date(),
            status: 'pending'
        });

        await referral.save();

        // Update campaign stats
        await Campaign.findByIdAndUpdate(referral.campaignId, {
            $inc: { totalReferrals: 1 }
        });

        res.json({ message: 'Conversion recorded successfully' });
    } catch (error) {
        console.error('Error recording conversion:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get referral stats for a campaign
router.get('/stats/:campaignId', isAuthenticated, async (req, res) => {
    try {
        const { campaignId } = req.params;
        console.log('Fetching stats for campaign:', campaignId);
        console.log('Authenticated user:', req.user);

        // Verify campaign exists and belongs to user
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            console.log('Campaign not found');
            return res.status(404).json({ message: 'Campaign not found' });
        }

        if (campaign.businessId.toString() !== req.user.id) {
            console.log('Campaign does not belong to user');
            console.log('Campaign businessId:', campaign.businessId);
            console.log('User ID:', req.user.id);
            return res.status(403).json({ message: 'Not authorized to access this campaign' });
        }
        
        // First get all referrals with populated data
        const referrals = await Referral.find({ campaignId })
            .populate('referrerId', 'name email')
            .populate({
                path: 'conversions.referredCustomerId',
                model: 'Customer',
                select: 'name email'
            })
            .select('referralCode totalClicks totalConversions createdAt conversions');
        
        console.log('Found referrals:', JSON.stringify(referrals, null, 2));

        // For conversions without customer data, try to find user data
        for (const referral of referrals) {
            for (const conversion of referral.conversions) {
                console.log('Processing conversion:', conversion);
                if (!conversion.referredCustomerId) {
                    // If we have a referredCustomerId but it's not populated, try to find the customer directly
                    if (conversion._doc && conversion._doc.referredCustomerId) {
                        const customer = await Customer.findById(conversion._doc.referredCustomerId);
                        if (customer) {
                            console.log('Found customer:', customer);
                            conversion.referredCustomerId = customer;
                        }
                    }
                }
            }
        }

        const stats = {
            totalReferrals: referrals.length,
            totalClicks: referrals.reduce((sum, ref) => sum + ref.totalClicks, 0),
            totalConversions: referrals.reduce((sum, ref) => sum + ref.conversions.length, 0),
            referrals: referrals.map(ref => ({
                referralCode: ref.referralCode,
                referrer: ref.referrerId,
                clicks: ref.totalClicks,
                conversions: ref.conversions.length,
                convertedUsers: ref.conversions.map(conv => {
                    console.log('Mapping conversion:', conv);
                    return {
                        user: {
                            name: conv.referredCustomerId?.name || 'Unknown User',
                            email: conv.referredCustomerId?.email || ''
                        },
                        status: conv.status,
                        timestamp: conv.timestamp,
                        rewardClaimed: conv.rewardClaimed
                    };
                }),
                createdAt: ref.createdAt
            }))
        };

        console.log('Sending stats:', JSON.stringify(stats, null, 2));
        res.json(stats);
    } catch (error) {
        console.error('Error in stats endpoint:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Mark task as completed
router.post('/complete-task/:code', isAuthenticated, async (req, res) => {
    try {
        const { code } = req.params;
        const { conversionId, taskCompletionProof } = req.body;

        const referral = await Referral.findOne({ referralCode: code });
        if (!referral) {
            return res.status(404).json({ message: 'Referral not found' });
        }

        // Find the specific conversion
        const conversion = referral.conversions.id(conversionId);
        if (!conversion) {
            return res.status(404).json({ message: 'Conversion not found' });
        }

        // Get campaign to verify task requirements
        const campaign = await Campaign.findById(referral.campaignId);
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        // Update conversion status
        conversion.status = 'completed';
        conversion.taskCompletedAt = new Date();
        conversion.taskCompletionProof = taskCompletionProof;
        conversion.rewardAmount = campaign.rewardValue;
        conversion.rewardType = campaign.rewardType;

        await referral.save();

        res.json({ 
            message: 'Task marked as completed',
            conversion: {
                id: conversion._id,
                status: conversion.status,
                taskCompletedAt: conversion.taskCompletedAt,
                rewardAmount: conversion.rewardAmount,
                rewardType: conversion.rewardType
            }
        });
    } catch (error) {
        console.error('Error completing task:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Claim reward
router.post('/claim-reward/:code', isAuthenticated, async (req, res) => {
    try {
        const { code } = req.params;
        const { conversionId } = req.body;

        const referral = await Referral.findOne({ referralCode: code });
        if (!referral) {
            return res.status(404).json({ message: 'Referral not found' });
        }

        // Verify the referrer is making the request
        const customer = await Customer.findOne({ 
            _id: referral.referrerId,
            businessId: req.user.id
        });
        if (!customer) {
            return res.status(403).json({ message: 'Not authorized to claim this reward' });
        }

        // Count completed referrals for this customer in this campaign
        const completedReferrals = await Referral.aggregate([
            {
                $match: {
                    campaignId: referral.campaignId,
                    referrerId: customer._id
                }
            },
            {
                $project: {
                    completedConversions: {
                        $size: {
                            $filter: {
                                input: '$conversions',
                                as: 'conv',
                                cond: { 
                                    $and: [
                                        { $eq: ['$$conv.status', 'completed'] },
                                        { $eq: ['$$conv.rewardClaimed', false] }
                                    ]
                                }
                            }
                        }
                    }
                }
            }
        ]);

        const totalCompletedReferrals = completedReferrals.reduce((sum, ref) => sum + ref.completedConversions, 0);

        // Check if user has enough completed referrals
        if (totalCompletedReferrals < 3) {
            return res.status(400).json({ 
                message: 'Need at least 3 completed referrals to claim reward',
                currentCompleted: totalCompletedReferrals
            });
        }

        // Find the specific conversion
        const conversion = referral.conversions.id(conversionId);
        if (!conversion) {
            return res.status(404).json({ message: 'Conversion not found' });
        }

        // Verify task is completed
        if (conversion.status !== 'completed') {
            return res.status(400).json({ message: 'Task must be completed before claiming reward' });
        }

        // Verify reward hasn't been claimed already
        if (conversion.rewardClaimed) {
            return res.status(400).json({ message: 'Reward has already been claimed' });
        }

        // Mark reward as claimed
        conversion.rewardClaimed = true;
        conversion.rewardClaimedAt = new Date();

        await referral.save();

        // Update campaign stats
        await Campaign.findByIdAndUpdate(referral.campaignId, {
            $inc: { totalRewardsGiven: 1 }
        });

        res.json({ 
            message: 'Reward claimed successfully',
            reward: {
                amount: conversion.rewardAmount,
                type: conversion.rewardType,
                claimedAt: conversion.rewardClaimedAt
            }
        });
    } catch (error) {
        console.error('Error claiming reward:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get reward status
router.get('/reward-status/:code/:conversionId', isAuthenticated, async (req, res) => {
    try {
        const { code, conversionId } = req.params;

        const referral = await Referral.findOne({ referralCode: code })
            .populate('campaignId', 'name rewardType rewardValue')
            .populate('referrerId', 'name email');

        if (!referral) {
            return res.status(404).json({ message: 'Referral not found' });
        }

        const conversion = referral.conversions.id(conversionId);
        if (!conversion) {
            return res.status(404).json({ message: 'Conversion not found' });
        }

        res.json({
            campaign: referral.campaignId,
            referrer: referral.referrerId,
            status: conversion.status,
            taskCompletedAt: conversion.taskCompletedAt,
            rewardClaimed: conversion.rewardClaimed,
            rewardClaimedAt: conversion.rewardClaimedAt,
            rewardAmount: conversion.rewardAmount,
            rewardType: conversion.rewardType
        });
    } catch (error) {
        console.error('Error getting reward status:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router; 