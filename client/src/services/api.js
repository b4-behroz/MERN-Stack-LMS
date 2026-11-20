import axios from "axios";

const base = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");
const api = axios.create({ baseURL: `${base}/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const errMsg = (err) =>
  err.response?.data?.message ||
  (err.request
    ? "Cannot reach the server. Is the backend running?"
    : err.message);

export default api;
