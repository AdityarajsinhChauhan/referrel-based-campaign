const integrationRoutes = require('./routes/integration');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/integrations', integrationRoutes); 