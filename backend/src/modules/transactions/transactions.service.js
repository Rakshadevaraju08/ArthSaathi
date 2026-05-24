// src/modules/transactions/transactions.service.js
// CRUD operations for transactions

const prisma = require("../../config/db");

/**
 * Add a new transaction
 */
const addTransaction = async (userId, { amount, type, category, note, date }) => {
  const transaction = await prisma.transaction.create({
    data: {
      userId,
      amount: parseFloat(amount),
      type,
      category,
      note: note || null,
      date: date ? new Date(date) : new Date(),
    },
  });

  return transaction;
};

/**
 * Get all transactions for a user
 * Supports optional filters: type, category, startDate, endDate
 */
const getAllTransactions = async (userId, filters = {}) => {
  const where = { userId };

  if (filters.type) where.type = filters.type;
  if (filters.category) where.category = { contains: filters.category, mode: "insensitive" };

  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) where.date.gte = new Date(filters.startDate);
    if (filters.endDate) where.date.lte = new Date(filters.endDate);
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: "desc" },
  });

  return transactions;
};

/**
 * Get a single transaction by ID (must belong to user)
 */
const getTransactionById = async (userId, transactionId) => {
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, userId },
  });

  if (!transaction) {
    const error = new Error("Transaction not found.");
    error.statusCode = 404;
    throw error;
  }

  return transaction;
};

/**
 * Update a transaction
 */
const updateTransaction = async (userId, transactionId, updateData) => {
  // First check ownership
  await getTransactionById(userId, transactionId);

  const allowedFields = ["amount", "type", "category", "note", "date"];
  const filteredData = {};

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      filteredData[field] = field === "amount"
        ? parseFloat(updateData[field])
        : field === "date"
        ? new Date(updateData[field])
        : updateData[field];
    }
  });

  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: filteredData,
  });

  return updated;
};

/**
 * Delete a transaction
 */
const deleteTransaction = async (userId, transactionId) => {
  // First check ownership
  await getTransactionById(userId, transactionId);

  await prisma.transaction.delete({ where: { id: transactionId } });

  return { deleted: true };
};

module.exports = {
  addTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};