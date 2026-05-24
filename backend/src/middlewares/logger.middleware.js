// src/middlewares/logger.middleware.js
// Morgan HTTP request logger piped into Winston

const morgan = require("morgan");
const logger = require("../utils/logger");

// Stream morgan output into winston
const stream = {
  write: (message) => logger.http(message.trim()),
};

const loggerMiddleware = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream }
);

module.exports = loggerMiddleware;