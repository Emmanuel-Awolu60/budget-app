import { useEffect, useState } from "react";
import API from "../utils/axios";

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);

  const fetchExpenses = async () => {
    try {
      const res = await API.get("/expenses");
      setExpenses(res.data);
    } catch (err) {
      console.error("Error fetching expenses:", err.response?.data || err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h2 className="text-2xl font-bold mb-6">My Expenses</h2>
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
