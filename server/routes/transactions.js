const express = require("express");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all transactions for a user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.userId,
    }).populate("categoryId", "name");
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add new transaction
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { description, amount, categoryId } = req.body;
    if (!description || !amount)
      return res
        .status(400)
        .json({ message: "Description and amount required" });

    const transaction = new Transaction({
      description,
      amount,
      categoryId,
      userId: req.userId,
    });
    await transaction.save();

    res.status(201).json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
