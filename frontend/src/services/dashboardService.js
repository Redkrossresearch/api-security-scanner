import axios from "axios";

const API =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getDashboardStats = async () => {
  const res = await axios.get(`${API}/dashboard/stats`);
  return res.data.stats;
};