const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

async function connectDB() {
  try {
    await prisma.$connect();
    logger.info('🐘 PostgreSQL Database connected successfully via Prisma ORM.');
  } catch (error) {
    logger.error('❌ Database connection failure:', error);
    process.exit(1);
  }
}

module.exports = { prisma, connectDB };