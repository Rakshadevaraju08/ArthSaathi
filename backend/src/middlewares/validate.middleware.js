const ApiResponse = require('../utils/apiResponse');

/**
 * Simple structural validation middleware. 
 * Replaces heavy external dependencies with a lightweight checklist for speedy hackathon iterations.
 */
function validate(requiredFields, source = 'body') {
  return (req, res, next) => {
    const missingFields = [];
    requiredFields.forEach(field => {
      if (!req[source] || req[source][field] === undefined || req[source][field] === null) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return ApiResponse.error(
        res, 
        `Validation Failed: Missing fields [${missingFields.join(', ')}]`, 
        400
      );
    }
    next();
  };
}

module.exports = validate;