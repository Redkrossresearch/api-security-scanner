// services/reportService.js
import api from "./api";
import { downloadFile } from "../utils/downloadFile";
import { REPORT_MESSAGES } from "../constants/messages";

export const reportService = {
  /**
   * Export scan report as PDF
   * @param {string} scanId - The scanId field (e.g., "SCAN-1782760224275-546"), NOT MongoDB _id
   * @param {Object} scanData - Scan data (optional, for better filename)
   * @throws {Error} When export fails
   */
  exportReport: async (scanId, scanData = null) => {
    try {
      // ✅ Sprint 2.3.1: scanId is now the custom scanId string, not MongoDB _id
      const response = await api.get(`/reports/${scanId}/export/pdf`, {
        responseType: "blob",
      });

      // Validate response
      if (!response.data || response.data.size === 0) {
        throw new Error(REPORT_MESSAGES.ERROR_EMPTY);
      }

      // Generate professional filename with sanitized target
      const target = (
        scanData?.targetUrl ||
        scanData?.target ||
        scanId
      )
        .replace(/^https?:\/\//, "") // Remove protocol
        .replace(/[^\w.-]/g, "_");   // Replace invalid chars with _

      const date = new Date().toISOString().split("T")[0];
      const safeTarget = target.slice(0, 40); // Truncate long URLs

      const filename = `security-report-${safeTarget}-${date}.pdf`;

      // Download file
      const blob = new Blob([response.data], { type: "application/pdf" });
      downloadFile(blob, filename);

    } catch (error) {
      // ✅ Preserve custom error messages (like ERROR_EMPTY)
      if (Object.values(REPORT_MESSAGES).includes(error.message)) {
        throw error;
      }

      // Handle HTTP/network errors
      let errorMessage = REPORT_MESSAGES.ERROR_GENERIC;

      if (error.response) {
        switch (error.response.status) {
          case 404:
            errorMessage = REPORT_MESSAGES.ERROR_NOT_FOUND;
            break;
          case 401:
            errorMessage = REPORT_MESSAGES.ERROR_UNAUTHORIZED;
            break;
          case 500:
            errorMessage = REPORT_MESSAGES.ERROR_SERVER;
            break;
          default:
            errorMessage = `${REPORT_MESSAGES.ERROR_GENERIC} (${error.response.status})`;
        }
      } else if (error.request) {
        errorMessage = REPORT_MESSAGES.ERROR_NETWORK;
      }

      // Throw error for UI to handle
      throw new Error(errorMessage);
    }
  },
};