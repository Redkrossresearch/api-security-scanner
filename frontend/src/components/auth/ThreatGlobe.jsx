import { useRef, useState, useEffect, useMemo } from "react";
import Globe from "react-globe.gl";

// Node label pill - matches reference exactly
const NodePill = ({ name, style }) => (
  <div style={{
    position: "absolute",
    background: "rgba(8,12,28,0.92)",
    border: "1px solid rgba(249,115,22,0.4)",
    borderRadius: "8px",
    padding: "7px 14px",
    backdropFilter: "blur(16px)",
    whiteSpace: "nowrap",
    zIndex: 20,
    boxShadow: "0 0 12px rgba(249,115,22,0.15)",
    ...style,
  }}>
    <div style={{ color: "#FFFFFF", fontSize: "12px", fontWeight: "700" }}>{name}</div>
    <div style={{ color: "#10B981", fontSize: "10px", fontWeight: "600", marginTop: "1px" }}>Active</div>
  </div>
);

// SVG connector lines from node pills to globe edge
const ConnectorSVG = ({ containerW, containerH, globeSize, nodes }) => {
  const cx = containerW / 2;
  const globeTop = 60; // offset for header
  const cy = globeTop + globeSize / 2;
  const r = globeSize / 2 - 10;

  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 15 }}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {nodes.map((node, i) => {
        // pill anchor point (center of pill)
        const px = node.pillX;
        const py = node.pillY;
        // direction from globe center to pill
        const dx = px - cx;
        const dy = py - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // globe edge point
        const ex = cx + (dx / dist) * r;
        const ey = cy + (dy / dist) * r;
        // midpoint for curve
        const mx = (px + ex) / 2;
        const my = (py + ey) / 2;

        return (
          <g key={i}>
            <line
              x1={ex} y1={ey}
              x2={px} y2={py}
              stroke="rgba(249,115,22,0.45)"
              strokeWidth="1"
              strokeDasharray="3 5"
            />
            <circle cx={ex} cy={ey} r="3" fill="#F97316" opacity="0.8" />
            <circle cx={px} cy={py} r="2.5" fill="#F97316" opacity="0.6" />
          </g>
        );
      })}
    </svg>
  );
};

// Tiny ambient sparks floating just outside the globe rim — pure decoration,
// adds the "tiny glowing particles around the globe" the reference has
const GlobeSparks = ({ size }) => {
  const sparks = useMemo(() => Array.from({ length: 38 }, (_, i) => ({
    angle: (i / 38) * Math.PI * 2 + Math.random() * 0.3,
    dist: 0.48 + Math.random() * 0.26,
    r: Math.random() * 1.7 + 0.5,
    dur: 2 + Math.random() * 3,
    delay: Math.random() * 3,
    color: Math.random() > 0.4 ? "#F97316" : "#60A5FA",
  })), []);
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 16, overflow: "visible" }}
      viewBox={`0 0 ${size} ${size}`}
    >
      {sparks.map((s, i) => {
        const cx = size / 2 + Math.cos(s.angle) * size * s.dist;
        const cy = size / 2 + Math.sin(s.angle) * size * s.dist;
        return (
          <circle key={i} cx={cx} cy={cy} r={s.r} fill={s.color} opacity="0.7">
            <animate attributeName="opacity" values="0.08;0.9;0.08" dur={`${s.dur}s`} begin={`${s.delay}s`} repeatCount="indefinite" />
          </circle>
        );
      })}
    </svg>
  );
};

