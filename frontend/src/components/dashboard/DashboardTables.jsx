import { memo } from "react";
import LatestScansTable from "./LatestScansTable";
import CriticalFindingsCard from "./CriticalFindingsCard";
import ComplianceOverviewCard from "./ComplianceOverviewCard";
import { styles } from "../../styles/dashboardStyles";

function DashboardTables({
  latestScans,
  criticalFindings,
  handleVulnerabilityClick,
  complianceOverview,
  complianceData,
  page,
  setPage,
  pagination,

  selectedScan,
  setSelectedScan,
  fetchScanDetails, // ✅ NEW

  selectedSeverity,
  setSelectedSeverity,
}) {
  return (
    <div style={styles.gridTables}>
      <LatestScansTable
        scans={latestScans}
        page={page}
        setPage={setPage}
        pagination={pagination}

        selectedScan={selectedScan}
        setSelectedScan={setSelectedScan}
        fetchScanDetails={fetchScanDetails} // ✅ NEW
      />

      <CriticalFindingsCard
        criticalFindings={criticalFindings}
        handleVulnerabilityClick={handleVulnerabilityClick}

        selectedScan={selectedScan}

        selectedSeverity={selectedSeverity}
        setSelectedSeverity={setSelectedSeverity}
      />

      <ComplianceOverviewCard
        complianceOverview={complianceOverview}
        complianceData={complianceData}
      />
    </div>
  );
}

export default memo(DashboardTables);