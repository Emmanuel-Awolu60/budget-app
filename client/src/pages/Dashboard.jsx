// Dashboard.jsx

import { useEffect, useState } from "react";
import API from "../utils/axios";

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);

  // Fetch all user transactions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/transactions");
        const data = res.data;

        setTransactions(data);

        const incomeTotal = data
          .filter((t) => t.type === "income")
          .reduce((acc, curr) => acc + curr.amount, 0);

        const expenseTotal = data
          .filter((t) => t.type === "expense")
          .reduce((acc, curr) => acc + curr.amount, 0);

        setIncome(incomeTotal);
        setExpense(expenseTotal);
        setBalance(incomeTotal - expenseTotal);
      } catch (err) {
        console.error("Error loading transactions", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {/* Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm text-gray-500">Balance</h2>
          <p className="text-xl font-bold text-blue-600">₦{balance}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm text-gray-500">Income</h2>
          <p className="text-xl font-bold text-green-600">₦{income}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm text-gray-500">Expenses</h2>
          <p className="text-xl font-bold text-red-600">₦{expense}</p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Your Transactions</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500">No transactions yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {transactions.map((t) => (
              <li
                key={t._id}
                className="py-2 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{t.title}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(t.date).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-sm font-bold ${
                    t.type === "income" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {t.type === "income" ? "+" : "-"}₦{t.amount}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
