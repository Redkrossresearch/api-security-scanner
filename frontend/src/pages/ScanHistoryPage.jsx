import { useState } from "react";

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);

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
        {/* Header */}
        <HistoryHeader onCompare={() => setComparisonOpen(true)} />
        {/* KPI Cards */}
        <HistoryKPICards />
        <SecurityPostureEvolution />
        {/* Risk Trend */}
        <RiskTrendChart />
        {/* Analytics */}
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
        {/* Scan Records */}
        <ScanHistoryTable onView={() => setDrawerOpen(true)} />
        {/* Insights */}
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
        {/* Heatmap */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <AssetSecurityLeaderboard />
          <VulnerabilityHeatMap />
        </div>{" "}
      </div>

      {/* Drawer */}

      <ScanHistoryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Comparison Modal */}

      <ScanComparisonModal
        open={comparisonOpen}
        onClose={() => setComparisonOpen(false)}
      />
    </>
  );
}
