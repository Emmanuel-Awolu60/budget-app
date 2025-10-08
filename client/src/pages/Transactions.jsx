// src/pages/Transactions.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Pencil, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import API from "../utils/api";
import { getToken, clearToken } from "../utils/auth";
import Spinner from "../components/Spinner";
import ConfirmModal from "../components/ConfirmModal";

export default function Transactions() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  const [modal, setModal] = useState({
    open: false,
    mode: "add",
    current: null,
  });
  const [form, setForm] = useState({
    description: "",
    amount: "",
    categoryId: "",
    date: "",
  });

  const [confirm, setConfirm] = useState({ open: false, id: null, text: "" });

  useEffect(() => {
    async function load() {
      try {
        const headers = { Authorization: `Bearer ${getToken()}` };
        const [txRes, catRes] = await Promise.all([
          API.get("/transactions", { headers }),
          API.get("/categories", { headers }),
        ]);
        setTransactions(txRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error(err);
        toast.error("Session expired. Redirecting to login.");
        clearToken();
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [navigate]);

  function openAdd() {
    setForm({ description: "", amount: "", categoryId: "", date: "" });
    setModal({ open: true, mode: "add", current: null });
  }

  function openEdit(t) {
    setForm({
      description: t.description,
      amount: t.amount,
      categoryId: t.categoryId?._id || t.categoryId,
      date: t.date?.slice(0, 10) || "",
    });
    setModal({ open: true, mode: "edit", current: t });
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.description.trim() || !form.amount || !form.categoryId) {
      return toast.error("All fields are required");
    }
    const payload = {
      description: form.description,
      amount: Number(form.amount),
      categoryId: form.categoryId,
      date: form.date || new Date().toISOString(),
    };
    const headers = { Authorization: `Bearer ${getToken()}` };

    try {
      if (modal.mode === "add") {
        const res = await API.post("/transactions", payload, { headers });
        setTransactions((s) => [...s, res.data]);
        toast.success("Transaction added");
      } else {
        const id = modal.current._id;
        const res = await API.put(`/transactions/${id}`, payload, { headers });
        setTransactions((s) => s.map((x) => (x._id === id ? res.data : x)));
        toast.success("Transaction updated");
      }
      setModal({ open: false, mode: "add", current: null });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save transaction");
    }
  }

  function requestRemove(id, desc) {
    setConfirm({
      open: true,
      id,
      text: `Delete transaction "${desc}"?`,
    });
  }

  async function confirmRemove() {
    const id = confirm.id;
    const headers = { Authorization: `Bearer ${getToken()}` };
    try {
      await API.delete(`/transactions/${id}`, { headers });
      setTransactions((s) => s.filter((t) => t._id !== id));
      toast.success("Transaction deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    } finally {
      setConfirm({ open: false, id: null, text: "" });
    }
  }

  // Helper: find category budget impact
  function getBudgetImpact(tx) {
    const cat = categories.find(
      (c) => c._id === (tx.categoryId?._id || tx.categoryId)
    );
    if (!cat || !cat.budget) return null;

    const spent = transactions
      .filter(
        (t) => (t.categoryId?._id || t.categoryId) === cat._id && t.amount < 0
      )
      .reduce((a, b) => a + Math.abs(b.amount), 0);

    return {
      budget: cat.budget,
      spent,
      remaining: cat.budget - spent,
    };
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Spinner className="text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-900 text-white">
      <aside className="hidden md:block " aria-hidden />
      <main className="flex-1 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold">Transactions</h1>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500"
          >
            <PlusCircle size={16} /> Add Transaction
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-slate-800/70 border border-white/10 shadow-lg">
          {transactions.length === 0 ? (
            <p className="text-slate-400">
              No transactions yet — add your first one!
            </p>
          ) : (
            <ul className="divide-y divide-white/6">
              {transactions.map((t) => {
                const impact = getBudgetImpact(t);
                return (
                  <li
                    key={t._id}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <div className="font-medium">{t.description}</div>
                      <div className="text-xs text-slate-400">
                        {t.amount < 0 ? (
                          <span className="text-rose-400">
                            -₦{Math.abs(t.amount)}
                          </span>
                        ) : (
                          <span className="text-emerald-400">+₦{t.amount}</span>
                        )}
                        {" • "}
                        {t.categoryId?.name ||
                          categories.find((c) => c._id === t.categoryId)?.name}
                        {" • "}
                        {new Date(t.date).toLocaleDateString()}
                      </div>
                      {impact && (
                        <div className="text-xs text-slate-400">
                          Budget: ₦{impact.budget} • Remaining:{" "}
                          {impact.remaining >= 0 ? (
                            <span className="text-emerald-400">
                              ₦{impact.remaining}
                            </span>
                          ) : (
                            <span className="text-rose-400">
                              -₦{Math.abs(impact.remaining)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(t)}
                        className="px-2 py-1 bg-blue-500/20 rounded inline-flex items-center gap-1"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={() => requestRemove(t._id, t.description)}
                        className="px-2 py-1 bg-rose-500/20 rounded inline-flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {modal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-slate-800 p-6 rounded-2xl w-full max-w-md border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {modal.mode === "add"
                    ? "Add Transaction"
                    : "Edit Transaction"}
                </h3>
                <button
                  onClick={() =>
                    setModal({ open: false, mode: "add", current: null })
                  }
                  className="p-1 hover:bg-slate-700 rounded"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={submit} className="space-y-4">
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Description"
                  className="w-full px-4 py-3 rounded bg-slate-700 border border-white/10"
                />
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="Amount (use - for expenses)"
                  className="w-full px-4 py-3 rounded bg-slate-700 border border-white/10"
                />
                <select
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm({ ...form, categoryId: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded bg-slate-700 border border-white/10"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-3 rounded bg-slate-700 border border-white/10"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white"
                  >
                    {modal.mode === "add" ? "Save" : "Update"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setModal({ open: false, mode: "add", current: null })
                    }
                    className="py-2 px-4 rounded bg-slate-700 hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={confirm.open}
        title="Delete transaction"
        message={confirm.text}
        onConfirm={confirmRemove}
        onCancel={() => setConfirm({ open: false, id: null, text: "" })}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </div>
  );
}
