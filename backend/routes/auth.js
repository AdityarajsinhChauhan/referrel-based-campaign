const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Referral = require('../models/Referral');
const Customer = require('../models/Customer');
const BusinessProfile = require('../models/BusinessProfile');
const Campaign = require('../models/Campaign');

// Email/Password Signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, referralCode } = req.body;
        console.log(req.body.referralCode);

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: 'user'
        });

        await user.save();

        // If referral code exists, process it
        if (referralCode) {
            const referral = await Referral.findOne({ referralCode });
            if (referral) {
                // Get the campaign to find the business
                const campaign = await Campaign.findById(referral.campaignId);
                if (campaign) {
                    // Create customer record
                    const customer = new Customer({
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

                    // Add conversion with customer ID
                    referral.conversions.push({
                        referredCustomerId: customer._id,
                        timestamp: new Date(),
                        status: 'completed'
                    });
                    await referral.save();
                }
            }
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error in signup', error: error.message });
    }
});

// Email/Password Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error in login', error: error.message });
    }
});

// Google OAuth routes
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Generate JWT token
        const token = jwt.sign(
            { id: req.user.id, email: req.user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
    }
);

// Check current user
router.get('/current-user', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json(req.user);
});

// Logout route
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect(process.env.FRONTEND_URL);
});

module.exports = router; 