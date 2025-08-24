import { useEffect, useState } from "react";
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from "../services/transactionService";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryService";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);
  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expenses;

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const txRes = await getTransactions();
        const catRes = await getCategories();
        setTransactions(txRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          label="Balance"
          value={`₦${balance.toLocaleString()}`}
          color="blue"
        />
        <StatCard
          label="Income"
          value={`₦${income.toLocaleString()}`}
          color="green"
        />
        <StatCard
          label="Expenses"
          value={`₦${expenses.toLocaleString()}`}
          color="red"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Transactions */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-sm">No transactions yet.</p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {transactions.map((t) => (
                <div
                  key={t._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {t.category?.name || "Uncategorized"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(t.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p
                    className={`font-semibold ${
                      t.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}₦{t.amount}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column - Categories + Charts */}
        <div className="space-y-6">
          {/* Categories */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Categories</h2>
            <ul className="space-y-2 max-h-[180px] overflow-y-auto pr-2">
              {categories.map((c) => (
                <li key={c._id} className="flex justify-between text-sm">
                  <span>{c.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Charts */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Spending by Category</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categories.map((c) => ({
                    name: c.name,
                    value: transactions
                      .filter(
                        (t) => t.category?._id === c._id && t.type === "expense"
                      )
                      .reduce((acc, t) => acc + t.amount, 0),
                  }))}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {categories.map((_, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={
                        ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#6366f1"][
                          i % 5
                        ]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Expenses Over Time</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={transactions
                  .filter((t) => t.type === "expense")
                  .map((t) => ({
                    date: new Date(t.date).toLocaleDateString(),
                    amount: t.amount,
                  }))}
              >
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// Small stat card component
function StatCard({ label, value, color }) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
  };
  return (
    <div className="p-6 rounded-xl shadow-sm border bg-white">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${colorMap[color]}`}>{value}</p>
    </div>
  );
}
