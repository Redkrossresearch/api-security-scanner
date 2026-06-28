import { memo } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

import { styles, SIZE, COLORS, CHART } from "../../styles/dashboardStyles";

function ComplianceOverviewCard({
  complianceOverview,
  complianceData,
}) {
  return (
    <div style={{ ...styles.cardSolid, height: SIZE.chartCard }}>
      {/* ✅ Task 5: Replaced inline marginTop: 0 with styles.headingNoMargin */}
      <h3 style={styles.headingNoMargin}>Compliance Overview</h3>

      <div style={styles.complianceGrid}>
        <div>
          <div style={styles.complianceScore}>
            {complianceOverview?.score || 0}%
          </div>

          <div style={styles.complianceLabel}>
            Compliant
          </div>

          <div style={styles.complianceBar}>
            <div
              style={{
                ...styles.complianceBarFill,
                width: `${complianceOverview?.score || 0}%`,
              }}
            />
          </div>

          <div style={styles.complianceStats}>
            <div style={styles.complianceStatRow}>
              <span style={{ color: COLORS.success }}>● Passed</span>
              <span>{complianceOverview?.passed || 0}</span>
            </div>

            <div style={styles.complianceStatRow}>
              <span style={{ color: COLORS.yellow }}>● Warning</span>
              <span>{complianceOverview?.warning || 0}</span>
            </div>

            <div style={styles.complianceStatRow}>
              <span style={{ color: COLORS.critical }}>● Failed</span>
              <span>{complianceOverview?.failed || 0}</span>
            </div>
          </div>
        </div>

        {/* ✅ Task 2: Replaced magic number 220 with SIZE.radarChartHeight */}
        <ResponsiveContainer width="100%" height={SIZE.radarChartHeight}>
          <RadarChart data={complianceData}>
            {/* ✅ Task 4: Extracted polar grid stroke */}
            <PolarGrid stroke={CHART.polarGridStroke} />

            {/* ✅ Task 4: Extracted axis tick styles */}
            <PolarAngleAxis
              dataKey="subject"
              tick={CHART.axisTick}
            />

            <Radar
              dataKey="value"
              stroke={COLORS.success}
              fill={COLORS.success}
              // ✅ Task 3: Extracted fillOpacity
              fillOpacity={CHART.fillOpacity}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default memo(ComplianceOverviewCard);