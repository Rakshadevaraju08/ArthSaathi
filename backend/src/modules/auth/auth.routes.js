const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const validate = require('../../middlewares/validate.middleware');
const { loginSchema } = require('./auth.validation');

// Target Implementation: POST /api/v1/auth/login
router.post('/login', validate(loginSchema), authController.login);

module.exports = router;