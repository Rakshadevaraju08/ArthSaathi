// src/modules/ai/ai.routes.js

const express = require("express");
const router = express.Router();

const aiController = require("./ai.controller");
const {
  financialGuidanceValidation,
  scamDetectionValidation,
  loanAnalysisValidation,
} = require("./ai.validation");
const validate = require("../../middlewares/validate.middleware");
const authMiddleware = require("../../middlewares/auth.middleware");

// All AI routes are protected
router.use(authMiddleware);

// POST /api/ai/financial-guidance
router.post(
  "/financial-guidance",
  financialGuidanceValidation,
  validate,
  aiController.financialGuidance
);

// POST /api/ai/scam-detection
router.post(
  "/scam-detection",
  scamDetectionValidation,
  validate,
  aiController.scamDetection
);

// POST /api/ai/loan-analysis
router.post(
  "/loan-analysis",
  loanAnalysisValidation,
  validate,
  aiController.loanAnalysis
);

module.exports = router;