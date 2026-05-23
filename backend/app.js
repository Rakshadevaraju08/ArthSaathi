/**
 * Express Application Configuration. 
 * Configures global middlewares, base routing matrices, and centralized error handling hooks.
 */
const express = require('express');
const cors = require('cors');
const morganMiddleware = require('./src/middlewares/logger.middleware');
const errorHandler = require('./src/middlewares/error.middleware');
const apiRouter = require('./src/routes');

const app = express();

// Global Middleware pipeline
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morganMiddleware); // Request logging

// Base Routing Pipeline with strict Versioning
app.use('/api/v1', apiRouter);

// Global 404 Route handling fallback
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Centralized Error Handling Middleware Interceptor
app.use(errorHandler);

module.exports = app;