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

  const byCategory = useMemo(() => {
    const map = {};
    transactions.forEach((t) => {
      const id = t.categoryId?._id || t.categoryId || "uncat";
      const name = t.categoryId?.name || t.category?.name || "Uncategorized";
      map[id] = map[id] || { name, total: 0 };
      map[id].total += t.amount;
    });
    return Object.values(map).sort(
      (a, b) => Math.abs(b.total) - Math.abs(a.total)
    );
  }, [transactions]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner className="text-indigo-400" />
      </div>
    );
  }

  const maxAbs = Math.max(...byCategory.map((c) => Math.abs(c.total)), 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold">Reports</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="p-5 rounded-2xl bg-slate-800/70 border border-white/10">
          <p className="text-sm text-slate-400">Income</p>
          <p className="text-2xl font-bold text-emerald-400">
            ${totals.income}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-800/70 border border-white/10">
          <p className="text-sm text-slate-400">Expenses</p>
          <p className="text-2xl font-bold text-rose-400">${totals.expenses}</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-800/70 border border-white/10">
          <p className="text-sm text-slate-400">Balance</p>
          <p className="text-2xl font-bold text-indigo-300">
            ${totals.balance}
          </p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-800/70 border border-white/10">
        <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
        {byCategory.length === 0 ? (
          <p className="text-slate-400">No data yet</p>
        ) : (
          <ul className="space-y-3">
            {byCategory.map((c, i) => {
              const width = Math.round((Math.abs(c.total) / maxAbs) * 100);
              const isIncome = c.total > 0;
              return (
                <li key={i} className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{c.name}</div>
                    <div className="text-xs text-slate-400">
                      ${c.total.toFixed(2)}
                    </div>
                  </div>
                  <div className="w-2/5">
                    <div className="h-3 rounded bg-white/6 overflow-hidden">
                      <div
                        style={{ width: `${width}%` }}
                        className={`h-3 ${isIncome ? "bg-emerald-400" : "bg-rose-400"}`}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
