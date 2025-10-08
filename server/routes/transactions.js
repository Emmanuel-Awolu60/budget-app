// routes/transactions.js
const express = require("express");
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const Category = require("../models/Category"); // <-- added
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* helpers */
function thisMonthWindow() {
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  const next = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1)
  );
  return { start, next };
}

async function willExceedBudget({
  userId,
  categoryId,
  newAmount,
  excludeTxId = null,
}) {
  // Only check expenses with a valid category
  if (!categoryId || Number(newAmount) >= 0) return { exceed: false };

  const category = await Category.findOne({ _id: categoryId, userId });
  if (!category || !category.budget || category.budget <= 0) {
    return { exceed: false }; // no budget set → no enforcement
  }

  const { start, next } = thisMonthWindow();

  const match = {
    userId,
    categoryId: new mongoose.Types.ObjectId(categoryId),
    amount: { $lt: 0 },
    date: { $gte: start, $lt: next },
  };
  if (excludeTxId) {
    match._id = { $ne: new mongoose.Types.ObjectId(excludeTxId) };
  }

  const spentAgg = await Transaction.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const alreadySpent = spentAgg.length ? Math.abs(spentAgg[0].total) : 0;
  const newSpent = alreadySpent + Math.abs(Number(newAmount));

  return {
    exceed: newSpent > category.budget,
    alreadySpent,
    budget: category.budget,
    categoryName: category.name,
    wouldBecome: newSpent,
  };
}

// Get all transactions for a user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId })
      .populate("categoryId", "name budget")
      .sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add new transaction (with budget check)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { description, amount, categoryId, date } = req.body;
    if (!description || amount === undefined || amount === null) {
      return res
        .status(400)
        .json({ message: "Description and amount required" });
    }

    // Budget guard (only for expenses)
    const guard = await willExceedBudget({
      userId: req.userId,
      categoryId,
      newAmount: amount,
    });
    if (guard.exceed) {
      return res.status(400).json({
        message:
          `Budget exceeded for category "${guard.categoryName}". ` +
          `Budget: $${guard.budget}, spent: $${guard.alreadySpent}, ` +
          `this would become: $${guard.wouldBecome}.`,
      });
    }

    const transaction = new Transaction({
      description,
      amount: Number(amount),
      categoryId: categoryId || null,
      userId: req.userId,
      date: date ? new Date(date) : new Date(),
    });
    await transaction.save();
    await transaction.populate("categoryId", "name budget");

    res.status(201).json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update transaction (with budget check)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const tx = await Transaction.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!tx) return res.status(404).json({ message: "Transaction not found" });

    const nextDescription = req.body.description ?? tx.description;
    const nextAmount = req.body.amount ?? tx.amount;
    const nextCategoryId = req.body.categoryId ?? tx.categoryId;
    const nextDate = req.body.date ? new Date(req.body.date) : tx.date;

    // Budget guard (exclude current tx from the sum)
    const guard = await willExceedBudget({
      userId: req.userId,
      categoryId: nextCategoryId,
      newAmount: nextAmount,
      excludeTxId: tx._id,
    });
    if (guard.exceed) {
      return res.status(400).json({
        message:
          `Budget exceeded for category "${guard.categoryName}". ` +
          `Budget: $${guard.budget}, spent: $${guard.alreadySpent}, ` +
          `this would become: $${guard.wouldBecome}.`,
      });
    }

    tx.description = nextDescription;
    tx.amount = Number(nextAmount);
    tx.categoryId = nextCategoryId || null;
    tx.date = nextDate;

    await tx.save();
    await tx.populate("categoryId", "name budget");

    res.json(tx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete transaction
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!deleted)
      return res.status(404).json({ message: "Transaction not found" });
    res.json({ message: "Transaction deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
