const jwt = require('jsonwebtoken');
const env = require('../config/environment');
const ApiResponse = require('../utils/apiResponse');

/**
 * Validates requests requesting protected actions via stateless Bearer Tokens.
 */
function protect(req, res, next) {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    return next(new Error('Access Denied: Missing Bearer Token'));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    // Bind context information safely into processing thread request object
    req.user = { id: decoded.id, phoneNumber: decoded.phoneNumber };
    next();
  } catch (error) {
    res.status(401);
    return next(new Error('Access Denied: Token Signature Mismatch'));
  }
}

module.exports = protect;