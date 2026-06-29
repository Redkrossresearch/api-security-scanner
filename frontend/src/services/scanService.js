import api from "./api";

export const scanService = {
  async getScanById(scanId) {
    const response = await api.get(`/scans/${scanId}`);
    return response.data.scan;
  },
};