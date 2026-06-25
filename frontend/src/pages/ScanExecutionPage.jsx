import ScanHeader from "../components/scans/ScanHeader";
import ScanConfigurationCard from "../components/scans/ScanConfigurationCard";
import ScanStatusCard from "../components/scans/ScanStatusCard";
import EndpointDiscoveryTable from "../components/scans/EndpointDiscoveryTable";
import LiveScannerLogs from "../components/scans/LiveScannerLogs";
import AttackSurfaceMap from "../components/scans/AttackSurfaceMap";
import FindingsPanel from "../components/scans/FindingsPanel";
import RequestResponseInspector from "../components/scans/RequestResponseInspector";
import AISecurityAnalyst from "../components/scans/AISecurityAnalyst";

export default function ScanExecutionPage() {
  return (
<div
  style={{
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  }}
>
      <ScanHeader />

      <ScanConfigurationCard />

      <ScanStatusCard />

      {/* Row 1 */}

<div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1.15fr",
    gap: "20px",
    alignItems: "stretch",
  }}
>
        <EndpointDiscoveryTable />

        <LiveScannerLogs />

        <AttackSurfaceMap />
      </div>

      {/* Row 2 */}

<div
  style={{
    display: "grid",
    gridTemplateColumns: "1.15fr 1.4fr 1fr",
    gap: "20px",
    alignItems: "stretch",
  }}
>
  <FindingsPanel />

  <RequestResponseInspector />

  <AISecurityAnalyst />
</div>
    </div>
  );
}