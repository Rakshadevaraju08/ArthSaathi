const env = require('../config/environment');
const ApiResponse = require('../utils/apiResponse');

/**
 * Catches all unhandled or intentionally thrown errors within processing layers.
 */
function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Custom structure logging logic internally
  console.error(`[Execution Error Exception]: ${err.message}`);
  if (err.stack) console.error(err.stack);

  return ApiResponse.error(
    res, 
    err.message || 'Internal Server Error Fallback', 
    statusCode,
    env.NODE_ENV === 'development' ? { stack: err.stack } : null
  );
}

module.exports = errorHandler;