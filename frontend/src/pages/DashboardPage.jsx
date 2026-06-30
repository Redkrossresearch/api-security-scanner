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