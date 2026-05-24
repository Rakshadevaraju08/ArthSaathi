// src/modules/transactions/transactions.controller.js

const transactionsService = require("./transactions.service");
const { sendSuccess, sendError } = require("../../utils/apiResponse");

/**
 * POST /api/transactions
 */
const addTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionsService.addTransaction(req.user.id, req.body);
    return sendSuccess(res, "Transaction added successfully.", transaction, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/transactions
 */
const getAllTransactions = async (req, res, next) => {
  try {
    const filters = {
      type: req.query.type,
      category: req.query.category,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const transactions = await transactionsService.getAllTransactions(req.user.id, filters);
    return sendSuccess(res, "Transactions fetched successfully.", transactions);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/transactions/:id
 */
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await transactionsService.getTransactionById(
      req.user.id,
      req.params.id
    );
    return sendSuccess(res, "Transaction fetched successfully.", transaction);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/transactions/:id
 */
const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionsService.updateTransaction(
      req.user.id,
      req.params.id,
      req.body
    );
    return sendSuccess(res, "Transaction updated successfully.", transaction);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/transactions/:id
 */
const deleteTransaction = async (req, res, next) => {
  try {
    await transactionsService.deleteTransaction(req.user.id, req.params.id);
    return sendSuccess(res, "Transaction deleted successfully.", null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};