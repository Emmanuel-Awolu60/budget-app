import API from "../utils/api";

export const getTransactions = () => API.get("/transactions");
export const addTransaction = (transaction) =>
  API.post("/transactions", transaction);
