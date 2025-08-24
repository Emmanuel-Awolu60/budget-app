require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// const authRoutes = require("./routes/auth");
const categoriesRoutes = require("./routes/categories");
const transactionsRoutes = require("./routes/transactions");

const authRoutes = require("./routes/auth");
// app.use("/api/auth", authRoutes);

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/transactions", transactionsRoutes);

// Base route
app.get("/", (req, res) => res.send("Budgeting API is running"));

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set in .env");
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