// Dense multi-layer orbit rings drifting around the globe — 9 rings, mixed
// orange/blue, varied tilt — echoes reference's busy halo of orbital paths
const OrbitRings = ({ size }) => {
  const rings = [
    { rx: 0.54, ry: 0.12, rot: -18, dash: "4 9",  col: "rgba(249,115,22,0.34)", dur: 38 },
    { rx: 0.59, ry: 0.09, rot: 12,  dash: "2 11", col: "rgba(59,130,246,0.24)", dur: 52 },
    { rx: 0.51, ry: 0.16, rot: 35,  dash: "5 8",  col: "rgba(249,115,22,0.20)", dur: 44 },
    { rx: 0.62, ry: 0.065,rot: -38, dash: "3 14", col: "rgba(249,115,22,0.15)", dur: 60 },
    { rx: 0.57, ry: 0.20, rot: -55, dash: "2 9",  col: "rgba(59,130,246,0.16)", dur: 48 },
    { rx: 0.64, ry: 0.10, rot: 58,  dash: "6 7",  col: "rgba(249,115,22,0.13)", dur: 56 },
    { rx: 0.49, ry: 0.22, rot: 5,   dash: "1 8",  col: "rgba(96,165,250,0.14)", dur: 40 },
    { rx: 0.67, ry: 0.05, rot: -8,  dash: "4 16", col: "rgba(249,115,22,0.10)", dur: 64 },
    { rx: 0.55, ry: 0.27, rot: 72,  dash: "3 10", col: "rgba(249,115,22,0.09)", dur: 50 },
  ];
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 14, overflow: "visible" }}
      viewBox={`0 0 ${size} ${size}`}
    >
      {rings.map((r, i) => (
        <ellipse
          key={i}
          cx={size / 2} cy={size / 2}
          rx={size * r.rx} ry={size * r.ry}
          transform={`rotate(${r.rot} ${size / 2} ${size / 2})`}
          fill="none" stroke={r.col} strokeWidth="1.1" strokeDasharray={r.dash}
        >
          <animateTransform attributeName="transform" type="rotate"
            from={`${r.rot} ${size / 2} ${size / 2}`} to={`${r.rot + 360} ${size / 2} ${size / 2}`}
            dur={`${r.dur}s`} repeatCount="indefinite" />
        </ellipse>
      ))}
    </svg>
  );
};

// Layered atmosphere glow rendered behind the globe canvas — triple-band
// bloom (orange core, orange falloff, blue ambient halo) the flat
// react-globe.gl atmosphereColor prop can't deliver alone
const AtmosphereBloom = () => (
  <>
    <div style={{
      position: "absolute", inset: "-22%", borderRadius: "50%", zIndex: 0, pointerEvents: "none",
      background: "radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 58%)",
      filter: "blur(14px)",
    }} />
    <div style={{
      position: "absolute", inset: "-16%", borderRadius: "50%", zIndex: 1, pointerEvents: "none",
      background: "radial-gradient(circle, rgba(249,115,22,0.20) 0%, rgba(249,115,22,0.08) 42%, transparent 62%)",
      filter: "blur(8px)",
    }} />
    <div style={{
      position: "absolute", inset: "-8%", borderRadius: "50%", zIndex: 1, pointerEvents: "none",
      background: "radial-gradient(circle, transparent 64%, rgba(249,115,22,0.16) 78%, transparent 92%)",
      filter: "blur(3px)",
    }} />
  </>
);

