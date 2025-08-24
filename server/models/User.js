const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
