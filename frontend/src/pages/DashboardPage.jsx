import VulnerabilityPanel from "../components/dashboard/VulnerabilityPanel";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardKPIs from "../components/dashboard/DashboardKPIs";
import DashboardCharts from "../components/dashboard/DashboardCharts";
import DashboardTables from "../components/dashboard/DashboardTables";
import DashboardLoading from "../components/dashboard/DashboardLoading";
import DashboardError from "../components/dashboard/DashboardError";
import useDashboard from "../hooks/useDashboard";
import { styles } from "../styles/dashboardStyles";
import { useState } from "react";

export default function DashboardPage() {
  const {
    dashboardData,
    loading,
    error,
    trendRange,
    setTrendRange,
    selectedVulnerability,
    setSelectedVulnerability,
    criticalFindings,
    criticalCount,
    complianceData,
    page,
    setPage,
    pagination,
    fetchDashboard,
    handleVulnerabilityClick,

    // ✅ Hook se selectedScan le rahe hain
    selectedScan,
    setSelectedScan,
    fetchScanDetails,
  } = useDashboard();

  // ✅ Active severity filter (ye local rahega)
  const [selectedSeverity, setSelectedSeverity] = useState("all");

  if (loading) {
    return <DashboardLoading />;
  }

  if (error || !dashboardData) {
    return <DashboardError error={error} onRetry={fetchDashboard} />;
  }

  return (
    <div style={styles.container}>
      {/* Degraded / Offline Banner */}
      {dashboardData?.isOffline && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "linear-gradient(90deg, rgba(245,158,11,0.15), rgba(239,68,68,0.15))",
          border: "1px solid rgba(245,158,11,0.3)", borderRadius: "10px",
          padding: "10px 16px", marginBottom: "16px", color: "#FCD34D", fontSize: "13px",
          boxShadow: "0 0 15px rgba(245,158,11,0.1)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "16px" }}>⚠️</span>
            <span><strong>Offline / Degraded Mode:</strong> Backend server is spinning up or unreachable. Displaying cached workspace view.</span>
          </div>
          <button
            onClick={() => fetchDashboard(page)}
            style={{
              background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.4)",
              color: "#FDE68A", borderRadius: "6px", padding: "4px 12px",
              cursor: "pointer", fontSize: "12px", fontWeight: "700",
              transition: "all 0.2s ease"
            }}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Header */}
      <DashboardHeader dashboardData={dashboardData} />


      {/* KPI Cards */}
      <DashboardKPIs dashboardData={dashboardData} />

      {/* Charts Section */}
      <DashboardCharts
        securityTrend={dashboardData.securityTrend}
        severityDistribution={dashboardData.severityDistribution}
        trendRange={trendRange}
        setTrendRange={setTrendRange}
        criticalCount={criticalCount}
        criticalFindings={criticalFindings}
      />

      {/* Tables Section */}
      <DashboardTables
        latestScans={dashboardData.latestScans}
        criticalFindings={criticalFindings}
        handleVulnerabilityClick={handleVulnerabilityClick}
        complianceOverview={dashboardData.complianceOverview}
        complianceData={complianceData}
        page={page}
        setPage={setPage}
        pagination={pagination}

        selectedScan={selectedScan}
        setSelectedScan={setSelectedScan}
        fetchScanDetails={fetchScanDetails}

        selectedSeverity={selectedSeverity}
        setSelectedSeverity={setSelectedSeverity}
      />

      {/* Vulnerability Panel */}
      <VulnerabilityPanel
        vulnerability={selectedVulnerability}
        onClose={() => setSelectedVulnerability(null)}
      />
    </div>
  );
}