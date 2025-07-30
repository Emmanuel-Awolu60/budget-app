import axios from "axios";

// Create Axios instance
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Interceptor to attach token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["x-auth-token"] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
