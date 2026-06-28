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
}) {
  return (
    <div style={styles.gridTables}>
      <LatestScansTable
        scans={latestScans}
        page={page}
        setPage={setPage}
        pagination={pagination}
      />

      <CriticalFindingsCard
        criticalFindings={criticalFindings}
        handleVulnerabilityClick={handleVulnerabilityClick}
      />

      <ComplianceOverviewCard
        complianceOverview={complianceOverview}
        complianceData={complianceData}
      />
    </div>
  );
}

export default memo(DashboardTables);