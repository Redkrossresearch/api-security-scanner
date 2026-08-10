import axios from "axios";

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== "undefined" && window.location.hostname.includes("vercel.app")) {
    return "https://api-security-scanner-puum.onrender.com/api";
  }
  return "http://localhost:5000/api";
};

// Render free tier cold starts can take 50-80s — use 120s global timeout
// AI / copilot heavy routes get 180s via request interceptor below
const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  timeout: 120000,
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