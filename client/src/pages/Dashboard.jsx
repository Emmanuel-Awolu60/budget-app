import { useEffect, useState } from "react";
import API from "../utils/axios";

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");

  const fetchExpenses = async () => {
    try {
      const res = await API.get("/expenses");
      setExpenses(res.data);
    } catch (err) {
      console.error("Error fetching expenses:", err.response?.data || err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/expenses", {
        title,
        amount,
      });

      // Add new expense to the list
      setExpenses([res.data, ...expenses]);

      // Clear form
      setTitle("");
      setAmount("");
    } catch (err) {
      console.error("Error adding expense:", err.response?.data || err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h2 className="text-2xl font-bold mb-6">My Expenses</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 mb-6 rounded shadow flex flex-col md:flex-row items-center gap-4"
      >
        <input
          type="text"
          placeholder="Expense title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="p-2 border rounded w-full md:w-1/2"
        />
        <input
          type="number"
          placeholder="Amount (₦)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="p-2 border rounded w-full md:w-1/4"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Add Expense
        </button>
      </form>

      <ul className="space-y-4">
        {expenses.map((item) => (
          <li
            key={item._id}
            className="bg-white p-4 rounded shadow flex justify-between items-center"
          >
            <span className="text-gray-800 font-medium">{item.title}</span>
            <span className="text-green-600 font-semibold">₦{item.amount}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
