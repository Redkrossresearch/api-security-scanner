import { styles } from "../../styles/dashboardStyles";

export default function DashboardLoading() {
  return (
    <div style={styles.skeletonContainer}>
      {/* Header */}
      <div style={styles.skeletonHeader}>
        <div>
          <div style={styles.skeletonTitle} />
          <div style={styles.skeletonSubtitle} />
        </div>

        <div style={styles.headerButtons}>
          <div style={styles.skeletonButton} />
          <div style={styles.skeletonButton} />
        </div>
      </div>

      {/* KPI Cards */}
      <div style={styles.gridKPI}>
        {[...Array(6)].map((_, index) => (
          <div key={index} style={styles.skeletonCard} />
        ))}
      </div>

      {/* Charts */}
      <div style={styles.gridCharts}>
        <div style={styles.skeletonChart} />
        <div style={styles.skeletonChart} />
        <div style={styles.skeletonChart} />
      </div>

      {/* Bottom Cards */}
      <div style={styles.gridTables}>
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            style={{
              ...styles.skeletonChart,
              height: "340px",
            }}
          />
        ))}
      </div>

      <style>
        {`
          @keyframes pulse {
            0%{
              opacity:1;
            }

            50%{
              opacity:.45;
            }

            100%{
              opacity:1;
            }
          }
        `}
      </style>
    </div>
  );
}