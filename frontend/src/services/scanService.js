import api from "./api";

export const scanService = {
  async getScanById(scanId) {
    const response = await api.get(`/scans/${scanId}`);
    return response.data.scan;
  },

  async createScan(targetUrl, config = {}) {
    const response = await api.post("/scans", { targetUrl, ...config });
    return response.data.scan;
  },

  async deleteScan(scanId) {
    const response = await api.delete(`/scans/${scanId}`);
    return response.data;
  },

  async getScanStatus(scanId) {
    const response = await api.get(`/scans/${scanId}/status`);
    return response.data;
  },
};