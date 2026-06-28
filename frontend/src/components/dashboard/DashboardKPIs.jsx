import { memo } from "react";
import StatCard from "./StatCard";
import { ShieldCheck, AlertTriangle, Activity, Globe } from "lucide-react";
import { styles } from "../../styles/dashboardStyles";

function DashboardKPIs({ dashboardData }) {
  return (
    <div style={styles.gridKPI}>
      <StatCard
        icon={<ShieldCheck size={20} />}
        title="Security Score"
        value={dashboardData.averageScore}
      />

      <StatCard
        icon={<ShieldCheck size={20} />}
        title="APIs Scanned"
        value={dashboardData.apiInventory?.totalApis || 0}
      />

      <StatCard
        icon={<AlertTriangle size={20} />}
        title="Critical Issues"
        value={dashboardData.severityDistribution?.critical || 0}
      />

      <StatCard
        icon={<Activity size={20} />}
        title="Total Scans"
        value={dashboardData.totalScans}
      />

      <StatCard
        icon={<Globe size={20} />}
        title="Assets Monitored"
        value={dashboardData.apiInventory?.totalAssets || 0}
      />

      <StatCard
        icon={<AlertTriangle size={20} />}
        title="Total Findings"
        value={dashboardData.riskMetrics?.total || 0}
      />
    </div>
  );
}

export default memo(DashboardKPIs);