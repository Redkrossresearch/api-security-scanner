import api from "./api";

export const downloadReport = async (scanId, format) => {
  const response = await api.get(`/reports/${scanId}/export/${format}`, {
    responseType: "blob",
  });
  return response.data;
};

export const getReportMetadata = async (scanId) => {
  const response = await api.get(`/reports/${scanId}`);
  return response.data;
};

export const reportService = {
  downloadReport,
  getReportMetadata,
};

export default reportService;