import { AlertTriangle } from "lucide-react";
import { styles } from "../../styles/dashboardStyles";

export default function DashboardError({ error, onRetry }) {
  return (
    <div style={styles.errorContainer}>
      <AlertTriangle size={64} color="#EF4444" />

      <h2 style={styles.errorTitle}>
        {error || "Failed to load dashboard"}
      </h2>

      <p style={styles.errorText}>
        Please check your connection and try again.
      </p>

      <button
        onClick={onRetry}
        style={styles.buttonPrimary}
      >
        Retry
      </button>
    </div>
  );
}