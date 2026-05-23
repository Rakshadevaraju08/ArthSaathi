const express = require('express');
const router = express.Router();

// Placeholder route so Express doesn't crash
router.get('/', (req, res) => res.json({ message: "Users module ready" }));

module.exports = router; // <-- Make sure this line is exactly here!