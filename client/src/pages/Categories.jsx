// src/pages/Categories.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Pencil, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import { getToken, clearToken } from "../utils/auth";
import Spinner from "../components/Spinner";
import ConfirmModal from "../components/ConfirmModal";

export default function Categories() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  // Add/Edit modal
  const [modal, setModal] = useState({
    open: false,
    mode: "add",
    current: null,
  });
  const [form, setForm] = useState({ name: "", budget: "" });

  // Deduct modal
  const [deductModal, setDeductModal] = useState({
    open: false,
    current: null,
    amount: "",
  });

  // Confirm delete modal
  const [confirm, setConfirm] = useState({ open: false, id: null, text: "" });

  useEffect(() => {
    async function load() {
      try {
        const headers = { Authorization: `Bearer ${getToken()}` };
        const res = await API.get("/categories", { headers });
        setCategories(res.data);
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

  // ===== Handlers =====
  function openAdd() {
    setForm({ name: "", budget: "" });
    setModal({ open: true, mode: "add", current: null });
  }
  function openEdit(c) {
    setForm({ name: c.name, budget: c.budget });
    setModal({ open: true, mode: "edit", current: c });
  }
  function openDeduct(c) {
    setDeductModal({ open: true, current: c, amount: "" });
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Category name required");
    const headers = { Authorization: `Bearer ${getToken()}` };
    try {
      if (modal.mode === "add") {
        const res = await API.post(
          "/categories",
          { name: form.name, budget: Number(form.budget) || 0 },
          { headers }
        );
        setCategories((s) => [...s, res.data]);
        toast.success("Category added");
      } else {
        const id = modal.current._id;
        const res = await API.put(
          `/categories/${id}`,
          { name: form.name, budget: Number(form.budget) || 0 },
          { headers }
        );
        setCategories((s) => s.map((x) => (x._id === id ? res.data : x)));
        toast.success("Category updated");
      }
      setModal({ open: false, mode: "add", current: null });
      setForm({ name: "", budget: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save category");
    }
  }

  function requestRemove(id, name) {
    setConfirm({
      open: true,
      id,
      text: `Delete category "${name}"? This action cannot be undone.`,
    });
  }

  async function confirmRemove() {
    const id = confirm.id;
    const headers = { Authorization: `Bearer ${getToken()}` };
    try {
      await API.delete(`/categories/${id}`, { headers });
      setCategories((s) => s.filter((c) => c._id !== id));
      toast.success("Category deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    } finally {
      setConfirm({ open: false, id: null, text: "" });
    }
  }

  async function submitDeduct(e) {
    e.preventDefault();
    const amount = Number(deductModal.amount);
    if (!amount || amount <= 0) return toast.error("Enter valid amount");
    const headers = { Authorization: `Bearer ${getToken()}` };
    try {
      const res = await API.post(
        `/categories/${deductModal.current._id}/deduct`,
        { amount },
        { headers }
      );
      setCategories((s) =>
        s.map((c) => (c._id === res.data.category._id ? res.data.category : c))
      );
      toast.success(res.data.message);
      setDeductModal({ open: false, current: null, amount: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to deduct");
    }
  }

  // ===== Render =====
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Spinner className="text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-900 text-white">
      <aside className="hidden md:block" aria-hidden />
      <main className="flex-1 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold">Categories</h1>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500"
          >
            <PlusCircle size={16} /> Add Category
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-slate-800/70 border border-white/10 shadow-lg">
          {categories.length === 0 ? (
            <p className="text-slate-400">
              No categories yet—create one to get started.
            </p>
          ) : (
            <ul className="divide-y divide-white/6">
              {categories.map((c) => (
                <li
                  key={c._id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-slate-400">
                      Budget: ${c.budget} | Remaining: ${c.remaining}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(c)}
                      className="px-2 py-1 bg-blue-500/20 rounded inline-flex items-center gap-1"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      onClick={() => openDeduct(c)}
                      className="px-2 py-1 bg-yellow-500/20 rounded inline-flex items-center gap-1"
                    >
                      💸 Deduct
                    </button>
                    <button
                      onClick={() => requestRemove(c._id, c.name)}
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
      </main>

      {/* ===== Add/Edit Modal ===== */}
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
                  {modal.mode === "add" ? "Add Category" : "Edit Category"}
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
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Category Name"
                  className="w-full px-4 py-3 rounded bg-slate-700 border border-white/10"
                />
                <input
                  type="number"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  placeholder="Budget Amount"
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

      {/* ===== Deduct Modal ===== */}
      <AnimatePresence>
        {deductModal.open && (
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
              <h3 className="text-lg font-semibold mb-4">
                Deduct from {deductModal.current?.name}
              </h3>
              <form onSubmit={submitDeduct} className="space-y-4">
                <input
                  type="number"
                  value={deductModal.amount}
                  onChange={(e) =>
                    setDeductModal({ ...deductModal, amount: e.target.value })
                  }
                  placeholder="Amount to deduct"
                  className="w-full px-4 py-3 rounded bg-slate-700 border border-white/10"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded bg-yellow-600 hover:bg-yellow-500 text-white"
                  >
                    Deduct
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDeductModal({ open: false, current: null, amount: "" })
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

      {/* ===== Confirm Delete ===== */}
      <ConfirmModal
        open={confirm.open}
        title="Delete category"
        message={confirm.text}
        onConfirm={confirmRemove}
        onCancel={() => setConfirm({ open: false, id: null, text: "" })}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </div>
  );
}
