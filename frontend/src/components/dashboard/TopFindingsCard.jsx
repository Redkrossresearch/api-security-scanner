export default function TopFindingsCard() {
  return (
    <div
      style={{
        background:"#FFFFFF",
        border:"1px solid #E5E7EB",
        borderRadius:"24px",
        padding:"24px"
      }}
    >
      <h3>Top Findings</h3>

      <ul>
        <li>JWT Misconfiguration</li>
        <li>Rate Limiting Missing</li>
        <li>Sensitive Data Exposure</li>
        <li>CORS Misconfiguration</li>
      </ul>
    </div>
  );
}