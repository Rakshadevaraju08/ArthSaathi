const authService = require('./auth.service');
const ApiResponse = require('../../utils/apiResponse');

class AuthController {
  async login(req, res, next) {
    try {
      const { phoneNumber, mpin } = req.body;
      const result = await authService.authenticateUser(phoneNumber, mpin);
      return ApiResponse.success(res, 'Authentication successful', result, 200);
    } catch (error) {
      res.status(401); // Unauthorized
      next(error);
    }
  }
}

module.exports = new AuthController();