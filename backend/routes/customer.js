const router = require('express').Router();
const Customer = require('../models/Customer');
const { isAuthenticated } = require('../middleware/auth');
const Campaign = require('../models/Campaign');
const Referral = require('../models/Referral');

// Add customer
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        // Validate required fields
        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }

        const newCustomer = new Customer({
            businessId: req.user.id, // Assuming req.user.id is the business ID
            name,
            email,
            phone,
            source: 'manual' // Set source to 'manual'
        });

        await newCustomer.save();
        res.status(201).json(newCustomer);
    } catch (error) {
        console.error('Error adding customer:', error); // Log the error for debugging
        res.status(400).json({ message: 'Error adding customer', error: error.message }); // Return error message
    }
});

// Get ongoing campaigns and referral link for the logged-in customer
router.get('/campaigns',isAuthenticated, async (req, res) => {
    try {
        const customer = await Customer.findOne({email: req.user.email});
        console.log(customer.businessId);
        // Fetch campaigns associated with the user's business
        const campaigns = await Campaign.find({ businessId: customer.businessId, status: 'active' });
       

        // Fetch the referral link for the user
        const referral = await Referral.findOne({ referrerId: req.user._id });

        res.json({
            campaigns,
            referralLink: referral ? referral.referralCode : null // Return referral code if exists
        });
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

module.exports = router; 