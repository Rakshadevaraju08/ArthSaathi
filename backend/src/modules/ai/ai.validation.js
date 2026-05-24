// src/modules/ai/ai.validation.js
// Validation rules for AI endpoints

const { body } = require("express-validator");

const financialGuidanceValidation = [
  body("query")
    .trim()
    .notEmpty()
    .withMessage("Query text is required.")
    .isLength({ min: 5, max: 1000 })
    .withMessage("Query must be between 5 and 1000 characters."),

  body("language")
    .optional()
    .isIn(["en", "hi", "kn", "te", "ta", "mr"])
    .withMessage("Unsupported language code."),
];

const scamDetectionValidation = [
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message text is required.")
    .isLength({ min: 5, max: 2000 })
    .withMessage("Message must be between 5 and 2000 characters."),
];

const loanAnalysisValidation = [
  body("loanAmount")
    .notEmpty()
    .withMessage("Loan amount is required.")
    .isFloat({ min: 1 })
    .withMessage("Loan amount must be a positive number."),

  body("interestRate")
    .notEmpty()
    .withMessage("Interest rate is required.")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Interest rate must be between 0 and 100."),

  body("tenureMonths")
    .notEmpty()
    .withMessage("Tenure in months is required.")
    .isInt({ min: 1 })
    .withMessage("Tenure must be a positive integer."),

  body("monthlyIncome")
    .notEmpty()
    .withMessage("Monthly income is required.")
    .isFloat({ min: 1 })
    .withMessage("Monthly income must be a positive number."),
];

module.exports = {
  financialGuidanceValidation,
  scamDetectionValidation,
  loanAnalysisValidation,
};