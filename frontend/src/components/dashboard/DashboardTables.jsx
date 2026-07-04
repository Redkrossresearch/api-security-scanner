import { memo } from "react";
import LatestScansTable from "./LatestScansTable";
import CriticalFindingsCard from "./CriticalFindingsCard";
import LiveThreatFeed from "./LiveThreatFeed";
import { styles } from "../../styles/dashboardStyles";

function DashboardTables({
  latestScans,
  criticalFindings,
  handleVulnerabilityClick,
  page,
  setPage,
  pagination,
  selectedScan,
  setSelectedScan,
  fetchScanDetails,
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
        fetchScanDetails={fetchScanDetails}
      />

      <CriticalFindingsCard
        criticalFindings={criticalFindings}
        handleVulnerabilityClick={handleVulnerabilityClick}
        selectedScan={selectedScan}
        selectedSeverity={selectedSeverity}
        setSelectedSeverity={setSelectedSeverity}
      />

      <LiveThreatFeed />
    </div>
  );
}

export default memo(DashboardTables);