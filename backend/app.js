// app.js
// Express application setup — middleware stack + routes

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const loggerMiddleware = require("./src/middlewares/logger.middleware");
const errorMiddleware = require("./src/middlewares/error.middleware");
const routes = require("./src/routes/index");

const app = express();

// ─────────────────────────────────────────
// SECURITY MIDDLEWARES
// ─────────────────────────────────────────
app.use(helmet()); // Set security HTTP headers
app.use(
  cors({
    origin: "*", // In production, restrict to your frontend domain
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─────────────────────────────────────────
// BODY PARSERS
// ─────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─────────────────────────────────────────
// HTTP LOGGER
// ─────────────────────────────────────────
app.use(loggerMiddleware);

// ─────────────────────────────────────────
// STATIC FILES (uploaded documents served statically)
// ─────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────
app.use("/api", routes);

// ─────────────────────────────────────────
// 404 HANDLER — unmatched routes
// ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ─────────────────────────────────────────
// GLOBAL ERROR HANDLER (must be last)
// ─────────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;