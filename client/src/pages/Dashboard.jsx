// src/pages/Dashboard.jsx
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import API from "../utils/api";
import { getToken } from "../utils/auth";
import Spinner from "../components/Spinner";
import toast from "react-hot-toast";
import ConfirmModal from "../components/ConfirmModal";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // modals
  const [categoryModal, setCategoryModal] = useState({
    open: false,
    mode: "add",
    current: null,
    name: "",
  });
  const [txModal, setTxModal] = useState({
    open: false,
    mode: "add",
    current: null,
    form: { description: "", amount: "", categoryId: "" },
  });

  // confirm
  const [confirm, setConfirm] = useState({
    open: false,
    id: null,
    type: null,
    text: "",
  });

  const stats = useMemo(() => {
    const income = transactions
      .filter((t) => t.amount > 0)
      .reduce((a, b) => a + b.amount, 0);
    const expenses = transactions
      .filter((t) => t.amount < 0)
      .reduce((a, b) => a + Math.abs(b.amount), 0);
    return { income, expenses, balance: income - expenses };
  }, [transactions]);

  useEffect(() => {
    async function boot() {
      try {
        const headers = { Authorization: `Bearer ${getToken()}` };
        const [meRes, catRes, txRes] = await Promise.all([
          API.get("/auth/me", { headers }),
          API.get("/categories", { headers }),
          API.get("/transactions", { headers }),
        ]);
        setUser(meRes.data.user);
        setCategories(catRes.data);
        setTransactions(txRes.data);
      } catch (err) {
        console.error(err);
        toast.error("Session expired. Redirecting to login.");
      } finally {
        setLoading(false);
      }
    }
    boot();
  }, []);

  // Category handlers
  function openAddCategory() {
    setCategoryModal({ open: true, mode: "add", current: null, name: "" });
  }
  function openEditCategory(c) {
    setCategoryModal({ open: true, mode: "edit", current: c, name: c.name });
  }
  async function submitCategory(e) {
    e.preventDefault();
    const headers = { Authorization: `Bearer ${getToken()}` };
    if (!categoryModal.name.trim()) return toast.error("Name is required");
    try {
      if (categoryModal.mode === "add") {
        const res = await API.post(
          "/categories",
          { name: categoryModal.name },
          { headers }
        );
        setCategories((s) => [...s, res.data]);
        toast.success("Category added");
      } else {
        const id = categoryModal.current._id;
        const res = await API.put(
          `/categories/${id}`,
          { name: categoryModal.name },
          { headers }
        );
        setCategories((s) => s.map((x) => (x._id === id ? res.data : x)));
        toast.success("Category updated");
      }
      setCategoryModal({ open: false, mode: "add", current: null, name: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save category");
    }
  }
  function requestDeleteCategory(id, name) {
    setConfirm({
      open: true,
      id,
      type: "category",
      text: `Delete category "${name}"? This cannot be undone.`,
    });
  }
  async function confirmDeleteCategory() {
    const id = confirm.id;
    const headers = { Authorization: `Bearer ${getToken()}` };
    try {
      await API.delete(`/categories/${id}`, { headers });
      setCategories((s) => s.filter((c) => c._id !== id));
      toast.success("Category deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete category");
    } finally {
      setConfirm({ open: false, id: null, type: null, text: "" });
    }
  }

  // Transaction handlers
  function openAddTx() {
    setTxModal({
      open: true,
      mode: "add",
      current: null,
      form: { description: "", amount: "", categoryId: "" },
    });
  }
  function openEditTx(tx) {
    setTxModal({
      open: true,
      mode: "edit",
      current: tx,
      form: {
        description: tx.description,
        amount: tx.amount,
        categoryId: tx.categoryId?._id || tx.categoryId || "",
      },
    });
  }
  async function submitTx(e) {
    e.preventDefault();
    const headers = { Authorization: `Bearer ${getToken()}` };
    const payload = {
      description: txModal.form.description,
      amount: Number(txModal.form.amount),
      categoryId: txModal.form.categoryId || null,
    };
    if (!payload.description) return toast.error("Description required");
    if (isNaN(payload.amount)) return toast.error("Valid amount required");
    try {
      if (txModal.mode === "add") {
        const res = await API.post("/transactions", payload, { headers });
        setTransactions((s) => [...s, res.data]);
        toast.success("Transaction added");
      } else {
        const id = txModal.current._id;
        const res = await API.put(`/transactions/${id}`, payload, { headers });
        setTransactions((s) => s.map((t) => (t._id === id ? res.data : t)));
        toast.success("Transaction updated");
      }
      setTxModal({
        open: false,
        mode: "add",
        current: null,
        form: { description: "", amount: "", categoryId: "" },
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save transaction");
    }
  }
  function requestDeleteTx(id, description) {
    setConfirm({
      open: true,
      id,
      type: "transaction",
      text: `Delete transaction "${description}"? This cannot be undone.`,
    });
  }
  async function confirmDeleteTx() {
    const id = confirm.id;
    const headers = { Authorization: `Bearer ${getToken()}` };
    try {
      await API.delete(`/transactions/${id}`, { headers });
      setTransactions((s) => s.filter((t) => t._id !== id));
      toast.success("Transaction deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete transaction");
    } finally {
      setConfirm({ open: false, id: null, type: null, text: "" });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="text-indigo-400" />
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold">Welcome back, {user?.name}</h1>
        <div />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        {[
          {
            label: "Income",
            value: stats.income,
            color: "from-emerald-500 to-teal-400",
          },
          {
            label: "Expenses",
            value: stats.expenses,
            color: "from-rose-500 to-pink-400",
          },
          {
            label: "Balance",
            value: stats.balance,
            color: "from-indigo-500 to-blue-500",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.12 }}
            className="p-6 rounded-2xl bg-slate-800/70 border border-white/10 shadow-lg backdrop-blur"
          >
            <p className="text-slate-400">{stat.label}</p>
            <p
              className={`text-2xl md:text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
            >
              ${stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 rounded-2xl bg-slate-800/70 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-semibold">Categories</h2>
            <button
              onClick={openAddCategory}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium"
            >
              <PlusCircle size={16} /> Add
            </button>
          </div>
          <ul className="space-y-2 text-slate-300">
            {categories.map((c) => (
              <li key={c._id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{c.name}</div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <button
                    onClick={() => openEditCategory(c)}
                    className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/40 rounded inline-flex items-center gap-1"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => requestDeleteCategory(c._id, c.name)}
                    className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/40 rounded inline-flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-slate-800/70 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-semibold">
              Recent Transactions
            </h2>
            <button
              onClick={openAddTx}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium"
            >
              <PlusCircle size={16} /> Add
            </button>
          </div>
          <ul className="space-y-3 text-slate-300">
            {transactions.map((t) => (
              <li
                key={t._id}
                className="flex items-center justify-between border-b border-white/5 pb-2"
              >
                <div>
                  <div className="font-medium">{t.description}</div>
                  <div className="text-xs text-slate-400">
                    {t.categoryId?.name || "Uncategorized"}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div
                    className={
                      t.amount > 0 ? "text-emerald-400" : "text-rose-400"
                    }
                  >
                    {t.amount > 0 ? "+" : "-"} ${Math.abs(t.amount)}
                  </div>
                  <button
                    onClick={() => openEditTx(t)}
                    className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/40 rounded inline-flex items-center gap-1"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => requestDeleteTx(t._id, t.description)}
                    className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/40 rounded inline-flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Category modal */}
      {categoryModal.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {categoryModal.mode === "add"
                  ? "Add Category"
                  : "Edit Category"}
              </h3>
              <button
                onClick={() =>
                  setCategoryModal({
                    open: false,
                    mode: "add",
                    current: null,
                    name: "",
                  })
                }
                className="p-1 hover:bg-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>
            <form onSubmit={submitCategory} className="space-y-4">
              <input
                type="text"
                value={categoryModal.name}
                onChange={(e) =>
                  setCategoryModal((s) => ({ ...s, name: e.target.value }))
                }
                placeholder="Category name"
                className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  {categoryModal.mode === "add" ? "Save" : "Update"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCategoryModal({
                      open: false,
                      mode: "add",
                      current: null,
                      name: "",
                    })
                  }
                  className="py-2 px-4 rounded bg-slate-700 hover:bg-slate-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction modal */}
      {txModal.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {txModal.mode === "add"
                  ? "Add Transaction"
                  : "Edit Transaction"}
              </h3>
              <button
                onClick={() =>
                  setTxModal({
                    open: false,
                    mode: "add",
                    current: null,
                    form: { description: "", amount: "", categoryId: "" },
                  })
                }
                className="p-1 hover:bg-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>
            <form onSubmit={submitTx} className="space-y-4">
              <input
                type="text"
                value={txModal.form.description}
                onChange={(e) =>
                  setTxModal((s) => ({
                    ...s,
                    form: { ...s.form, description: e.target.value },
                  }))
                }
                placeholder="Description"
                className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                step="0.01"
                value={txModal.form.amount}
                onChange={(e) =>
                  setTxModal((s) => ({
                    ...s,
                    form: { ...s.form, amount: e.target.value },
                  }))
                }
                placeholder="Amount"
                className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={txModal.form.categoryId}
                onChange={(e) =>
                  setTxModal((s) => ({
                    ...s,
                    form: { ...s.form, categoryId: e.target.value },
                  }))
                }
                className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  {txModal.mode === "add" ? "Save" : "Update"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTxModal({
                      open: false,
                      mode: "add",
                      current: null,
                      form: { description: "", amount: "", categoryId: "" },
                    })
                  }
                  className="py-2 px-4 rounded bg-slate-700 hover:bg-slate-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm modal */}
      <ConfirmModal
        open={confirm.open}
        title="Please confirm"
        message={confirm.text}
        onConfirm={() => {
          if (confirm.type === "category") confirmDeleteCategory();
          else if (confirm.type === "transaction") confirmDeleteTx();
        }}
        onCancel={() =>
          setConfirm({ open: false, id: null, type: null, text: "" })
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </>
  );
}
