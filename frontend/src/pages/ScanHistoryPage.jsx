import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

import ScanHistoryDrawer from "../components/scans/ScanHistoryDrawer";
import ScanComparisonModal from "../components/scans/ScanComparisonModal";
import VulnerabilityHeatMap from "../components/scans/VulnerabilityHeatmap";
import HistoryHeader from "../components/scans/HistoryHeader";
import HistoryKPICards from "../components/scans/HistoryKPICards";
import RiskTrendChart from "../components/scans/RiskTrendChart";
import ScanVolumeChart from "../components/scans/ScanVolumeChart";
import FindingsTrendChart from "../components/scans/FindingsTrendChart";
import ScanHistoryTable from "../components/scans/ScanHistoryTable";
import RiskDistribution from "../components/scans/RiskDistribution";
import AIHistoricalInsights from "../components/scans/AIHistoricalInsights";
import AssetSecurityLeaderboard from "../components/scans/AssetSecurityLeaderboard";
import SecurityPostureEvolution from "../components/scans/SecurityPostureEvolution";

export default function ScanHistoryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [selectedScan, setSelectedScan] = useState(null);

  useEffect(() => {
    if (location.state?.scan) {
      setSelectedScan(location.state.scan);
      setDrawerOpen(true);
    }
  }, [location.state]);

  const handleViewScan = (scan) => {
    setSelectedScan(scan);
    setDrawerOpen(true);
  };

  const handleExportScan = async (scan) => {
    const toastId = toast.loading("Generating PDF report...");
    try {
      const res = await api.get(`/reports/${scan.scanId}/export/pdf`, {
        responseType: "blob",
      });
      const file = new Blob([res.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = fileURL;
      link.setAttribute("download", `API_Security_Report_${scan.scanId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.dismiss(toastId);
      toast.success("Report downloaded successfully!");
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Failed to generate PDF report.");
    }
  };

  const handleRerunScan = async (scan) => {
    const toastId = toast.loading("Re-triggering security assessment...");
    try {
      const res = await api.post("/scans", {
        url: scan.targetUrl || scan.target || "https://api.example.com",
        profile: scan.profile || "Full Security Scan",
        authType: scan.authType || "Bearer Token",
      });
      toast.dismiss(toastId);
      toast.success("Scan re-triggered! Redirecting to runner progress...");
      navigate("/scans", { state: { scan: res.data.scan } });
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Failed to re-run scan: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <HistoryHeader onCompare={() => setComparisonOpen(true)} />
        <HistoryKPICards />
        <SecurityPostureEvolution />
        <RiskTrendChart />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <ScanVolumeChart />
          <FindingsTrendChart />
        </div>
        <ScanHistoryTable 
          onView={handleViewScan} 
          onExport={handleExportScan} 
          onRerun={handleRerunScan} 
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "0.9fr 1.1fr",
            gap: "20px",
            alignItems: "stretch",
          }}
        >
          <RiskDistribution />
          <AIHistoricalInsights />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <AssetSecurityLeaderboard />
          <VulnerabilityHeatMap />
        </div>
      </div>

      <ScanHistoryDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedScan(null);
        }}
        selectedScan={selectedScan}
      />

      <ScanComparisonModal
        open={comparisonOpen}
        onClose={() => setComparisonOpen(false)}
      />
    </>
  );
}