// src/config/environment.js
// Centralizes and validates all environment variables

require("dotenv").config();

const environment = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  database: {
    url: process.env.DATABASE_URL,
  },

  jwt: {
    secret: process.env.JWT_SECRET || "fallback_secret_change_in_prod",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  ai: {
    serviceUrl: process.env.AI_SERVICE_URL || "http://localhost:8000",
  },

  upload: {
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || "10"),
    uploadDir: process.env.UPLOAD_DIR || "uploads",
  },
};

// Validate critical env variables
const required = ["DATABASE_URL", "JWT_SECRET"];
required.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

module.exports = environment;