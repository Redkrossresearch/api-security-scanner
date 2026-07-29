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

export const exportReport = async (scanId, scanData, format = "pdf") => {
  const data = await downloadReport(scanId, format);
  const blob = new Blob([data], { type: format === "pdf" ? "application/pdf" : "application/json" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Security_Report_${scanId}.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const reportService = {
  downloadReport,
  getReportMetadata,
  exportReport,
};

export default reportService;