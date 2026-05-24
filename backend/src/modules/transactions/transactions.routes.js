// src/modules/transactions/transactions.routes.js

const express = require("express");
const router = express.Router();

const transactionsController = require("./transactions.controller");
const authMiddleware = require("../../middlewares/auth.middleware");

// All transaction routes are protected
router.use(authMiddleware);

// POST /api/transactions
router.post("/", transactionsController.addTransaction);

// GET /api/transactions
router.get("/", transactionsController.getAllTransactions);

// GET /api/transactions/:id
router.get("/:id", transactionsController.getTransactionById);

// PUT /api/transactions/:id
router.put("/:id", transactionsController.updateTransaction);

// DELETE /api/transactions/:id
router.delete("/:id", transactionsController.deleteTransaction);

module.exports = router;