// src/modules/ai/ai.controller.js

const aiService = require("./ai.service");
const { sendSuccess } = require("../../utils/apiResponse");

/**
 * POST /api/ai/financial-guidance
 */
const financialGuidance = async (req, res, next) => {
  try {
    const { query, language } = req.body;
    const result = await aiService.getFinancialGuidance(req.user.id, { query, language });
    return sendSuccess(res, "Financial guidance generated.", result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/scam-detection
 */
const scamDetection = async (req, res, next) => {
  try {
    const { message } = req.body;
    const result = await aiService.detectScam(req.user.id, { message });
    return sendSuccess(res, "Scam detection completed.", result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/loan-analysis
 */
const loanAnalysis = async (req, res, next) => {
  try {
    const { loanAmount, interestRate, tenureMonths, monthlyIncome } = req.body;
    const result = await aiService.analyzeLoan(req.user.id, {
      loanAmount,
      interestRate,
      tenureMonths,
      monthlyIncome,
    });
    return sendSuccess(res, "Loan analysis completed.", result);
  } catch (error) {
    next(error);
  }
};

module.exports = { financialGuidance, scamDetection, loanAnalysis };