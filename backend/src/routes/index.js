const express = require('express');
const router = express.Router();

// Import structural sub-routers
const authRoutes = require('../modules/auth/auth.routes');
const dashboardRoutes = require('../modules/dashboard/dashboard.routes');
const aiRoutes = require('../modules/ai/ai.routes');
const usersRoutes = require('../modules/users/users.routes');
const transactionsRoutes = require('../modules/transactions/transactions.routes');
const rtcRoutes = require('../modules/rtc/rtc.routes');

// Connect Feature Modules to the Unified Engine Context Matrix
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/ai', aiRoutes);
router.use('/users', usersRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/rtc', rtcRoutes);

module.exports = router;