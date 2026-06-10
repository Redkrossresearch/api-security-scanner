import axios from "axios";

const API = "http://localhost:5000/api";

export const getDashboardStats = async () => {
  const res = await axios.get(`${API}/dashboard/stats`);
  return res.data.stats;
};