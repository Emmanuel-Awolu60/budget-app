const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // ✅ always store hashed password
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
