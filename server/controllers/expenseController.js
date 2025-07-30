import Expense from "../models/Expense.js";

export const addExpense = async (req, res) => {
  try {
    const { title, amount, category } = req.body;

    const newExpense = new Expense({
      user: req.user.id,
      title,
      amount,
      category,
    });

    const savedExpense = await newExpense.save();

    res.status(201).json(savedExpense);
  } catch (err) {
    res.status(500).json({ msg: "Failed to add expense", error: err.message });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({
      date: -1,
    });
    res.status(200).json(expenses);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Failed to fetch expenses", error: err.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense || expense.user.toString() !== req.user.id) {
      return res.status(404).json({ msg: "Expense not found" });
    }

    await expense.remove();
    res.status(200).json({ msg: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting expense", error: err.message });
  }
};
