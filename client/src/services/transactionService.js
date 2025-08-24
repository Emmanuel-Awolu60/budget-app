import API from "../utils/api";

export const getTransactions = () => API.get("/transactions");

export const addTransaction = (transaction) =>
  API.post("/transactions", transaction);

export const updateTransaction = (id, transaction) =>
  API.put(`/transactions/${id}`, transaction);

export const deleteTransaction = (id) => API.delete(`/transactions/${id}`); // 👈 add this
