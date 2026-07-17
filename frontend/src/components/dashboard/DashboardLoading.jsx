export default function DashboardLoading() {
  const shimmerStyle = {
    background: "linear-gradient(90deg, rgba(139,92,246,0.05) 25%, rgba(167,139,250,0.18) 50%, rgba(139,92,246,0.05) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.6s infinite linear",
    borderRadius: "12px",
  };

  const cardBase = {
    background: "rgba(22,30,49,0.9)",
    border: "1px solid rgba(139,92,246,0.15)",
    borderRadius: "14px",
    padding: "20px",
    overflow: "hidden",
    position: "relative",
  };

  return (
    <div style={{
      padding: "28px",
      background: "linear-gradient(135deg, #070d19 0%, #020510 100%)",
      minHeight: "100vh",
      fontFamily: "'Outfit', 'Inter', sans-serif"
    }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .skeleton-item {
          animation: fadeIn 0.4s ease forwards, shimmer 1.6s infinite linear;
          background: linear-gradient(90deg, rgba(139,92,246,0.05) 25%, rgba(167,139,250,0.18) 50%, rgba(139,92,246,0.05) 75%);
          background-size: 200% 100%;
          border-radius: 8px;
        }
      `}</style>

      {/* Header Skeleton */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <div className="skeleton-item" style={{ height: "28px", width: "280px", marginBottom: "10px" }} />
          <div className="skeleton-item" style={{ height: "14px", width: "200px" }} />
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <div className="skeleton-item" style={{ height: "38px", width: "120px", borderRadius: "10px" }} />
          <div className="skeleton-item" style={{ height: "38px", width: "120px", borderRadius: "10px" }} />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "24px"
      }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ ...cardBase, animationDelay: `${i * 80}ms` }}>
            <div className="skeleton-item" style={{ height: "11px", width: "80px", marginBottom: "14px" }} />
            <div className="skeleton-item" style={{ height: "36px", width: "100px", marginBottom: "10px" }} />
            <div className="skeleton-item" style={{ height: "10px", width: "60px" }} />
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "16px",
        marginBottom: "24px"
      }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ ...cardBase }}>
            <div className="skeleton-item" style={{ height: "13px", width: "120px", marginBottom: "16px" }} />
            <div className="skeleton-item" style={{ height: "180px", width: "100%", borderRadius: "10px" }} />
          </div>
        ))}
      </div>

      {/* Bottom Tables */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {[...Array(2)].map((_, i) => (
          <div key={i} style={{ ...cardBase }}>
            <div className="skeleton-item" style={{ height: "14px", width: "160px", marginBottom: "20px" }} />
            {[...Array(5)].map((_, j) => (
              <div key={j} style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "14px" }}>
                <div className="skeleton-item" style={{ height: "32px", width: "32px", borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton-item" style={{ height: "11px", width: "70%", marginBottom: "6px" }} />
                  <div className="skeleton-item" style={{ height: "9px", width: "40%" }} />
                </div>
                <div className="skeleton-item" style={{ height: "22px", width: "60px", borderRadius: "8px" }} />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Loading indicator at bottom */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "32px", gap: "10px" }}>
        <div style={{
          width: "8px", height: "8px", borderRadius: "50%",
          background: "#C084FC", animation: "pulse 1.4s ease-in-out infinite"
        }} />
        <div style={{
          width: "8px", height: "8px", borderRadius: "50%",
          background: "#A78BFA", animation: "pulse 1.4s ease-in-out 0.2s infinite"
        }} />
        <div style={{
          width: "8px", height: "8px", borderRadius: "50%",
          background: "#8B5CF6", animation: "pulse 1.4s ease-in-out 0.4s infinite"
        }} />
        <style>{`@keyframes pulse { 0%,100% { opacity:0.3; transform:scale(0.8); } 50% { opacity:1; transform:scale(1.2); } }`}</style>
      </div>
    </div>
  );
}