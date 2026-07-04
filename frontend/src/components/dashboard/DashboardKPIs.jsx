import { memo } from "react";
import StatCard from "./StatCard";
import { ShieldCheck, AlertTriangle, Activity, Globe, Server, Hash } from "lucide-react";
import { styles } from "../../styles/dashboardStyles";

function DashboardKPIs({ dashboardData }) {
  return (
    <div style={styles.gridKPI}>
      <StatCard
        icon={<ShieldCheck size={20} />}
        title="Security Score"
        value={dashboardData.averageScore}
        trend="+4.2%"
        trendColor="#22C55E"
        sparklinePath="M0 42 C40 38, 80 40, 120 28 C160 16, 200 10, 240 6"
        id="score"
      />

      <StatCard
        icon={<Server size={20} />}
        title="APIs Scanned"
        value={dashboardData.apiInventory?.totalApis || 0}
        trend="+12%"
        trendColor="#C084FC"
        sparklinePath="M0 38 C35 34, 70 36, 110 24 C150 12, 190 14, 240 8"
        id="apis"
      />

      <StatCard
        icon={<AlertTriangle size={20} />}
        title="Critical Issues"
        value={dashboardData.severityDistribution?.critical || 0}
        trend="-18%"
        trendColor="#EF4444"
        sparklinePath="M0 8 C40 10, 80 18, 120 28 C160 38, 200 40, 240 42"
        id="critical"
      />

      <StatCard
        icon={<Activity size={20} />}
        title="Total Scans"
        value={dashboardData.totalScans}
        trend="+27%"
        trendColor="#3B82F6"
        sparklinePath="M0 35 C40 32, 80 20, 120 24 C160 28, 200 12, 240 6"
        id="scans"
      />

      <StatCard
        icon={<Globe size={20} />}
        title="Assets Monitored"
        value={dashboardData.apiInventory?.totalAssets || 0}
        trend="Stable"
        trendColor="#F59E0B"
        sparklinePath="M0 30 C30 32, 70 24, 110 22 C150 20, 190 12, 240 6"
        id="assets"
      />

      <StatCard
        icon={<Hash size={20} />}
        title="Total Findings"
        value={dashboardData.riskMetrics?.total || 0}
        trend="+6%"
        trendColor="#EC4899"
        sparklinePath="M0 25 C40 35, 80 18, 120 28 C160 38, 200 24, 240 22"
        id="findings"
      />
    </div>
  );
}

export default memo(DashboardKPIs);