// const express = require("express");
// const mongoose = require("mongoose");
// const Transaction = require("../models/Transaction");
// const Category = require("../models/Category");
// const authMiddleware = require("../middleware/authMiddleware");

// const router = express.Router();
// router.use(authMiddleware);

// // Helper
// const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// // GET /api/transactions - list with optional filters: from, to, categoryId, type
// router.get("/", async (req, res) => {
//   try {
//     const { from, to, categoryId, type } = req.query;

//     const filter = { userId: req.userId };

//     if (type && ["income", "expense"].includes(type)) filter.type = type;
//     if (categoryId && isValidObjectId(categoryId))
//       filter.categoryId = categoryId;

//     if (from || to) {
//       filter.date = {};
//       if (from) {
//         const f = new Date(from);
//         if (!isNaN(f)) filter.date.$gte = f;
//       }
//       if (to) {
//         const t = new Date(to);
//         if (!isNaN(t)) filter.date.$lte = t;
//       }
//     }

//     const transactions = await Transaction.find(filter).sort({
//       date: -1,
//       createdAt: -1,
//     });
//     res.json(transactions);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // POST /api/transactions - create
// router.post("/", async (req, res) => {
//   try {
//     const {
//       amount,
//       type,
//       categoryId = null,
//       date = null,
//       notes = "",
//     } = req.body;

//     if (amount === undefined || isNaN(Number(amount)))
//       return res.status(400).json({ message: "Valid amount is required" });
//     if (!["income", "expense"].includes(type))
//       return res
//         .status(400)
//         .json({ message: 'Type must be "income" or "expense"' });

//     if (categoryId) {
//       if (!isValidObjectId(categoryId))
//         return res.status(400).json({ message: "Invalid categoryId" });
//       const cat = await Category.findOne({
//         _id: categoryId,
//         userId: req.userId,
//       });
//       if (!cat)
//         return res
//           .status(400)
//           .json({ message: "Category not found or does not belong to user" });
//     }

//     const tx = new Transaction({
//       userId: req.userId,
//       amount: Number(amount),
//       type,
//       categoryId: categoryId || null,
//       date: date ? new Date(date) : Date.now(),
//       notes: notes || "",
//     });

//     await tx.save();
//     res.status(201).json(tx);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // GET /api/transactions/:id - get single
// router.get("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!isValidObjectId(id))
//       return res.status(400).json({ message: "Invalid id" });

//     const tx = await Transaction.findById(id);
//     if (!tx || tx.userId.toString() !== req.userId)
//       return res.status(404).json({ message: "Transaction not found" });

//     res.json(tx);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // PUT /api/transactions/:id - update
// router.put("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!isValidObjectId(id))
//       return res.status(400).json({ message: "Invalid id" });

//     const tx = await Transaction.findById(id);
//     if (!tx || tx.userId.toString() !== req.userId)
//       return res.status(404).json({ message: "Transaction not found" });

//     const { amount, type, categoryId, date, notes } = req.body;

//     if (amount !== undefined) {
//       if (isNaN(Number(amount)))
//         return res.status(400).json({ message: "Invalid amount" });
//       tx.amount = Number(amount);
//     }
//     if (type !== undefined) {
//       if (!["income", "expense"].includes(type))
//         return res
//           .status(400)
//           .json({ message: "Type must be income or expense" });
//       tx.type = type;
//     }
//     if (categoryId !== undefined) {
//       if (categoryId && !isValidObjectId(categoryId))
//         return res.status(400).json({ message: "Invalid categoryId" });
//       if (categoryId) {
//         const cat = await Category.findOne({
//           _id: categoryId,
//           userId: req.userId,
//         });
//         if (!cat)
//           return res
//             .status(400)
//             .json({ message: "Category not found or does not belong to user" });
//         tx.categoryId = categoryId;
//       } else {
//         tx.categoryId = null; // allow clearing category
//       }
//     }
//     if (date !== undefined) {
//       const d = new Date(date);
//       if (isNaN(d)) return res.status(400).json({ message: "Invalid date" });
//       tx.date = d;
//     }
//     if (notes !== undefined) tx.notes = notes;

//     await tx.save();
//     res.json(tx);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // DELETE /api/transactions/:id
// router.delete("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!isValidObjectId(id))
//       return res.status(400).json({ message: "Invalid id" });

//     const tx = await Transaction.findById(id);
//     if (!tx || tx.userId.toString() !== req.userId)
//       return res.status(404).json({ message: "Transaction not found" });

//     await tx.remove();
//     res.json({ message: "Transaction deleted" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;
const express = require("express");
const auth = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", auth, async (_req, res) => {
  res.json([
    { id: "t1", title: "Groceries", amount: -50, category: "food" },
    { id: "t2", title: "Salary", amount: 1200, category: "income" },
  ]);
});

router.post("/", auth, async (req, res) => {
  res.status(201).json({ message: "Transaction created", data: req.body });
});

module.exports = router;
