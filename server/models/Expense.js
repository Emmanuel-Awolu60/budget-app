import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: [true, "Please enter a title"],
  },
  amount: {
    type: Number,
    required: [true, "Please enter an amount"],
  },
  category: {
    type: String,
    required: true,
    enum: ["Food", "Transport", "Bills", "Health", "Other"],
    default: "Other",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Expense", ExpenseSchema);
