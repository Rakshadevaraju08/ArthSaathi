// src/modules/profile/profile.validation.js
const { body } = require('express-validator');

// Shared base validations
const baseProfileValidation = [
  body('occupation')
    .notEmpty().withMessage('Occupation is required.'),

  body('monthlyIncome')
    .optional()
    .isNumeric().withMessage('Monthly income must be a number.'),

  body('monthlyExpenses')
    .optional()
    .isNumeric().withMessage('Monthly expenses must be a number.'),

  body('repaymentHabit')
    .optional()
    .isIn(['always_on_time', 'sometimes_late', 'often_late', 'defaulted', 'no_loans_yet'])
    .withMessage('Invalid repayment habit value.'),
];

const farmerProfileValidation = [
  ...baseProfileValidation,

  body('crops')
    .optional()
    .isArray().withMessage('Crops must be an array.'),

  body('inputCost')
    .optional()
    .isNumeric().withMessage('Input cost must be a number.'),
];

const shopProfileValidation = [
  ...baseProfileValidation,

  body('investmentAmount')
    .optional()
    .isNumeric().withMessage('Investment amount must be a number.'),

  body('inventoryCycle')
    .optional()
    .isNumeric().withMessage('Inventory cycle must be a number.'),
];

const tailorProfileValidation = [
  ...baseProfileValidation,

  body('machineryCount')
    .optional()
    .isNumeric().withMessage('Machinery count must be a number.'),

  body('weeklyStitchCapacity')
    .optional()
    .isNumeric().withMessage('Weekly stitch capacity must be a number.'),
];

const genericProfileValidation = [
  ...baseProfileValidation,

  body('workingDaysPerMonth')
    .optional()
    .isNumeric().withMessage('Working days must be a number.'),

  body('employmentStability')
    .optional()
    .isIn(['stable', 'seasonal', 'irregular'])
    .withMessage('Invalid employment stability value.'),
];

module.exports = {
  farmerProfileValidation,
  shopProfileValidation,
  tailorProfileValidation,
  genericProfileValidation,
};