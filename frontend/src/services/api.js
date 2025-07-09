import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const auth = JSON.parse(localStorage.getItem("auth") || "{}");
    if (auth.access) {
      config.headers.Authorization = `Bearer ${auth.access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;