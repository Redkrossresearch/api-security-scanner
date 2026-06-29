// components/DashboardHeader.jsx
import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { getGreeting } from "../../utils/greeting";
import { reportService } from "../../services/reportService";
import { REPORT_MESSAGES } from "../../constants/messages";
import { styles } from "../../styles/dashboardStyles";

function DashboardHeader({ dashboardData }) {
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);

  const latestScan = dashboardData?.latestScans?.[0];
  const latestScanId = latestScan?._id;

  const handleExport = async () => {
    if (!latestScanId || exporting) return;

    setExporting(true);

    try {
      await reportService.exportReport(latestScanId, latestScan);
      toast.success(REPORT_MESSAGES.SUCCESS);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setExporting(false);
    }
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
          style={{
            ...styles.buttonSecondary,
            opacity: (!latestScanId || exporting) ? 0.6 : 1,
            cursor: (!latestScanId || exporting) ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          onClick={handleExport}
          disabled={!latestScanId || exporting}
          title={exporting ? "Exporting report..." : "Export latest scan report as PDF"}
        >
          {exporting ? (
            <>
              <Loader2 size={16} className="spin-loader" />
              <span>Exporting...</span>
            </>
          ) : (
            <>📥 Export Report</>
          )}
        </button>

        <button
          style={styles.buttonPrimary}
          onClick={handleNewScan}
          title="Start a new security scan"
        >
          + New Scan
        </button>
      </div>
    </div>
  );
}

export default memo(DashboardHeader);