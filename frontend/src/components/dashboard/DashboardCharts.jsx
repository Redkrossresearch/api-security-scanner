import { memo } from "react";
import ScanTrendChart from "./ScanTrendChart";
import SeverityChart from "./SeverityChart";
import AISecurityCopilot from "./AISecurityCopilot";
import { styles } from "../../styles/dashboardStyles";

function DashboardCharts({
  securityTrend,
  severityDistribution,
  trendRange,
  setTrendRange,
  criticalCount,
  criticalFindings,
}) {
  return (
    <div style={styles.gridCharts}>
      <ScanTrendChart
        data={securityTrend}
        range={trendRange}
        setRange={setTrendRange}
      />

      <SeverityChart data={severityDistribution} />

      <AISecurityCopilot
        criticalCount={criticalCount}
        criticalFindings={criticalFindings}
      />
    </div>
  );
}

export default memo(DashboardCharts);