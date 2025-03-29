const router = require('express').Router();
const Campaign = require('../models/Campaign');
const { isAuthenticated } = require('../middleware/auth');

// Create campaign
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const campaign = new Campaign({
            ...req.body,
            businessId: req.user.id
        });
        await campaign.save();
        res.status(201).json(campaign);
    } catch (error) {
        res.status(400).json({ message: 'Error creating campaign', error: error.message });
    }
});

// Get all campaigns for a business
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const campaigns = await Campaign.find({ businessId: req.user.id })
            .sort({ createdAt: -1 });
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching campaigns', error: error.message });
    }
});

// Get single campaign
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const campaign = await Campaign.findOne({
            _id: req.params.id,
            businessId: req.user.id
        });
        
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }
        
        res.json(campaign);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching campaign', error: error.message });
    }
});

// Update campaign
router.put('/:id', isAuthenticated, async (req, res) => {
    try {
        const campaign = await Campaign.findOneAndUpdate(
            {
                _id: req.params.id,
                businessId: req.user.id
            },
            req.body,
            { new: true, runValidators: true }
        );

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        res.json(campaign);
    } catch (error) {
        res.status(400).json({ message: 'Error updating campaign', error: error.message });
    }
});

// Delete campaign
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const campaign = await Campaign.findOneAndDelete({
            _id: req.params.id,
            businessId: req.user.id
        });

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting campaign', error: error.message });
    }
});

module.exports = router; 