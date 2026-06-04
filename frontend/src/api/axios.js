import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const PUBLIC_PATHS = ["/auth/login/"];

const isPublicRequest = (url = "") =>
  PUBLIC_PATHS.some((path) => url.split("?")[0].endsWith(path));

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  const token = localStorage.getItem("token");
  if (token && !isPublicRequest(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;