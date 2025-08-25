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
    setForm({ description: "", amount: "", categoryId: "" });
    setModal({ open: true, mode: "add", current: null });
  }
  function openEdit(tx) {
    setForm({
      description: tx.description,
      amount: tx.amount,
      categoryId: tx.categoryId?._id || tx.categoryId || "",
    });
    setModal({ open: true, mode: "edit", current: tx });
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.description.trim()) return toast.error("Description required");
    if (!form.amount && form.amount !== 0)
      return toast.error("Amount required");
    const payload = {
      description: form.description,
      amount: Number(form.amount),
      categoryId: form.categoryId || null,
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
        setTransactions((s) => s.map((t) => (t._id === id ? res.data : t)));
        toast.success("Transaction updated");
      }
      setModal({ open: false, mode: "add", current: null });
      setForm({ description: "", amount: "", categoryId: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save transaction");
    }
  }

  function requestRemove(id, description) {
    setConfirm({
      open: true,
      id,
      text: `Delete transaction "${description}"? This action cannot be undone.`,
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner className="text-indigo-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold">Transactions</h1>
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
            No transactions yet—add one to begin tracking.
          </p>
        ) : (
          <ul className="divide-y divide-white/6">
            {transactions.map((t) => (
              <li
                key={t._id}
                className="py-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{t.description}</div>
                  <div className="text-xs text-slate-400">
                    {t.categoryId?.name || "Uncategorized"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={
                      t.amount > 0
                        ? "text-emerald-400 font-medium"
                        : "text-rose-400 font-medium"
                    }
                  >
                    {t.amount > 0 ? "+" : "-"} ${Math.abs(t.amount)}
                  </div>
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
            ))}
          </ul>
        )}
      </div>

      <AnimatePresence>
        {modal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
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
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="Amount (negative=expense)"
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

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded bg-indigo-600 hover:bg-indigo-500"
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
