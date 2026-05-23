const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const protect = require('../../middlewares/auth.middleware');

// Target Implementation: GET /api/v1/dashboard (Secured Route Layer)
router.get('/', protect, dashboardController.getSummary);

module.exports = router;