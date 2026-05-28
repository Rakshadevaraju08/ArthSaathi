// src/modules/users/users.controller.js

const usersService = require('./users.service');
const { sendSuccess } = require('../../utils/apiResponse');

/**
 * GET /api/users/me
 */
const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, 'User fetched successfully.', req.user);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/profile
 * Update basic user fields: name, language, village, district
 */
const updateProfile = async (req, res, next) => {
  try {
    const updated = await usersService.updateProfile(req.user.id, req.body);
    return sendSuccess(res, 'Profile updated successfully.', updated);
  } catch (error) {
    next(error);
  }
};

module.exports = { getMe, updateProfile };