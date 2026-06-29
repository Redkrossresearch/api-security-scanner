import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

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
        <ScanHistoryTable onView={handleViewScan} />
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