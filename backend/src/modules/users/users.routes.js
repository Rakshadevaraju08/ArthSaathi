// src/modules/users/users.routes.js

const express = require('express');
const router = express.Router();

const usersController = require('./users.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// All user routes are protected
router.use(authMiddleware);

// GET /api/users/me
router.get('/me', usersController.getMe);

// PUT /api/users/profile
router.put('/profile', usersController.updateProfile);

module.exports = router;