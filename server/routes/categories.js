// routes/categories.js
const express = require("express");
const Category = require("../models/Category");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/** GET all categories for a user **/
router.get("/", authMiddleware, async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.userId });
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/** POST create new category **/

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, budget } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const category = new Category({
      name,
      budget: budget || 0,
      remaining: budget || 0,
      userId: req.userId,
    });

    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error("Error creating category:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/** PUT update category (name or budget) **/
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { name, budget } = req.body;
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    if (name) category.name = name;
    if (budget !== undefined) {
      // Adjust remaining relative to new budget
      const diff = budget - category.budget;
      category.budget = budget;
      category.remaining += diff;
      if (category.remaining < 0) category.remaining = 0;
    }

    await category.save();
    res.json(category);
  } catch (err) {
    console.error("Error updating category:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST deduct from category budget (envelope method)
 */
router.post("/:id/deduct", authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    const deduction = Number(amount);
    if (!deduction || deduction <= 0)
      return res.status(400).json({ message: "Invalid deduction amount" });

    if (deduction > category.remaining) {
      return res
        .status(400)
        .json({ message: "Not enough funds remaining in this category" });
    }

    category.remaining -= deduction;
    await category.save();

    res.json({ message: "Amount deducted", category });
  } catch (err) {
    console.error("Error deducting from category:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**DELETE category**/
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Category.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!deleted)
      return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted" });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
