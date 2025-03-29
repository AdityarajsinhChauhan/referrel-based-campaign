const express = require('express');
const router = express.Router();
const Integration = require('../models/Integration');
const Contact = require('../models/Contact');
const { isAuthenticated } = require('../middleware/auth');
const axios = require('axios');

// Get all integrations for a business
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const integrations = await Integration.find({ businessId: req.user.id });
        res.json(integrations);
    } catch (error) {
        console.error('Error fetching integrations:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new integration
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { type, name, config } = req.body;

        // Validate the integration type
        if (!['zapier', 'hubspot', 'salesforce'].includes(type)) {
            return res.status(400).json({ message: 'Invalid integration type' });
        }

        const integration = new Integration({
            businessId: req.user.id,
            type,
            name,
            config
        });

        await integration.save();
        res.status(201).json(integration);
    } catch (error) {
        console.error('Error creating integration:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Sync contacts from Zapier
router.post('/:id/sync', isAuthenticated, async (req, res) => {
    try {
        const integration = await Integration.findOne({
            _id: req.params.id,
            businessId: req.user.id
        });

        if (!integration) {
            return res.status(404).json({ message: 'Integration not found' });
        }

        // Update sync status
        integration.metadata.lastSyncStatus = 'in_progress';
        await integration.save();

        // Fetch contacts from Zapier webhook
        const response = await axios.get(integration.config.webhookUrl, {
            headers: {
                'Authorization': `Bearer ${integration.config.apiKey}`
            }
        });

        const contacts = response.data;

        // Process each contact
        for (const contactData of contacts) {
            await Contact.findOneAndUpdate(
                {
                    businessId: req.user.id,
                    integrationId: integration._id,
                    externalId: contactData.id
                },
                {
                    name: contactData.name,
                    email: contactData.email,
                    phone: contactData.phone,
                    tags: contactData.tags,
                    metadata: {
                        source: integration.type,
                        lastInteraction: new Date(),
                        customFields: contactData.custom_fields
                    }
                },
                { upsert: true, new: true }
            );
        }

        // Update integration metadata
        integration.metadata.contactsCount = await Contact.countDocuments({
            businessId: req.user.id,
            integrationId: integration._id
        });
        integration.metadata.lastSyncStatus = 'success';
        integration.config.lastSync = new Date();
        await integration.save();

        res.json({
            message: 'Contacts synced successfully',
            contactsCount: integration.metadata.contactsCount
        });
    } catch (error) {
        console.error('Error syncing contacts:', error);
        
        // Update integration status on error
        if (req.params.id) {
            try {
                await Integration.findByIdAndUpdate(req.params.id, {
                    'metadata.lastSyncStatus': 'failed',
                    'metadata.errorMessage': error.message
                });
            } catch (updateError) {
                console.error('Error updating integration status:', updateError);
            }
        }

        res.status(500).json({ message: 'Error syncing contacts', error: error.message });
    }
});

// Get contacts for a business
router.get('/contacts', isAuthenticated, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        const query = {
            businessId: req.user.id
        };

        if (search) {
            query.$or = [
                { name: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') }
            ];
        }

        const contacts = await Contact.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Contact.countDocuments(query);

        res.json({
            contacts,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit
            }
        });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete integration
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const integration = await Integration.findOne({
            _id: req.params.id,
            businessId: req.user.id
        });

        if (!integration) {
            return res.status(404).json({ message: 'Integration not found' });
        }

        // Delete all associated contacts
        await Contact.deleteMany({
            businessId: req.user.id,
            integrationId: integration._id
        });

        // Delete the integration
        await integration.delete();

        res.json({ message: 'Integration deleted successfully' });
    } catch (error) {
        console.error('Error deleting integration:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 