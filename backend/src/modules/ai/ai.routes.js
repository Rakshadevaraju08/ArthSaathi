const express = require('express');
const router = express.Router();
const aiController = require('./ai.controller');
const protect = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { analysisSchema } = require('./ai.validation');

// Target Implementation: POST /api/v1/ai/analyze
router.post('/analyze', protect, validate(analysisSchema), aiController.analyzeInput);

module.exports = router;