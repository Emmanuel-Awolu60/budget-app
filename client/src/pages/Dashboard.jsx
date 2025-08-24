// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Settings, User, PlusCircle, X } from "lucide-react";
import API from "../utils/api";
import { getToken, clearToken } from "../utils/auth";
import Spinner from "../components/Spinner";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ income: 0, expenses: 0, balance: 0 });

  // modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await API.get("/auth/me", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setUser(data.user);

        // Demo stats
        setStats({ income: 1500, expenses: 600, balance: 900 });
      } catch (err) {
        console.error("Auth fetch error:", err);
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [navigate]);

  function logout() {
    clearToken();
    navigate("/login", { replace: true });
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
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800/60 border-r border-white/10 backdrop-blur-xl flex flex-col">
        <div className="p-6 text-2xl font-bold bg-gradient-to-r from-indigo-500 to-blue-600 text-transparent bg-clip-text">
          BudgetX
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <a className="block rounded-lg px-4 py-2 bg-slate-700/40 text-indigo-400 font-semibold">
            Dashboard
          </a>
          <a className="block rounded-lg px-4 py-2 hover:bg-slate-700/30">
            Categories
          </a>
          <a className="block rounded-lg px-4 py-2 hover:bg-slate-700/30">
            Transactions
          </a>
          <a className="block rounded-lg px-4 py-2 hover:bg-slate-700/30">
            Reports
          </a>
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold">
            Welcome back, {user?.name}
          </h1>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 rounded-lg border border-white/10 hover:bg-slate-700/40">
              <User size={18} /> {user?.email}
            </button>
            <button className="p-2 rounded-lg bg-slate-800/60 border border-white/10 hover:bg-slate-700/40">
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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
              transition={{ delay: i * 0.15 }}
              className="p-6 rounded-2xl bg-slate-800/70 border border-white/10 shadow-lg backdrop-blur"
            >
              <p className="text-slate-400">{stat.label}</p>
              <p
                className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
              >
                ${stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Categories & Transactions */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Categories */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="p-6 rounded-2xl bg-slate-800/70 border border-white/10 shadow-lg backdrop-blur"
          >
            <h2 className="text-xl font-semibold mb-4">Categories</h2>
            <ul className="space-y-2 text-slate-300">
              <li className="flex justify-between">
                Food <span>$200</span>
              </li>
              <li className="flex justify-between">
                Transport <span>$80</span>
              </li>
              <li className="flex justify-between">
                Shopping <span>$150</span>
              </li>
            </ul>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="mt-4 w-full py-2 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-medium"
            >
              <PlusCircle size={18} /> Add Category
            </button>
          </motion.div>

          {/* Transactions */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="p-6 rounded-2xl bg-slate-800/70 border border-white/10 shadow-lg backdrop-blur"
          >
            <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
            <ul className="space-y-3 text-slate-300">
              <li className="flex justify-between border-b border-white/5 pb-2">
                <span>Groceries</span> <span>- $50</span>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-2">
                <span>Salary</span>{" "}
                <span className="text-emerald-400">+ $1200</span>
              </li>
              <li className="flex justify-between">
                <span>Bus Ticket</span> <span>- $15</span>
              </li>
            </ul>
            <button
              onClick={() => setShowTransactionModal(true)}
              className="mt-4 w-full py-2 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-medium"
            >
              <PlusCircle size={18} /> Add Transaction
            </button>
          </motion.div>
        </div>
      </main>

      {/* Category Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add Category</h3>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="p-1 hover:bg-slate-700 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Category Name"
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-medium"
                >
                  Save
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction Modal */}
      <AnimatePresence>
        {showTransactionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add Transaction</h3>
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="p-1 hover:bg-slate-700 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Description"
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select Category</option>
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                  <option value="shopping">Shopping</option>
                </select>
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-medium"
                >
                  Save
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
