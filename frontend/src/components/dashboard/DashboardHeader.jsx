import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { getGreeting } from "../../utils/greeting";
import { styles } from "../../styles/dashboardStyles";

function DashboardHeader({ dashboardData }) {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const latestScanId = dashboardData?.latestScans?.[0]?._id;

  const handleExport = () => {
    if (!latestScanId) return;

    window.open(
      `${API_URL}/reports/${latestScanId}/export/pdf`,
      "_blank"
    );
  };

  const handleNewScan = () => {
    navigate("/scans");
  };

  return (
    <div style={styles.header}>
      <div>
        <h1 style={styles.headerTitle}>
          {getGreeting()}, Atharv 👋
        </h1>

        <p style={styles.headerSubtitle}>
          Here's what's happening with your API security posture today.
        </p>
      </div>

      <div style={styles.headerButtons}>
        <button
          style={styles.buttonSecondary}
          onClick={handleExport}
          disabled={!latestScanId}
        >
          Export Report
        </button>

        <button
          style={styles.buttonPrimary}
          onClick={handleNewScan}
        >
          + New Scan
        </button>
      </div>
    </div>
  );
}

export default memo(DashboardHeader);