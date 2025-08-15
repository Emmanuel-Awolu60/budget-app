import { useEffect, useState } from "react";
import { getCategories, addCategory } from "../services/categoryService";
import {
  getTransactions,
  addTransaction,
} from "../services/transactionService";
import Input from "../components/Input";
import Button from "../components/Button";

export default function Dashboard() {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newTransaction, setNewTransaction] = useState({
    category: "",
    amount: "",
    description: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const cats = await getCategories();
    const trans = await getTransactions();
    setCategories(cats.data);
    setTransactions(trans.data);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory) return;
    await addCategory(newCategory);
    setNewCategory("");
    loadData();
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!newTransaction.category || !newTransaction.amount) return;
    await addTransaction(newTransaction);
    setNewTransaction({ category: "", amount: "", description: "" });
    loadData();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {/* CATEGORY FORM */}
      <form
        onSubmit={handleAddCategory}
        className="mb-6 bg-white p-4 rounded shadow"
      >
        <h2 className="text-lg font-semibold mb-2">Add Category</h2>
        <div className="flex gap-2">
          <Input
            label="Category Name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <Button type="submit">Add</Button>
        </div>
      </form>

      {/* TRANSACTION FORM */}
      <form
        onSubmit={handleAddTransaction}
        className="mb-6 bg-white p-4 rounded shadow"
      >
        <h2 className="text-lg font-semibold mb-2">Add Transaction</h2>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={newTransaction.category}
              onChange={(e) =>
                setNewTransaction({
                  ...newTransaction,
                  category: e.target.value,
                })
              }
              className="border p-2 w-full rounded"
            >
              <option value="">Select</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Amount"
            type="number"
            value={newTransaction.amount}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, amount: e.target.value })
            }
          />
          <Input
            label="Description"
            value={newTransaction.description}
            onChange={(e) =>
              setNewTransaction({
                ...newTransaction,
                description: e.target.value,
              })
            }
          />
        </div>
        <Button type="submit" className="mt-3">
          Add Transaction
        </Button>
      </form>

      {/* LISTS */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Categories</h2>
          <ul className="list-disc pl-5">
            {categories.map((cat) => (
              <li key={cat._id}>{cat.name}</li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Transactions</h2>
          <ul className="divide-y">
            {transactions.map((tx) => (
              <li key={tx._id} className="py-2 flex justify-between">
                <span>{tx.description || "No description"}</span>
                <span>${tx.amount}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
