// src/pages/Reports.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../utils/api";
import { getToken, clearToken } from "../utils/auth";
import Spinner from "../components/Spinner";

export default function Reports() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

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

  const totals = useMemo(() => {
    const income = transactions
      .filter((t) => t.amount > 0)
      .reduce((a, b) => a + b.amount, 0);
    const expenses = transactions
      .filter((t) => t.amount < 0)
      .reduce((a, b) => a + Math.abs(b.amount), 0);
    return { income, expenses, balance: income - expenses };
  }, [transactions]);

  const byCategoryWithBudget = useMemo(() => {
    const today = new Date();
    const daysInMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();
    const dayOfMonth = today.getDate();
    const percentMonth = (dayOfMonth / daysInMonth) * 100;

    return categories.map((cat) => {
      const spent = transactions
        .filter(
          (t) => (t.categoryId?._id || t.categoryId) === cat._id && t.amount < 0
        )
        .reduce((a, b) => a + Math.abs(b.amount), 0);

      const budget = cat.budget || 0;
      const percentSpent = budget > 0 ? (spent / budget) * 100 : 0;
      const status =
        budget === 0
          ? "No budget set"
          : percentSpent > percentMonth
            ? "⚠️ Overspending"
            : "✅ On Track";

      return {
        name: cat.name,
        budget,
        spent,
        remaining: budget - spent,
        status,
      };
    });
  }, [transactions, categories]);

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
        <h1 className="text-2xl font-extrabold mb-6">Reports</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-5 rounded-2xl bg-slate-800/70 border border-white/10">
            <p className="text-sm text-slate-400">Income</p>
            <p className="text-2xl font-bold text-emerald-400">
              ₦{totals.income}
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-800/70 border border-white/10">
            <p className="text-sm text-slate-400">Expenses</p>
            <p className="text-2xl font-bold text-rose-400">
              ₦{totals.expenses}
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-800/70 border border-white/10">
            <p className="text-sm text-slate-400">Balance</p>
            <p className="text-2xl font-bold text-indigo-300">
              ₦{totals.balance}
            </p>
          </div>
        </div>

        {/* Budget Burn Rate */}
        <div className="p-6 rounded-2xl bg-slate-800/70 border border-white/10 mt-8">
          <h3 className="text-lg font-semibold mb-4">Budget Burn Rate</h3>
          {byCategoryWithBudget.length === 0 ? (
            <p className="text-slate-400">No categories with budgets yet.</p>
          ) : (
            <ul className="space-y-3">
              {byCategoryWithBudget.map((c, i) => (
                <li key={i} className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-slate-400">
                      Budget: ₦{c.budget} • Spent: ₦{c.spent}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-bold ${
                        c.status.includes("⚠️")
                          ? "text-rose-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {c.status}
                    </div>
                    {c.budget > 0 && (
                      <div className="text-xs text-slate-400">
                        {c.remaining >= 0
                          ? `Remaining: ₦${c.remaining}`
                          : `Over by ₦${Math.abs(c.remaining)}`}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
