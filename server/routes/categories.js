const express = require("express");
const mongoose = require("mongoose");
const Category = require("../models/Category");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All category routes require auth
router.use(authMiddleware);

// GET /api/categories - list categories for logged-in user
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.userId }).sort({
      name: 1,
    });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/categories - create category
router.post("/", async (req, res) => {
  try {
    const { name, color = "", monthlyBudget = 0 } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ message: "Category name is required" });

    const category = new Category({
      userId: req.userId,
      name: name.trim(),
      color,
      monthlyBudget: Number(monthlyBudget) || 0,
    });

    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/categories/:id - update category
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid category id" });

    const category = await Category.findById(id);
    if (!category || category.userId.toString() !== req.userId)
      return res.status(404).json({ message: "Category not found" });

    const { name, color, monthlyBudget } = req.body;
    if (name !== undefined)
      category.name = String(name).trim() || category.name;
    if (color !== undefined) category.color = color;
    if (monthlyBudget !== undefined)
      category.monthlyBudget = Number(monthlyBudget) || 0;

    await category.save();
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/categories/:id - delete category if no transactions reference it
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid category id" });

    const category = await Category.findById(id);
    if (!category || category.userId.toString() !== req.userId)
      return res.status(404).json({ message: "Category not found" });

    const txExists = await Transaction.exists({ categoryId: id });
    if (txExists) {
      return res.status(400).json({
        message:
          "Cannot delete category with existing transactions. Reassign or delete transactions first.",
      });
    }

    await category.remove();
    res.json({ message: "Category deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
