import API from "../utils/api";

export const getCategories = () => API.get("/categories");
export const addCategory = (name) => API.post("/categories", { name });
