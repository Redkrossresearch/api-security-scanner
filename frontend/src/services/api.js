import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// ✅ UPGRADE 1: Auth token interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const activeTeamId = localStorage.getItem("activeTeamId");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (activeTeamId) {
      config.headers["X-Team-ID"] = activeTeamId;
    }

    return config;
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);
export default api;