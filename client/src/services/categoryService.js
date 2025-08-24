import API from "../utils/api";

export const getCategories = () => API.get("/categories");

export const addCategory = (name) => API.post("/categories", { name });

export const updateCategory = (id, name) =>
  API.put(`/categories/${id}`, { name });

export const deleteCategory = (id) => API.delete(`/categories/${id}`); // 👈 make sure this exists
