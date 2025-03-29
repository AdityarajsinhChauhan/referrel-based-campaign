const router = require('express').Router();
const BusinessProfile = require('../models/BusinessProfile');
const Customer = require('../models/Customer');
const { isAuthenticated } = require('../middleware/auth');

// Get business profile
router.get('/profile', isAuthenticated, async (req, res) => {
    try {
        let profile = await BusinessProfile.findOne({ userId: req.user.id });
        if (!profile) {
            return res.status(404).json({ message: 'Business profile not found' });
        }
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create/Update business profile
router.post('/profile', isAuthenticated, async (req, res) => {
    try {
        const { businessName, industry, website } = req.body;
        let profile = await BusinessProfile.findOne({ userId: req.user.id });

        if (profile) {
            profile.businessName = businessName;
            profile.industry = industry;
            profile.website = website;
        } else {
            profile = new BusinessProfile({
                userId: req.user.id,
                businessName,
                industry,
                website
            });
        }

        await profile.save();
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all customers for a business
router.get('/customers', isAuthenticated, async (req, res) => {
    try {
        const profile = await BusinessProfile.findOne({ userId: req.user.id });
        if (!profile) {
            return res.status(404).json({ message: 'Business profile not found' });
        }

        const customers = await Customer.find({ businessId: profile._id });
        res.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Connect Zapier
router.post('/zapier/connect', isAuthenticated, async (req, res) => {
    try {
        const { webhookUrl, apiKey } = req.body;
        const profile = await BusinessProfile.findOne({ userId: req.user.id });

        if (!profile) {
            return res.status(404).json({ message: 'Business profile not found' });
        }

        profile.zapierIntegration = {
            isConnected: true,
            webhookUrl,
            apiKey,
            lastSync: new Date(),
            syncStatus: 'active'
        };

        await profile.save();
        res.json({ message: 'Zapier integration successful', profile });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router; 