// Shield architecture diagram below globe - matches reference, with richer
// layered bloom on the core and breathing connectors
const ShieldDiagram = () => (
  <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 0, position: "relative" }}>

    {/* Threat Intelligence Engine */}
    <div style={{
      padding: "10px 28px",
      background: "rgba(8,12,28,0.95)",
      border: "1px solid rgba(249,115,22,0.4)",
      borderRadius: "10px",
      textAlign: "center",
      boxShadow: "0 0 20px rgba(249,115,22,0.14), 0 0 44px rgba(249,115,22,0.05)",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    }}>
      {/* Brain icon */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
      </svg>
      <div>
        <div style={{ color: "#F97316", fontSize: "12px", fontWeight: "800", letterSpacing: "1px" }}>THREAT INTELLIGENCE ENGINE</div>
        <div style={{ color: "#64748B", fontSize: "10px", marginTop: "1px" }}>Collect • Correlate • Analyze</div>
      </div>
    </div>

    {/* Connector line down (with traveling glow dot) */}
    <div style={{ width: "1px", height: "20px", background: "rgba(249,115,22,0.5)", position: "relative" }}>
      <div className="connDot" style={{
        position: "absolute", left: "-2.5px", top: 0, width: "6px", height: "6px",
        borderRadius: "50%", background: "#F97316", boxShadow: "0 0 8px rgba(249,115,22,0.9)",
      }} />
    </div>

    {/* Middle row */}
    <div style={{ display: "flex", width: "100%", gap: "8px", alignItems: "stretch" }}>

      {/* Real-time Protection */}
      <div style={{
        flex: 1,
        padding: "14px 14px",
        background: "rgba(8,12,28,0.9)",
        border: "1px solid rgba(59,130,246,0.3)",
        borderRadius: "10px",
        boxShadow: "0 0 18px rgba(59,130,246,0.08), inset 0 1px 0 rgba(255,255,255,0.03)",
        position: "relative",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <div style={{ color: "#3B82F6", fontSize: "10px", fontWeight: "800", letterSpacing: "0.5px" }}>REAL-TIME PROTECTION</div>
        </div>
        {["Behavioral Analysis", "Anomaly Detection", "Attack Prevention"].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "6px" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span style={{ color: "#94A3B8", fontSize: "10px" }}>{item}</span>
          </div>
        ))}
        {/* Right connector line */}
        <div style={{
          position: "absolute",
          right: "-8px",
          top: "50%",
          width: "8px",
          height: "1px",
          background: "rgba(249,115,22,0.5)",
        }} />
      </div>

      {/* ATHX Shield Core */}
      <div style={{
        width: "140px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px 8px",
        background: "linear-gradient(180deg, rgba(249,115,22,0.20) 0%, rgba(249,115,22,0.06) 100%)",
        border: "1.5px solid rgba(249,115,22,0.7)",
        borderRadius: "12px",
        boxShadow: "0 0 44px rgba(249,115,22,0.35), 0 0 90px rgba(249,115,22,0.14), inset 0 0 30px rgba(249,115,22,0.06)",
        position: "relative",
      }}>
        {/* Shield SVG */}
        <svg width="44" height="50" viewBox="0 0 44 50" fill="none" style={{ marginBottom: "8px", filter: "drop-shadow(0 0 10px rgba(249,115,22,0.8)) drop-shadow(0 0 22px rgba(249,115,22,0.4))" }}>
          <path d="M22 3L5 11v14c0 10.5 7.2 20.3 17 22.9C31.8 45.3 39 35.5 39 25V11L22 3z"
            fill="rgba(249,115,22,0.2)" stroke="#F97316" strokeWidth="1.5"/>
          <path d="M22 10L12 15v9c0 6 4 11.5 10 13 6-1.5 10-7 10-13v-9L22 10z"
            fill="rgba(249,115,22,0.3)" stroke="#F97316" strokeWidth="1"/>
          {/* Check inside shield */}
          <polyline points="16,23 20,27 28,19" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
        <div style={{ color: "#F97316", fontSize: "13px", fontWeight: "900", letterSpacing: "1.5px", textAlign: "center" }}>ATHX</div>
        <div style={{ color: "#F97316", fontSize: "9px", fontWeight: "700", letterSpacing: "1px", marginBottom: "8px" }}>SECURITY CORE</div>
        <div style={{ color: "#94A3B8", fontSize: "8.5px", textAlign: "center", lineHeight: "1.6" }}>
          AI Threat Analysis<br/>Risk Correlation<br/>Compliance Engine
        </div>
        {/* Glow rings — double layer */}
        <div style={{
          position: "absolute",
          inset: "-8px",
          borderRadius: "16px",
          border: "1px solid rgba(249,115,22,0.22)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute",
          inset: "-16px",
          borderRadius: "22px",
          border: "1px solid rgba(249,115,22,0.1)",
          pointerEvents: "none",
        }} />
      </div>

      {/* Compliance Engine */}
      <div style={{
        flex: 1,
        padding: "14px 14px",
        background: "rgba(8,12,28,0.9)",
        border: "1px solid rgba(16,185,129,0.3)",
        borderRadius: "10px",
        boxShadow: "0 0 18px rgba(16,185,129,0.08), inset 0 1px 0 rgba(255,255,255,0.03)",
        position: "relative",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <div style={{ color: "#10B981", fontSize: "10px", fontWeight: "800", letterSpacing: "0.5px" }}>COMPLIANCE ENGINE</div>
        </div>
        {["OWASP API Top 10", "SOC 2 • ISO 27001", "Continuous Monitoring"].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "6px" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span style={{ color: "#94A3B8", fontSize: "10px" }}>{item}</span>
          </div>
        ))}
        {/* Left connector line */}
        <div style={{
          position: "absolute",
          left: "-8px",
          top: "50%",
          width: "8px",
          height: "1px",
          background: "rgba(249,115,22,0.5)",
        }} />
      </div>
    </div>

    {/* Connector line down (with traveling glow dot) */}
    <div style={{ width: "1px", height: "20px", background: "rgba(249,115,22,0.5)", position: "relative" }}>
      <div className="connDot2" style={{
        position: "absolute", left: "-2.5px", top: 0, width: "6px", height: "6px",
        borderRadius: "50%", background: "#F97316", boxShadow: "0 0 8px rgba(249,115,22,0.9)",
      }} />
    </div>

    {/* Security Command Center */}
    <div style={{
      padding: "10px 28px",
      background: "rgba(8,12,28,0.95)",
      border: "1px solid rgba(249,115,22,0.4)",
      borderRadius: "10px",
      textAlign: "center",
      boxShadow: "0 0 20px rgba(249,115,22,0.14), 0 0 44px rgba(249,115,22,0.05)",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    }}>
      {/* Monitor icon */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
      <div>
        <div style={{ color: "#F97316", fontSize: "12px", fontWeight: "800", letterSpacing: "1px" }}>SECURITY COMMAND CENTER</div>
        <div style={{ color: "#64748B", fontSize: "10px", marginTop: "1px" }}>Unified Visibility • Actionable Insights • Complete Control</div>
      </div>
    </div>

    {/* Curved orange line on right side (decorative, like reference) */}
    <svg
      style={{ position: "absolute", right: "-10px", top: "10px", height: "calc(100% - 20px)", width: "30px", pointerEvents: "none" }}
      viewBox="0 0 30 300"
      preserveAspectRatio="none"
    >
      <path d="M15 0 Q25 75 15 150 Q5 225 15 300"
        stroke="rgba(249,115,22,0.35)" strokeWidth="1.5" fill="none" strokeDasharray="4 6"/>
    </svg>

    <style>{`
      @keyframes connFall  { 0% { top: -4px; opacity: 0; } 15% { opacity: 1; } 100% { top: 20px; opacity: 0; } }
      .connDot, .connDot2 { animation: connFall 2s ease-in-out infinite; }
      .connDot2 { animation-delay: 1s; }
    `}</style>
  </div>
);

export default function ThreatGlobe() {
  const globeRef = useRef();
  const [attacks, setAttacks] = useState([]);
  const [globeSize, setGlobeSize] = useState(460);
  const containerRef = useRef();

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        const size = Math.min(w * 0.62, 480);
        setGlobeSize(Math.max(size, 320));
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const dataNodes = [
    { lat: 40.7, lng: -74, name: "US-EAST", type: "protected" },
    { lat: 51.5, lng: -0.1, name: "EU-WEST", type: "trusted" },
    { lat: 19.0, lng: 72.8, name: "IN-MUMBAI", type: "protected" },
    { lat: 1.3, lng: 103.8, name: "SG-SINGAPORE", type: "protected" },
    { lat: 35.6, lng: 139.6, name: "JP-TOKYO", type: "trusted" },
    { lat: -33.8, lng: 151.2, name: "AU-SYDNEY", type: "trusted" },
    { lat: -23.5, lng: -46.6, name: "SAO-PAULO", type: "trusted" },
    { lat: 55.7, lng: 37.6, name: "RU-MOSCOW", type: "threat" },
    { lat: 39.9, lng: 116.4, name: "CN-BEIJING", type: "threat" },
  ];

  // Purely decorative "city light" points — gives the globe surface the busy,
  // satellite-at-night texture the reference has. Does not touch dataNodes,
  // attack generation, or any existing logic; it's an additional points layer.
  // Major hub cities + small random jitter clusters around each, to mimic
  // the dense satellite-photo look of the reference (100+ points total).
  const cityLights = useMemo(() => {
    const hubs = [
      { lat: 40.7, lng: -74 }, { lat: 34.0, lng: -118.2 }, { lat: 41.9, lng: -87.6 },
      { lat: 29.8, lng: -95.4 }, { lat: 25.8, lng: -80.2 }, { lat: 45.5, lng: -73.6 },
      { lat: 19.4, lng: -99.1 }, { lat: -23.5, lng: -46.6 }, { lat: -34.6, lng: -58.4 },
      { lat: 51.5, lng: -0.1 }, { lat: 48.9, lng: 2.4 }, { lat: 52.5, lng: 13.4 },
      { lat: 41.9, lng: 12.5 }, { lat: 40.4, lng: -3.7 }, { lat: 55.7, lng: 37.6 },
      { lat: 59.9, lng: 30.3 }, { lat: 30.0, lng: 31.2 }, { lat: 6.5, lng: 3.4 },
      { lat: -1.3, lng: 36.8 }, { lat: -26.2, lng: 28.0 }, { lat: 28.6, lng: 77.2 },
      { lat: 19.0, lng: 72.8 }, { lat: 13.1, lng: 80.3 }, { lat: 22.3, lng: 114.2 },
      { lat: 31.2, lng: 121.5 }, { lat: 39.9, lng: 116.4 }, { lat: 35.7, lng: 139.7 },
      { lat: 37.6, lng: 127.0 }, { lat: 1.3, lng: 103.8 }, { lat: 13.8, lng: 100.5 },
      { lat: -6.2, lng: 106.8 }, { lat: -33.9, lng: 151.2 }, { lat: -37.8, lng: 145.0 },
      { lat: 24.5, lng: 54.4 }, { lat: 25.2, lng: 55.3 }, { lat: 14.6, lng: 121.0 },
      { lat: 23.1, lng: 113.3 }, { lat: 22.5, lng: 88.4 }, { lat: 18.5, lng: 73.9 },
      { lat: 12.9, lng: 77.6 }, { lat: -29.9, lng: 31.0 }, { lat: 5.6, lng: -0.2 },
      { lat: 33.5, lng: 36.3 }, { lat: 41.0, lng: 28.9 }, { lat: 50.1, lng: 14.4 },
      { lat: 52.2, lng: 21.0 }, { lat: 59.3, lng: 18.1 }, { lat: 55.7, lng: 12.6 },
    ];
    const pts = [];
    hubs.forEach(h => {
      pts.push({ ...h, size: 0.26 + Math.random() * 0.14 });
      // jitter cluster of 2–3 satellite points around each hub for density
      const n = 2 + Math.floor(Math.random() * 2);
      for (let k = 0; k < n; k++) {
        pts.push({
          lat: h.lat + (Math.random() - 0.5) * 4,
          lng: h.lng + (Math.random() - 0.5) * 4,
          size: 0.12 + Math.random() * 0.1,
        });
      }
    });
    return pts;
  }, []);

  // Long-haul backbone routes between major continents — sparse, high-altitude
  // arcs that read as undersea cable / backbone lines, distinct from the
  // dense short mesh below
  const backboneRoutes = useMemo(() => [
    { startLat: 40.7, startLng: -74,   endLat: 51.5, endLng: -0.1 },
    { startLat: 51.5, startLng: -0.1,  endLat: 28.6, endLng: 77.2 },
    { startLat: 28.6, startLng: 77.2,  endLat: 1.3,  endLng: 103.8 },
    { startLat: 1.3,  startLng: 103.8, endLat: 35.7, endLng: 139.7 },
    { startLat: 35.7, startLng: 139.7,endLat: -33.9, endLng: 151.2 },
    { startLat: 40.7, startLng: -74,   endLat: -23.5,endLng: -46.6 },
    { startLat: 51.5, startLng: -0.1,  endLat: -1.3, endLng: 36.8 },
    { startLat: 22.3, startLng: 114.2, endLat: 39.9, endLng: 116.4 },
    { startLat: 19.0, startLng: 72.8,  endLat: 24.5, endLng: 54.4 },
  ].map(r => ({ ...r, kind: "backbone" })), []);

  // Dense short-range mesh between city lights — the "hundreds of network
  // connections" effect, purely additive arcs layer with no altitude pop.
  // Capped per-node degree so point density growth doesn't blow up the line count.
  const meshLines = useMemo(() => {
    const lines = [];
    const degree = new Array(cityLights.length).fill(0);
    for (let i = 0; i < cityLights.length; i++) {
      if (degree[i] >= 4) continue;
      for (let j = i + 1; j < cityLights.length; j++) {
        if (degree[j] >= 4) continue;
        const a = cityLights[i], b = cityLights[j];
        const d = Math.hypot(a.lat - b.lat, a.lng - b.lng);
        if (d < 22 && Math.random() < 0.45) {
          lines.push({ startLat: a.lat, startLng: a.lng, endLat: b.lat, endLng: b.lng, kind: "mesh" });
          degree[i]++; degree[j]++;
          if (degree[i] >= 4) break;
        }
      }
    }
    return lines;
  }, [cityLights]);

  const generateAttackRoutes = () => {
    const threats = dataNodes.filter(n => n.type === "threat");
    const targets = dataNodes.filter(n => n.type !== "threat");
    const routes = [];
    for (let i = 0; i < 3; i++) {
      routes.push({
        startLat: threats[Math.floor(Math.random() * threats.length)].lat,
        startLng: threats[Math.floor(Math.random() * threats.length)].lng,
        endLat: targets[Math.floor(Math.random() * targets.length)].lat,
        endLng: targets[Math.floor(Math.random() * targets.length)].lng,
        color: "#EF4444",
      });
    }
    for (let i = 0; i < 2; i++) {
      routes.push({
        startLat: targets[Math.floor(Math.random() * targets.length)].lat,
        startLng: targets[Math.floor(Math.random() * targets.length)].lng,
        endLat: targets[Math.floor(Math.random() * targets.length)].lat,
        endLng: targets[Math.floor(Math.random() * targets.length)].lng,
        color: "#10B981",
      });
    }
    return routes;
  };

  useEffect(() => {
    setAttacks(generateAttackRoutes());
    const interval = setInterval(() => setAttacks(generateAttackRoutes()), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!globeRef.current) return;
    globeRef.current.pointOfView({ lat: 20, lng: 10, altitude: 1.55 });
    const controls = globeRef.current.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.2;
    controls.enableZoom = false;
    controls.enablePan = false;
  }, []);

  // Node pill positions - carefully matching reference layout
  const nodePills = [
    { name: "US-EAST",     top: "9%",  left: "3%" },
    { name: "EU-WEST",     top: "9%",  right: "3%" },
    { name: "JP-TOKYO",    top: "30%", right: "-1%" },
    { name: "SAO-PAULO",   top: "44%", left: "1%" },
    { name: "AU-SYDNEY",   top: "62%", left: "3%" },
    { name: "IN-MUMBAI",   top: "62%", right: "1%" },
    { name: "SG-SINGAPORE",top: "77%", right: "3%" },
  ];

  return (
    <div ref={containerRef} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <div style={{ color: "#F97316", fontSize: "12px", fontWeight: "700", letterSpacing: "2.5px" }}>GLOBAL THREAT NETWORK</div>
        <div style={{ color: "#64748B", fontSize: "10px", marginTop: "2px" }}>24 Regions Active</div>
      </div>

      {/* Globe + floating node pills */}
      <div style={{ position: "relative", width: `${globeSize}px`, height: `${globeSize}px`, margin: "0 auto" }}>

        {/* Layered atmosphere bloom behind the globe canvas */}
        <AtmosphereBloom />

        {/* Globe */}
        <div style={{ position: "absolute", inset: 0, zIndex: 2, borderRadius: "50%", overflow: "hidden",
          boxShadow: "0 0 70px rgba(249,115,22,0.28), 0 0 4px rgba(249,154,87,0.6) inset, 0 0 140px rgba(249,115,22,0.1)" }}>
          <Globe
            ref={globeRef}
            backgroundColor="rgba(0,0,0,0)"
            width={globeSize}
            height={globeSize}
            atmosphereColor="#ff9d4d"
            atmosphereAltitude={0.35}
            globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
            bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
            pointsData={[...dataNodes, ...cityLights]}
            pointLat="lat"
            pointLng="lng"
            pointColor={d => d.type === "threat" ? "#EF4444" : d.type ? "#F97316" : "#FFC98A"}
            pointAltitude={d => d.type ? 0.032 : 0.014}
            pointRadius={d => d.type === "threat" ? 0.85 : d.type ? 0.55 : (d.size || 0.3)}
            pointsMerge={false}
            pointResolution={d => d.type ? 32 : 6}
            arcsData={[...attacks, ...backboneRoutes, ...meshLines]}
            arcStartLat="startLat"
            arcStartLng="startLng"
            arcEndLat="endLat"
            arcEndLng="endLng"
            arcColor={d => {
              if (d.color) return [d.color, d.color];
              if (d.kind === "backbone") return ["rgba(96,180,255,0.55)", "rgba(249,180,110,0.55)"];
              return ["rgba(249,180,110,0.4)", "rgba(249,180,110,0.4)"];
            }}
            arcAltitude={d => d.color ? undefined : d.kind === "backbone" ? 0.18 : 0.006}
            arcAltitudeAutoScale={d => d.color ? 0.4 : d.kind === "backbone" ? undefined : 0.15}
            arcStroke={d => d.color ? 1.2 : d.kind === "backbone" ? 0.55 : 0.34}
            arcDashLength={d => d.color ? 0.2 : d.kind === "backbone" ? 0.32 : 1}
            arcDashGap={d => d.color ? 4 : d.kind === "backbone" ? 2.5 : 0}
            arcDashAnimateTime={d => d.color ? 1500 : d.kind === "backbone" ? 3000 : 0}
            ringsData={[...dataNodes, ...cityLights.filter((_, i) => i % 5 === 0)]}
            ringLat="lat"
            ringLng="lng"
            ringColor={d => d.type === "threat" ? "#EF4444" : d.type ? "#F97316" : "rgba(249,180,110,0.55)"}
            ringMaxRadius={d => d.type ? 8 : 3.2}
            ringPropagationSpeed={d => d.type ? 4 : 1.6}
            ringRepeatPeriod={d => d.type ? 900 : 2600}
            enablePointerInteraction={false}
          />
        </div>

        {/* Orbit rings drifting around the globe */}
        <OrbitRings size={globeSize} />

        {/* Ambient sparks near the rim */}
        <GlobeSparks size={globeSize} />

        {/* Node pills with connector lines */}
        {nodePills.map((pill, i) => (
          <NodePill key={i} name={pill.name} style={{
            top: pill.top,
            left: pill.left,
            right: pill.right,
          }} />
        ))}

        {/* Connector lines SVG */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 15 }}
          viewBox={`0 0 ${globeSize} ${globeSize}`}
        >
          {/* US-EAST line: top-left pill to globe */}
          <line x1="90" y1={globeSize * 0.11} x2={globeSize * 0.3} y2={globeSize * 0.28} stroke="rgba(249,115,22,0.5)" strokeWidth="1" strokeDasharray="3 5" />
          {/* EU-WEST line: top-right pill to globe */}
          <line x1={globeSize - 90} y1={globeSize * 0.11} x2={globeSize * 0.7} y2={globeSize * 0.28} stroke="rgba(249,115,22,0.5)" strokeWidth="1" strokeDasharray="3 5" />
          {/* JP-TOKYO: right pill */}
          <line x1={globeSize - 80} y1={globeSize * 0.33} x2={globeSize * 0.78} y2={globeSize * 0.38} stroke="rgba(249,115,22,0.5)" strokeWidth="1" strokeDasharray="3 5" />
          {/* SAO-PAULO: left */}
          <line x1="80" y1={globeSize * 0.47} x2={globeSize * 0.28} y2={globeSize * 0.55} stroke="rgba(249,115,22,0.5)" strokeWidth="1" strokeDasharray="3 5" />
          {/* AU-SYDNEY: bottom-left */}
          <line x1="90" y1={globeSize * 0.65} x2={globeSize * 0.32} y2={globeSize * 0.72} stroke="rgba(249,115,22,0.5)" strokeWidth="1" strokeDasharray="3 5" />
          {/* IN-MUMBAI: bottom-right */}
          <line x1={globeSize - 90} y1={globeSize * 0.65} x2={globeSize * 0.72} y2={globeSize * 0.7} stroke="rgba(249,115,22,0.5)" strokeWidth="1" strokeDasharray="3 5" />
          {/* SG-SINGAPORE: far-right */}
          <line x1={globeSize - 90} y1={globeSize * 0.8} x2={globeSize * 0.74} y2={globeSize * 0.78} stroke="rgba(249,115,22,0.5)" strokeWidth="1" strokeDasharray="3 5" />
          {/* Dots at globe end */}
          {[
            [globeSize * 0.3, globeSize * 0.28],
            [globeSize * 0.7, globeSize * 0.28],
            [globeSize * 0.78, globeSize * 0.38],
            [globeSize * 0.28, globeSize * 0.55],
            [globeSize * 0.32, globeSize * 0.72],
            [globeSize * 0.72, globeSize * 0.7],
            [globeSize * 0.74, globeSize * 0.78],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3.5" fill="#F97316" opacity="0.85" />
          ))}
        </svg>
      </div>

      {/* Shield diagram below globe */}
      <div style={{ width: "100%", marginTop: "24px", position: "relative" }}>
        <ShieldDiagram />
      </div>
    </div>
  );
}
