import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import GoogleButton from "../components/auth/GoogleButton";
import api from "../services/api";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import GlobeGL from "react-globe.gl";
import {
  Shield, Globe, FileText, Lock,
  ShieldCheck, Cpu, Activity, Brain, Scan, ChevronRight
} from "lucide-react";

/* ============================================================
   PREMIUM BACKGROUND — rich particle network, left-blue / right-orange
   flowing curved data paths, random glowing dots, ambient stars
   ============================================================ */
const RichBackground = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H;
    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();

    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 0.9 + 0.2,
      a: Math.random() * 0.5 + 0.15,
      tw: Math.random() * Math.PI * 2,
    }));

    const particles = Array.from({ length: 220 }, (_, i) => {
      const side = i < 110 ? "left" : "right";
      return {
        x: side === "left"
          ? Math.random() * W * 0.42
          : W * 0.58 + Math.random() * W * 0.42,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        size: Math.random() * 1.7 + 0.4,
        color: side === "left" ? "blue" : "orange",
        alpha: Math.random() * 0.55 + 0.3,
      };
    });

    const paths = [
      { pts: [[0.05,0.55],[0.12,0.42],[0.22,0.58],[0.32,0.45],[0.42,0.55]], color: "orange" },
      { pts: [[0.95,0.65],[0.85,0.52],[0.75,0.65],[0.65,0.52],[0.55,0.60]], color: "blue" },
      { pts: [[0.02,0.72],[0.15,0.60],[0.28,0.72],[0.40,0.60]], color: "orange" },
      { pts: [[0.98,0.40],[0.88,0.30],[0.78,0.42],[0.68,0.32]], color: "blue" },
      { pts: [[0.04,0.18],[0.14,0.10],[0.24,0.20],[0.34,0.12]], color: "blue" },
      { pts: [[0.97,0.85],[0.87,0.78],[0.77,0.90],[0.66,0.80]], color: "orange" },
      { pts: [[0.0,0.30],[0.10,0.24],[0.20,0.34],[0.30,0.26],[0.38,0.32]], color: "orange" },
      { pts: [[1.0,0.15],[0.90,0.08],[0.80,0.18],[0.70,0.10]], color: "blue" },
    ];
    const pathDots = paths.map(p => ({ t: Math.random(), speed: 0.0008 + Math.random() * 0.0006 }));

    const glowDots = Array.from({ length: 46 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2.5 + 1,
      color: Math.random() > 0.5 ? "orange" : "blue",
      phase: Math.random() * Math.PI * 2,
    }));

    let animId;
    const animate = (t) => {
      ctx.clearRect(0, 0, W, H);

      stars.forEach(s => {
        const tw = 0.6 + 0.4 * Math.sin(t / 900 + s.tw);
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(226,232,240,${s.a * tw})`;
        ctx.fill();
      });

      paths.forEach((p, pi) => {
        const isOrange = p.color === "orange";
        const col = isOrange ? "rgba(249,115,22," : "rgba(59,130,246,";
        ctx.beginPath();
        const pts = p.pts.map(([fx, fy]) => [fx * W, fy * H]);
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length - 1; i++) {
          const mx = (pts[i][0] + pts[i+1][0]) / 2;
          const my = (pts[i][1] + pts[i+1][1]) / 2;
          ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
        }
        ctx.strokeStyle = col + "0.14)";
        ctx.lineWidth = 1;
        ctx.stroke();

        pathDots[pi].t = (pathDots[pi].t + pathDots[pi].speed) % 1;
        const seg = Math.floor(pathDots[pi].t * (pts.length - 1));
        const frac = (pathDots[pi].t * (pts.length - 1)) % 1;
        if (seg < pts.length - 1) {
          const dx = pts[seg+1][0] - pts[seg][0];
          const dy = pts[seg+1][1] - pts[seg][1];
          const px = pts[seg][0] + dx * frac;
          const py = pts[seg][1] + dy * frac;
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = isOrange ? "rgba(249,115,22,0.85)" : "rgba(99,179,237,0.85)";
          ctx.fill();
          const grad = ctx.createRadialGradient(px, py, 0, px, py, 12);
          grad.addColorStop(0, isOrange ? "rgba(249,115,22,0.35)" : "rgba(59,130,246,0.35)");
          grad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.beginPath();
          ctx.arc(px, py, 12, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }
      });

      glowDots.forEach(d => {
        const pulse = Math.max(0, 0.4 + 0.6 * Math.sin(t / 1000 + d.phase));
        const isOr = d.color === "orange";
        const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 4);
        g.addColorStop(0, isOr ? `rgba(249,115,22,${0.7 * pulse})` : `rgba(59,130,246,${0.6 * pulse})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(d.x, d.y, Math.max(0.01, d.r * pulse), 0, Math.PI * 2);
        ctx.fillStyle = isOr ? `rgba(249,115,22,${0.8 * pulse})` : `rgba(99,179,237,${0.7 * pulse})`;
        ctx.fill();
      });

      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        const isOr = p.color === "orange";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = isOr ? `rgba(249,115,22,${p.alpha})` : `rgba(99,179,237,${p.alpha * 0.8})`;
        ctx.fill();
        particles.slice(i + 1, i + 9).forEach(o => {
          if (o.color !== p.color) return;
          const d = Math.hypot(p.x - o.x, p.y - o.y);
          if (d < 100) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(o.x, o.y);
            ctx.strokeStyle = isOr
              ? `rgba(249,115,22,${0.07 * (1 - d/100)})`
              : `rgba(59,130,246,${0.06 * (1 - d/100)})`;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        });
      });

      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.9
    }} />
  );
};

const BottomWave = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = 240;
    const W = canvas.width, H = canvas.height;

    const waveDots = Array.from({ length: 220 }, (_, i) => ({
      x: (i / 220) * W,
      baseY: H * 0.55 + Math.sin(i * 0.25) * 28,
      phase: i * 0.18,
      r: Math.random() * 1.8 + 0.6,
      color: i < 110 ? "orange" : "blue",
    }));
    const waveDots2 = Array.from({ length: 160 }, (_, i) => ({
      x: (i / 160) * W,
      baseY: H * 0.72 + Math.sin(i * 0.3 + 1) * 20,
      phase: i * 0.22 + 2,
      r: Math.random() * 1.4 + 0.5,
      color: i < 60 ? "orange" : "blue",
    }));
    // Dense scatter cloud hugging both wave lines — gives the "river of dots" texture
    const scatterDots = Array.from({ length: 320 }, () => {
      const onTop = Math.random() < 0.55;
      return {
        x: Math.random() * W,
        baseY: (onTop ? H * 0.55 : H * 0.72) + (Math.random() - 0.5) * 60,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 0.8,
        r: Math.random() * 1.1 + 0.3,
        color: Math.random() > 0.45 ? "orange" : "blue",
        alpha: Math.random() * 0.5 + 0.25,
      };
    });

    let animId, t = 0;
    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.012;

      ctx.beginPath();
      waveDots.forEach((d, i) => {
        const y = d.baseY + Math.sin(d.phase + t) * 14;
        if (i === 0) ctx.moveTo(d.x, y); else ctx.lineTo(d.x, y);
      });
      const wg1 = ctx.createLinearGradient(0, 0, W, 0);
      wg1.addColorStop(0, "rgba(249,115,22,0.0)");
      wg1.addColorStop(0.2, "rgba(249,115,22,0.35)");
      wg1.addColorStop(0.55, "rgba(249,115,22,0.18)");
      wg1.addColorStop(0.75, "rgba(59,130,246,0.25)");
      wg1.addColorStop(1, "rgba(59,130,246,0.0)");
      ctx.strokeStyle = wg1; ctx.lineWidth = 1.5; ctx.stroke();

      ctx.beginPath();
      waveDots.forEach((d, i) => {
        const y = d.baseY + Math.sin(d.phase + t) * 14;
        if (i === 0) ctx.moveTo(d.x, y); else ctx.lineTo(d.x, y);
      });
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
      const fg1 = ctx.createLinearGradient(0, H * 0.5, 0, H);
      fg1.addColorStop(0, "rgba(249,115,22,0.06)");
      fg1.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = fg1; ctx.fill();

      ctx.beginPath();
      waveDots2.forEach((d, i) => {
        const y = d.baseY + Math.sin(d.phase + t * 0.8) * 10;
        if (i === 0) ctx.moveTo(d.x, y); else ctx.lineTo(d.x, y);
      });
      const wg2 = ctx.createLinearGradient(0, 0, W, 0);
      wg2.addColorStop(0, "rgba(59,130,246,0.0)");
      wg2.addColorStop(0.3, "rgba(59,130,246,0.22)");
      wg2.addColorStop(0.6, "rgba(59,130,246,0.12)");
      wg2.addColorStop(0.8, "rgba(249,115,22,0.20)");
      wg2.addColorStop(1, "rgba(249,115,22,0.0)");
      ctx.strokeStyle = wg2; ctx.lineWidth = 1.2; ctx.stroke();

      [...waveDots, ...waveDots2].forEach((d, i) => {
        if (i % 2 !== 0) return;
        const y = d.baseY + Math.sin(d.phase + t) * 14;
        const isOr = d.color === "orange";
        const grd = ctx.createRadialGradient(d.x, y, 0, d.x, y, d.r * 5);
        grd.addColorStop(0, isOr ? "rgba(249,115,22,0.5)" : "rgba(99,179,237,0.5)");
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath(); ctx.arc(d.x, y, d.r * 5, 0, Math.PI * 2);
        ctx.fillStyle = grd; ctx.fill();
        ctx.beginPath(); ctx.arc(d.x, y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = isOr ? "rgba(249,115,22,0.9)" : "rgba(99,179,237,0.9)";
        ctx.fill();
      });

      scatterDots.forEach(d => {
        const y = d.baseY + Math.sin(d.phase + t * d.speed) * 10;
        const isOr = d.color === "orange";
        ctx.beginPath(); ctx.arc(d.x, y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = isOr ? `rgba(249,115,22,${d.alpha})` : `rgba(99,179,237,${d.alpha})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div style={{ position: "fixed", bottom: 28, left: 0, right: 0, height: "240px", zIndex: 1, pointerEvents: "none" }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

const LiveAttackTicker = () => {
  const [attacks, setAttacks] = useState([
    { from: "RU-MOSCOW",    to: "auth-api",     status: "BLOCKED",       severity: "CRITICAL" },
    { from: "CN-BEIJING",   to: "payment",      status: "BLOCKED",       severity: "HIGH"     },
    { from: "US-EAST",      to: "analytics",    status: "ALLOWED",       severity: "LOW"      },
    { from: "IR-TEHRAN",    to: "gateway",      status: "INVESTIGATING", severity: "MEDIUM"   },
    { from: "KP-PYONGYANG", to: "user-service", status: "INVESTIGATING", severity: "LOW"      },
    { from: "IN-MUMBAI",    to: "billing",      status: "ALLOWED",       severity: "LOW"      },
  ]);
  useEffect(() => {
    const sources  = ["RU-MOSCOW","CN-BEIJING","IR-TEHRAN","KP-PYONGYANG","US-EAST","EU-WEST","IN-MUMBAI"];
    const targets  = ["auth-api","payment","gateway","analytics","billing","user-service"];
    const statuses = ["BLOCKED","BLOCKED","ALLOWED","INVESTIGATING"];
    const sevs     = ["CRITICAL","HIGH","MEDIUM","LOW"];
    const iv = setInterval(() => {
      setAttacks(prev => [...prev.slice(1), {
        from:     sources [Math.floor(Math.random() * sources.length )],
        to:       targets [Math.floor(Math.random() * targets.length )],
        status:   statuses[Math.floor(Math.random() * statuses.length)],
        severity: sevs    [Math.floor(Math.random() * sevs.length    )],
      }]);
    }, 2600);
    return () => clearInterval(iv);
  }, []);
  const col = s => s === "BLOCKED" ? "#EF4444" : s === "ALLOWED" ? "#10B981" : "#F59E0B";
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
      background: "rgba(3,6,18,0.98)", borderTop: "1px solid rgba(249,115,22,0.1)",
      padding: "7px 0", overflow: "hidden",
    }}>
      <div style={{ display:"flex", gap:"52px", animation:"scrollLeft 30s linear infinite", width:"max-content" }}>
        {[...attacks,...attacks,...attacks].map((a,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:"10px", fontSize:"10px", whiteSpace:"nowrap" }}>
            <div style={{ width:5, height:5, borderRadius:"50%", background:col(a.status), boxShadow:`0 0 6px ${col(a.status)}`, animation:"pulse 1.2s infinite" }} />
            <span style={{ color:"#F97316", fontWeight:700 }}>{a.from}</span>
            <span style={{ color:"#1e293b" }}>→</span>
            <span style={{ color:"#94A3B8" }}>{a.to}</span>
            <span style={{ color:col(a.status), fontWeight:700 }}>{a.status}</span>
            <span style={{ color:"#475569", fontSize:"9px" }}>[{a.severity}]</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const WaveformIcon = () => (
  <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
    <rect x="0"  y="5" width="2.2" height="4"  rx="1.1" fill="#F97316"/>
    <rect x="4"  y="1" width="2.2" height="12" rx="1.1" fill="#F97316"/>
    <rect x="8"  y="3" width="2.2" height="8"  rx="1.1" fill="#F97316"/>
    <rect x="12" y="0" width="2.2" height="14" rx="1.1" fill="#F97316"/>
    <rect x="16" y="5" width="2.2" height="4"  rx="1.1" fill="#F97316"/>
  </svg>
);

const Navbar = () => (
  <nav className="login-navbar" style={{
    position:"fixed", top:0, left:0, right:0, zIndex:100, height:"60px",
    padding:"0 40px", display:"flex", alignItems:"center", justifyContent:"space-between",
    borderBottom:"1px solid rgba(255,255,255,0.04)",
    background:"rgba(3,6,18,0.97)", backdropFilter:"blur(28px)",
  }}>
    <div style={{ display:"flex", alignItems:"center", gap:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{
          width:36, height:36, borderRadius:10,
          background:"linear-gradient(135deg,#FF7A1A,#EA580C)",
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 0 20px rgba(249,115,22,0.55), 0 0 40px rgba(249,115,22,0.2)",
        }}>
          <Shield size={18} color="white" />
        </div>
        <span style={{ color:"#FFFFFF", fontSize:19, fontWeight:900, letterSpacing:"0.5px" }}>ATHX</span>
      </div>
      <motion.div
        animate={{ boxShadow:["0 0 0px rgba(249,115,22,0)", "0 0 12px rgba(249,115,22,0.35)", "0 0 0px rgba(249,115,22,0)"] }}
        transition={{ duration:2.5, repeat:Infinity }}
        style={{
          display:"flex", alignItems:"center", gap:8,
          padding:"6px 14px", background:"rgba(249,115,22,0.08)",
          border:"1px solid rgba(249,115,22,0.25)", borderRadius:999,
        }}
      >
        <WaveformIcon />
        <span style={{ color:"#F97316", fontSize:"10.5px", fontWeight:800, letterSpacing:"0.7px" }}>LIVE THREAT FEED</span>
      </motion.div>
    </div>
    <div className="login-navbar-item" style={{ display:"flex", alignItems:"center", gap:9 }}>
      <motion.div
        animate={{ opacity:[1,0.4,1] }} transition={{ duration:2, repeat:Infinity }}
        style={{ width:7, height:7, borderRadius:"50%", background:"#10B981",
          boxShadow:"0 0 8px #10B981" }}
      />
      <span style={{ color:"#64748B", fontSize:"11px", fontWeight:600 }}>GLOBAL NETWORK STATUS</span>
      <span style={{ color:"#10B981", fontSize:"11px", fontWeight:800 }}>OPERATIONAL</span>
    </div>
    <div className="login-navbar-item" style={{
      padding:"7px 15px", background:"rgba(16,185,129,0.07)",
      borderRadius:8, border:"1px solid rgba(16,185,129,0.22)",
      display:"flex", alignItems:"center", gap:7,
      boxShadow:"0 0 12px rgba(16,185,129,0.1)",
    }}>
      <Lock size={11} color="#10B981" />
      <span style={{ color:"#10B981", fontSize:"10px", fontWeight:700 }}>SOC2 TYPE II VERIFIED</span>
    </div>
  </nav>
);

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

const AtmosphereBloom = () => (
  <>
    <div style={{
      position: "absolute", inset: "-30%", borderRadius: "50%", zIndex: 0, pointerEvents: "none",
      background: "radial-gradient(circle, rgba(59,130,246,0.09) 0%, transparent 55%)",
      filter: "blur(20px)",
    }} />
    <div style={{
      position: "absolute", inset: "-20%", borderRadius: "50%", zIndex: 1, pointerEvents: "none",
      background: "radial-gradient(circle, transparent 48%, rgba(249,115,22,0.16) 64%, transparent 80%)",
      filter: "blur(16px)",
    }} />
    <div style={{
      position: "absolute", inset: "-6%", borderRadius: "50%", zIndex: 1, pointerEvents: "none",
      background: "radial-gradient(circle, transparent 70%, rgba(249,115,22,0.14) 84%, transparent 96%)",
      filter: "blur(6px)",
    }} />
  </>
);

const REAL_GLOBE_NODES = [
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

const RealGlobe = ({ size, globeRef }) => {
  const [attacks, setAttacks] = useState([]);

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
    const threats = REAL_GLOBE_NODES.filter(n => n.type === "threat");
    const targets = REAL_GLOBE_NODES.filter(n => n.type !== "threat");
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
    globeRef.current.pointOfView({ lat: 20, lng: 10, altitude: 1.42 });
    const controls = globeRef.current.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.2;
    controls.enableZoom = false;
    controls.enablePan = false;
  }, []);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <AtmosphereBloom />
      <div style={{ position: "absolute", inset: 0, zIndex: 2, borderRadius: "50%", overflow: "hidden",
        boxShadow: "0 0 70px rgba(249,115,22,0.28), 0 0 4px rgba(249,154,87,0.6) inset, 0 0 140px rgba(249,115,22,0.1)" }}>
        <GlobeGL
          ref={globeRef}
          backgroundColor="rgba(0,0,0,0)"
          width={size}
          height={size}
          atmosphereColor="#ff9d4d"
          atmosphereAltitude={0.22}
          globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
          bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
          pointsData={[...REAL_GLOBE_NODES, ...cityLights]}
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
          ringsData={[...REAL_GLOBE_NODES, ...cityLights.filter((_, i) => i % 5 === 0)]}
          ringLat="lat"
          ringLng="lng"
          ringColor={d => d.type === "threat" ? "#EF4444" : d.type ? "#F97316" : "rgba(249,180,110,0.55)"}
          ringMaxRadius={d => d.type ? 8 : 3.2}
          ringPropagationSpeed={d => d.type ? 4 : 1.6}
          ringRepeatPeriod={d => d.type ? 900 : 2600}
          enablePointerInteraction={false}
        />
      </div>
      <OrbitRings size={size} />
      <GlobeSparks size={size} />
    </div>
  );
};

const ShieldDiagram = () => (
  <div style={{ width:"100%", display:"flex", flexDirection:"column", alignItems:"center", gap:0, position:"relative" }}>

    <motion.div
      animate={{ boxShadow:["0 0 10px rgba(249,115,22,0.1)","0 0 28px rgba(249,115,22,0.3)","0 0 10px rgba(249,115,22,0.1)"] }}
      transition={{ duration:3, repeat:Infinity }}
      style={{
        padding:"11px 26px", background:"rgba(6,11,28,0.97)",
        border:"1px solid rgba(249,115,22,0.4)", borderRadius:12,
        display:"flex", alignItems:"center", gap:11,
      }}
    >
      <Brain size={18} color="#F97316" style={{ filter:"drop-shadow(0 0 6px rgba(249,115,22,0.7))" }} />
      <div>
        <div style={{ color:"#F97316", fontSize:"11.5px", fontWeight:800, letterSpacing:"1px" }}>THREAT INTELLIGENCE ENGINE</div>
        <div style={{ color:"#475569", fontSize:"9.5px", marginTop:1 }}>Collect • Correlate • Analyze</div>
      </div>
    </motion.div>

    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", position:"relative" }}>
      <div style={{ width:1, height:20, background:"linear-gradient(to bottom, rgba(249,115,22,0.7), rgba(249,115,22,0.2))" }} />
      <motion.div
        animate={{ y:[-8,8,-8] }} transition={{ duration:2, repeat:Infinity, ease:"easeInOut" }}
        style={{ width:6, height:6, borderRadius:"50%", background:"#F97316",
          boxShadow:"0 0 10px rgba(249,115,22,0.8)", marginTop:-3 }}
      />
    </div>

    <div style={{ display:"flex", width:"100%", gap:8, alignItems:"stretch", position:"relative" }}>

      <div style={{
        flex:1, padding:"14px 14px", background:"rgba(6,11,28,0.92)",
        border:"1px solid rgba(255,255,255,0.08)", borderRadius:11,
        boxShadow:"0 0 18px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)",
        position:"relative",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
          <Shield size={13} color="#F97316" style={{ filter:"drop-shadow(0 0 4px rgba(249,115,22,0.8))" }} />
          <span style={{ color:"#F97316", fontSize:"9.5px", fontWeight:800, letterSpacing:"0.6px" }}>REAL-TIME PROTECTION</span>
        </div>
        {["Behavioral Analysis","Anomaly Detection","Attack Prevention"].map((item,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:7, marginBottom: i<2?6:0 }}>
            <ShieldCheck size={10} color="#F97316" />
            <span style={{ color:"#94A3B8", fontSize:"9.5px" }}>{item}</span>
          </div>
        ))}
        <div style={{ position:"absolute", right:-9, top:"50%", width:8, height:1, background:"rgba(249,115,22,0.5)" }} />
      </div>

      {/* ATHX Shield Core — shield outline IS the container; text sits directly
          inside the glowing path, no separate box behind it */}
      <div style={{
        width:158, flexShrink:0, position:"relative", zIndex:2,
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <svg width="158" height="192" viewBox="0 0 158 192" style={{ position:"absolute", inset:0, overflow:"visible" }}>
          <defs>
            <filter id="shieldGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="5" result="blur1" />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <motion.path
            d="M79 6L14 30v54c0 38 27 73 65 86 38-13 65-48 65-86V30L79 6z"
            fill="rgba(249,115,22,0.07)"
            stroke="#F97316"
            strokeWidth="2"
            filter="url(#shieldGlow)"
            animate={{
              filter: [
                "drop-shadow(0 0 8px rgba(249,115,22,0.6)) drop-shadow(0 0 22px rgba(249,115,22,0.3))",
                "drop-shadow(0 0 16px rgba(249,115,22,0.9)) drop-shadow(0 0 40px rgba(249,115,22,0.5))",
                "drop-shadow(0 0 8px rgba(249,115,22,0.6)) drop-shadow(0 0 22px rgba(249,115,22,0.3))",
              ]
            }}
            transition={{ duration:2.5, repeat:Infinity }}
          />
        </svg>
        <div style={{
          position:"relative", display:"flex", flexDirection:"column", alignItems:"center",
          padding:"38px 16px 24px", textAlign:"center",
        }}>
          <div style={{ color:"#FFFFFF", fontSize:18, fontWeight:900, letterSpacing:"2px" }}>ATHX</div>
          <div style={{ color:"#F97316", fontSize:"9px", fontWeight:800, letterSpacing:"1.6px", marginBottom:10 }}>SECURITY CORE</div>
          <div style={{ color:"#94A3B8", fontSize:"8.5px", lineHeight:1.85 }}>
            AI Threat Analysis<br/>Risk Correlation<br/>Compliance Engine
          </div>
        </div>
      </div>

      <div style={{
        flex:1, padding:"14px 14px", background:"rgba(6,11,28,0.92)",
        border:"1px solid rgba(255,255,255,0.08)", borderRadius:11,
        boxShadow:"0 0 18px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)",
        position:"relative",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
          <FileText size={13} color="#F97316" style={{ filter:"drop-shadow(0 0 4px rgba(249,115,22,0.8))" }} />
          <span style={{ color:"#F97316", fontSize:"9.5px", fontWeight:800, letterSpacing:"0.6px" }}>COMPLIANCE ENGINE</span>
        </div>
        {["OWASP API Top 10","SOC 2 • ISO 27001","Continuous Monitoring"].map((item,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:7, marginBottom: i<2?6:0 }}>
            <ShieldCheck size={10} color="#F97316" />
            <span style={{ color:"#94A3B8", fontSize:"9.5px" }}>{item}</span>
          </div>
        ))}
        <div style={{ position:"absolute", left:-9, top:"50%", width:8, height:1, background:"rgba(249,115,22,0.5)" }} />
      </div>
    </div>

    <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
      <motion.div
        animate={{ y:[-8,8,-8] }} transition={{ duration:2, repeat:Infinity, ease:"easeInOut", delay:0.5 }}
        style={{ width:6, height:6, borderRadius:"50%", background:"#F97316",
          boxShadow:"0 0 10px rgba(249,115,22,0.8)" }}
      />
      <div style={{ width:1, height:20, background:"linear-gradient(to bottom, rgba(249,115,22,0.2), rgba(249,115,22,0.7))" }} />
    </div>

    <motion.div
      animate={{ boxShadow:["0 0 10px rgba(249,115,22,0.1)","0 0 28px rgba(249,115,22,0.3)","0 0 10px rgba(249,115,22,0.1)"] }}
      transition={{ duration:3, repeat:Infinity, delay:1.5 }}
      style={{
        padding:"11px 26px", background:"rgba(6,11,28,0.97)",
        border:"1px solid rgba(249,115,22,0.4)", borderRadius:12,
        display:"flex", alignItems:"center", gap:11,
      }}
    >
      <Activity size={18} color="#F97316" style={{ filter:"drop-shadow(0 0 6px rgba(249,115,22,0.7))" }} />
      <div>
        <div style={{ color:"#F97316", fontSize:"11.5px", fontWeight:800, letterSpacing:"1px" }}>SECURITY COMMAND CENTER</div>
        <div style={{ color:"#475569", fontSize:"9.5px", marginTop:1 }}>Unified Visibility • Actionable Insights • Complete Control</div>
      </div>
    </motion.div>

    <svg
      style={{ position:"absolute", right:-16, top:6, height:"calc(100% - 12px)", width:34, pointerEvents:"none", overflow:"visible" }}
      viewBox="0 0 30 300" preserveAspectRatio="none"
    >
      <path d="M15 0 Q26 75 15 150 Q4 225 15 300"
        stroke="rgba(249,115,22,0.55)" strokeWidth="1.6" fill="none" strokeDasharray="2 6"
        style={{ filter:"drop-shadow(0 0 4px rgba(249,115,22,0.6))" }} />
    </svg>
  </div>
);

const NodePill = ({ name, x, y, visible, anchor }) => (
  <motion.div
    animate={{ boxShadow:["0 0 8px rgba(249,115,22,0.15)","0 0 20px rgba(249,115,22,0.35)","0 0 8px rgba(249,115,22,0.15)"] }}
    transition={{ duration:2.5+Math.random(), repeat:Infinity }}
    style={{
      position:"absolute",
      left: x, top: y,
      transform: anchor === "right" ? "translate(-100%, -50%)" : "translate(0, -50%)",
      background:"rgba(5,10,26,0.94)",
      border:"1px solid rgba(249,115,22,0.5)", borderRadius:10,
      padding:"7px 15px", backdropFilter:"blur(20px)",
      whiteSpace:"nowrap", zIndex:20,
      opacity: visible ? 1 : 0.15,
      transition: "opacity 0.4s ease",
      pointerEvents: visible ? "auto" : "none",
    }}
  >
    <div style={{ color:"#FFFFFF", fontSize:"11.5px", fontWeight:700 }}>{name}</div>
    <div style={{ color:"#10B981", fontSize:"9.5px", fontWeight:600, marginTop:1 }}>Active</div>
  </motion.div>
);

const GlobeSection = () => {
  const containerRef = useRef();
  const globeRef = useRef();
  const [size, setSize] = useState(420);
  const [pillPositions, setPillPositions] = useState([]);

  useEffect(() => {
    const upd = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        setSize(Math.min(Math.max(w * 0.60, 300), 470));
      }
    };
    upd(); window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, []);

  // Pills track the real lat/lng of their city, projected live every frame
  // using the globe's actual current camera rotation — so as the globe spins,
  // each pill's anchor point and connector line follow the city underneath it.
  const trackedCities = useMemo(() => [
    { name:"US-EAST",      lat:40.7,  lng:-74,   side:"left"  },
    { name:"EU-WEST",      lat:51.5,  lng:-0.1,  side:"right" },
    { name:"JP-TOKYO",     lat:35.6,  lng:139.6, side:"right" },
    { name:"SAO-PAULO",    lat:-23.5, lng:-46.6, side:"left"  },
    { name:"AU-SYDNEY",    lat:-33.8, lng:151.2, side:"left"  },
    { name:"IN-MUMBAI",    lat:19.0,  lng:72.8,  side:"right" },
    { name:"SG-SINGAPORE", lat:1.3,   lng:103.8, side:"right" },
  ], []);

  useEffect(() => {
    let raf;
    const center = size / 2;
    const pillRadius = size * 0.58; // how far out from center the pill sits

    const tick = () => {
      const g = globeRef.current;
      if (g && g.getScreenCoords && g.camera && g.getGlobeRadius) {
        const cam = g.camera();
        const camPos = cam.position;
        const next = trackedCities.map(city => {
          const screen = g.getScreenCoords(city.lat, city.lng, 0.01);
          const world = g.getCoords ? g.getCoords(city.lat, city.lng, 0.01) : null;
          // Visibility: is the surface point facing the camera?
          let visible = true;
          if (world) {
            const dot = world.x*camPos.x + world.y*camPos.y + world.z*camPos.z;
            visible = dot > 0;
          }
          // Direction from globe center (in screen space) to push the pill outward
          const dx = screen.x - center;
          const dy = screen.y - center;
          const dist = Math.hypot(dx, dy) || 1;
          const ux = dx / dist, uy = dy / dist;
          let pillX = center + ux * pillRadius;
          let pillY = center + uy * pillRadius;
          // Keep pills clear of the header label above and the shield diagram below
          const topClamp = size * 0.06;
          const bottomClamp = size * 0.97;
          if (pillY < topClamp) pillY = topClamp;
          if (pillY > bottomClamp) pillY = bottomClamp;
          return {
            name: city.name,
            anchorX: screen.x, anchorY: screen.y,
            pillX, pillY,
            visible,
          };
        });
        setPillPositions(next);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [size, trackedCities]);

  return (
    <div ref={containerRef} style={{ width:"100%", display:"flex", flexDirection:"column", alignItems:"center" }}>
      <div style={{ textAlign:"center", marginBottom:34 }}>
        <div style={{ color:"#F97316", fontSize:"12px", fontWeight:700, letterSpacing:"2.5px" }}>GLOBAL THREAT NETWORK</div>
        <div style={{ color:"#64748B", fontSize:"10px", marginTop:2 }}>24 Regions Active</div>
      </div>

      <div style={{ position:"relative", width:size, height:size, overflow:"visible" }}>
        <RealGlobe size={size} globeRef={globeRef} />

        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:15, overflow:"visible" }}
          viewBox={`0 0 ${size} ${size}`}>
          {pillPositions.map((p, i) => (
            <g key={i} style={{ opacity: p.visible ? 1 : 0.12, transition:"opacity 0.4s ease" }}>
              <line x1={p.anchorX} y1={p.anchorY} x2={p.pillX} y2={p.pillY}
                stroke="rgba(249,115,22,0.5)" strokeWidth="1" strokeDasharray="3 5" />
              <circle cx={p.anchorX} cy={p.anchorY} r="4" fill="#F97316" opacity="0.85"
                style={{ filter:"drop-shadow(0 0 4px rgba(249,115,22,0.8))" }} />
            </g>
          ))}
        </svg>

        {pillPositions.map((p, i) => (
          <NodePill key={i} name={p.name} x={p.pillX} y={p.pillY} visible={p.visible}
            anchor={p.pillX > size / 2 ? "right" : "left"} />
        ))}
      </div>

      <div style={{ width:"100%", marginTop:24 }}>
        <ShieldDiagram />
      </div>
    </div>
  );
};

const LoginCard = () => {
  const [metrics, setMetrics] = useState({ score:99.3, blocked:15972, scans:131 });
  useEffect(() => {
    const iv = setInterval(() => setMetrics({
      score: +(99.1 + Math.random() * 0.4).toFixed(1),
      blocked: 15900 + Math.floor(Math.random() * 180),
      scans: 125 + Math.floor(Math.random() * 18),
    }), 4500);
    return () => clearInterval(iv);
  }, []);

  const features = [
    { icon:Brain,    label:"AI Security Copilot",       sub:"Explain • Analyze • Recommend"           },
    { icon:Scan,     label:"Comprehensive API Scanning", sub:"Vulnerabilities • Misconfigurations • Risks" },
    { icon:FileText, label:"Compliance & Reporting",     sub:"Frameworks • Policies • Audit Ready"     },
  ];

  return (
    <motion.div
      initial={{ opacity:0, x:35 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.45, duration:0.6 }}
      style={{
        background:"linear-gradient(168deg, rgba(10,17,40,0.99) 0%, rgba(4,8,20,0.99) 100%)",
        border:"1.5px solid rgba(249,115,22,0.45)",
        borderRadius:22, padding:"32px 26px",
        backdropFilter:"blur(40px)",
        boxShadow:"0 0 1px rgba(249,115,22,0.6), 0 0 40px rgba(249,115,22,0.22), 0 0 90px rgba(249,115,22,0.12), 0 30px 100px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)",
        width:"100%", maxWidth:375, position:"relative", overflow:"visible",
      }}
    >
      <div style={{
        position:"absolute", inset:0, borderRadius:22, overflow:"hidden", pointerEvents:"none", zIndex:0,
      }}>
      <motion.div
        animate={{ opacity:[0.5, 1, 0.5] }} transition={{ duration:3, repeat:Infinity }}
        style={{
          position:"absolute", inset:-1, borderRadius:22,
          background:"linear-gradient(135deg, rgba(249,115,22,0.3), transparent 40%, transparent 60%, rgba(249,115,22,0.15))",
          pointerEvents:"none",
        }}
      />
      <div style={{
        position:"absolute", top:0, left:0, width:"60%", height:"100%",
        background:"linear-gradient(120deg, rgba(255,255,255,0.05) 0%, transparent 40%)",
        pointerEvents:"none",
      }} />
      <div style={{ position:"absolute", top:0, right:0, width:180, height:180, background:"radial-gradient(circle at top right, rgba(249,115,22,0.18), transparent 60%)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:0, left:0, width:130, height:130, background:"radial-gradient(circle at bottom left, rgba(59,130,246,0.08), transparent 60%)", pointerEvents:"none" }} />
      </div>

      <div style={{ position:"relative", zIndex:1 }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", marginBottom:18 }}>
        <motion.div
          animate={{ boxShadow:["0 0 24px rgba(249,115,22,0.5)","0 0 48px rgba(249,115,22,0.85)","0 0 24px rgba(249,115,22,0.5)"] }}
          transition={{ duration:2.5, repeat:Infinity }}
          style={{
            width:62, height:62, borderRadius:18,
            background:"linear-gradient(135deg,#FF8A2E,#EA580C)",
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
            marginBottom:14,
          }}
        >
          <ShieldCheck size={30} color="white" strokeWidth={2.2} />
        </motion.div>
        <div style={{ color:"#FFFFFF", fontSize:19, fontWeight:900, lineHeight:1.2 }}>ATHX Security Command</div>
        <div style={{ color:"#64748B", fontSize:"12px", marginTop:4 }}>Enterprise Access Portal</div>
      </div>

      <div style={{
        display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:22,
      }}>
        <motion.div
          animate={{ opacity:[1,0.3,1] }} transition={{ duration:1.8, repeat:Infinity }}
          style={{ width:6, height:6, borderRadius:"50%", background:"#10B981", boxShadow:"0 0 8px #10B981", flexShrink:0 }}
        />
        <span style={{ color:"#94A3B8", fontSize:"12px", fontWeight:500 }}>Threat Network Connected</span>
      </div>

      <div style={{ display:"flex", marginBottom:20, borderRadius:11, overflow:"hidden", border:"1px solid rgba(255,255,255,0.04)" }}>
        {[
          { value:`${metrics.score}%`, label:"Security Score",  color:"#10B981" },
          { value:metrics.blocked.toLocaleString(), label:"Threats Blocked", color:"#F97316" },
          { value:metrics.scans,       label:"Active Scans",    color:"#3B82F6" },
        ].map((m,i) => (
          <div key={i} style={{
            flex:1, textAlign:"center", padding:"13px 4px",
            background:"rgba(255,255,255,0.018)",
            borderRight: i<2 ? "1px solid rgba(255,255,255,0.04)" : "none",
          }}>
            <div style={{ color:m.color, fontSize:20, fontWeight:900, lineHeight:1.1,
              textShadow:`0 0 14px ${m.color}70` }}>{m.value}</div>
            <div style={{ color:"#475569", fontSize:"9px", marginTop:3 }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:20 }}>
        {features.map((f,i) => {
          const Icon = f.icon;
          return (
            <motion.div key={i}
              whileHover={{ background:"rgba(249,115,22,0.07)", borderColor:"rgba(249,115,22,0.3)", y:-2, boxShadow:"0 6px 18px rgba(249,115,22,0.12)" }}
              style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"11px 13px", background:"rgba(255,255,255,0.022)",
                border:"1px solid rgba(255,255,255,0.055)", borderRadius:11, cursor:"pointer",
                transition:"all 0.2s",
              }}
            >
              <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                <div style={{
                  width:34, height:34, borderRadius:9,
                  background:"rgba(249,115,22,0.09)", border:"1px solid rgba(249,115,22,0.22)",
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                }}>
                  <Icon size={14} color="#F97316" />
                </div>
                <div>
                  <div style={{ color:"#E2E8F0", fontSize:"12px", fontWeight:700 }}>{f.label}</div>
                  <div style={{ color:"#475569", fontSize:"9px", marginTop:1 }}>{f.sub}</div>
                </div>
              </div>
              <ChevronRight size={13} color="#475569" />
            </motion.div>
          );
        })}
      </div>

      <GoogleButton />

      {import.meta.env.DEV && (
        <button
          onClick={async () => {
            try {
              const res = await api.post("/auth/google-login", {
                name: "Dev User",
                email: "dev@example.com",
              });
              if (res.data && res.data.accessToken) {
                localStorage.setItem("token", res.data.accessToken);
                window.location.reload();
              }
            } catch (err) {
              console.error("Dev login failed:", err);
            }
          }}
          style={{
            marginTop: "12px",
            width: "100%",
            height: "48px",
            background: "linear-gradient(90deg, #7C3AED, #2563EB)",
            border: "none",
            borderRadius: "12px",
            color: "#ffffff",
            fontSize: "15px",
            fontWeight: "700",
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(124,58,237,0.3)",
          }}
        >
          Bypass Login (Dev Mode)
        </button>
      )}

      <div style={{ display:"flex", justifyContent:"center", gap:10, marginTop:11, fontSize:"9px", color:"#475569" }}>
        <span>Secure</span><span>•</span><span>Fast</span><span>•</span><span>Passwordless</span>
      </div>

      <motion.div
        animate={{ boxShadow:["0 0 0px rgba(16,185,129,0)","0 0 16px rgba(16,185,129,0.2)","0 0 0px rgba(16,185,129,0)"] }}
        transition={{ duration:3, repeat:Infinity }}
        style={{
          display:"flex", alignItems:"center", justifyContent:"center", gap:8,
          marginTop:15, padding:"10px",
          background:"rgba(16,185,129,0.05)", borderRadius:9, border:"1px solid rgba(16,185,129,0.16)",
        }}
      >
        <motion.div
          animate={{ opacity:[1,0.3,1] }} transition={{ duration:1.8, repeat:Infinity, delay:0.9 }}
          style={{ width:6, height:6, borderRadius:"50%", background:"#10B981", boxShadow:"0 0 8px #10B981" }}
        />
        <span style={{ color:"#10B981", fontSize:"10.5px", fontWeight:600 }}>Global Security Fabric Active</span>
      </motion.div>
      </div>
    </motion.div>
  );
};

const LeftColumn = () => {
  const badges = [
    { icon:ShieldCheck, label:"OWASP Top 10", sub:"Protected",   color:"#3B82F6" },
    { icon:Lock,        label:"SOC 2 Ready",  sub:"Compliant",   color:"#10B981" },
    { icon:Cpu,         label:"AI-Powered",   sub:"Intelligence", color:"#8B5CF6" },
    { icon:Activity,    label:"Real-time",    sub:"Protection",  color:"#F97316" },
  ];
  return (
    <motion.div className="login-left-column" initial={{ opacity:0, x:-24 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2, duration:0.6 }}
      style={{ paddingTop:28 }}>

      <div style={{
        display:"inline-flex", alignItems:"center", gap:8,
        padding:"6px 14px", borderRadius:999,
        background:"rgba(249,115,22,0.07)", border:"1px solid rgba(249,115,22,0.26)",
        marginBottom:22,
      }}>
        <Globe size={11} color="#F97316" />
        <span style={{ color:"#F97316", fontSize:"10px", fontWeight:800, letterSpacing:"0.6px" }}>ENTERPRISE API SECURITY PLATFORM</span>
      </div>

      <h1 style={{
        margin:"0 0 18px 0",
        fontSize:"clamp(34px,3.3vw,52px)",
        fontWeight:900, lineHeight:1.0, letterSpacing:"-1.5px", color:"#FFFFFF",
      }}>
        Secure Every API.<br />
        <span style={{
          background:"linear-gradient(135deg, #FF7A1A 0%, #F97316 50%, #FB923C 100%)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          filter:"drop-shadow(0 0 18px rgba(249,115,22,0.3))",
        }}>Protect What<br />Matters.</span>
      </h1>

      <p style={{ color:"#94A3B8", fontSize:"14px", lineHeight:1.68, maxWidth:360, marginBottom:24 }}>
        AI-powered threat detection, vulnerability scanning, and compliance monitoring to protect your APIs across the globe.
      </p>

      <div className="login-stats-box" style={{
        padding:"17px 20px", marginBottom:18,
        background:"rgba(255,255,255,0.022)",
        border:"1px solid rgba(255,255,255,0.07)", borderRadius:13,
        boxShadow:"inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 30px rgba(249,115,22,0.02), 0 4px 20px rgba(0,0,0,0.3)",
        position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute", top:0, left:0, width:"50%", height:"100%",
          background:"linear-gradient(120deg, rgba(255,255,255,0.04) 0%, transparent 50%)", pointerEvents:"none" }} />
        <div style={{ color:"#94A3B8", fontSize:"11px", marginBottom:13, display:"flex", alignItems:"center", gap:7 }}>
          <ShieldCheck size={12} color="#10B981" />
          Trusted by security teams worldwide
        </div>
        <div className="login-stats-container" style={{ display:"flex", gap:28 }}>
          {[["24","Regions"],["12,458","APIs Protected"],["99.98%","Uptime"]].map(([v,l],i) => (
            <div key={i} style={{ borderRight: i<2 ? "1px solid rgba(255,255,255,0.06)" : "none", paddingRight: i<2 ? 24:0 }}>
              <div style={{ color:"#F97316", fontSize:22, fontWeight:900, textShadow:"0 0 14px rgba(249,115,22,0.5)" }}>{v}</div>
              <div style={{ color:"#475569", fontSize:"9px", marginTop:1 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="login-badges-container" style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
        {badges.map((b,i) => {
          const Icon = b.icon;
          return (
            <motion.div key={i}
              whileHover={{ borderColor:`${b.color}55`, boxShadow:`0 0 16px ${b.color}30`, y:-2 }}
              style={{
                display:"flex", alignItems:"center", gap:8,
                padding:"9px 16px", background:"rgba(255,255,255,0.022)",
                border:"1px solid rgba(255,255,255,0.08)", borderRadius:999,
                cursor:"pointer", transition:"all 0.2s",
              }}
            >
              <div style={{
                width:20, height:20, borderRadius:"50%", flexShrink:0,
                border:`1.3px solid ${b.color}80`, background:`${b.color}14`,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <Icon size={11} color={b.color} />
              </div>
              <div>
                <div style={{ color:"#E2E8F0", fontSize:"10.5px", fontWeight:700, lineHeight:1.2 }}>{b.label}</div>
                <div style={{ color:b.color, fontSize:"9px", lineHeight:1.2 }}>{b.sub}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default function LoginPage() {
  const { currentUser } = useAuth();
  if (currentUser) return <Navigate to="/" replace />;

  return (
    <div style={{
      minHeight:"100vh", width:"100%", background:"#030812",
      position:"relative", overflowX:"hidden",
      fontFamily:"'Inter',-apple-system,sans-serif",
    }}>
      <div style={{
        position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
        backgroundImage:`linear-gradient(rgba(255,255,255,0.014) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.014) 1px,transparent 1px)`,
        backgroundSize:"48px 48px",
      }} />

      <RichBackground />

      <div style={{
        position:"fixed", top:"36%", left:"50%", transform:"translate(-50%,-50%)",
        width:1200, height:950,
        background:"radial-gradient(ellipse, rgba(249,115,22,0.05) 0%, transparent 58%)",
        filter:"blur(100px)", pointerEvents:"none", zIndex:0,
      }} />

      <BottomWave />
      <Navbar />
      <LiveAttackTicker />

      <div className="login-container" style={{ width:"100%", maxWidth:1780, margin:"0 auto", padding:"72px 40px 56px", position:"relative", zIndex:2 }}>
        <div className="login-grid" style={{
          display:"grid", gridTemplateColumns:"0.76fr 1.55fr 0.84fr",
          gap:36, alignItems:"start",
        }}>
          <LeftColumn />
          <motion.div className="login-globe-wrapper" initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3, duration:0.6 }}
            style={{ display:"flex", flexDirection:"column", alignItems:"center", paddingTop:8 }}>
            <GlobeSection />
          </motion.div>
          <div style={{ display:"flex", justifyContent:"center", paddingTop:28 }}>
            <LoginCard />
          </div>
        </div>
      </div>

      <div className="login-footer" style={{
        padding:"16px 40px 50px", position:"relative", zIndex:2,
        display:"flex", alignItems:"center", justifyContent:"center", gap:44,
        borderTop:"1px solid rgba(255,255,255,0.04)",
      }}>
        {[
          { icon:Lock,        text:"End-to-End Encryption" },
          { icon:ShieldCheck, text:"Zero Data Leakage"    },
          { icon:Cpu,         text:"AI-Powered Security"  },
        ].map((item,i) => {
          const Icon = item.icon;
          return (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:7, color:"#475569", fontSize:"11px" }}>
              <Icon size={13} color="#64748B" style={{ filter:"drop-shadow(0 0 3px rgba(100,116,139,0.5))" }} />
              {item.text}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes scrollLeft{ 0%{transform:translateX(0)} 100%{transform:translateX(-33.33%)} }
        html, body, #root {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          overflow-y: auto !important;
          height: auto !important;
          min-height: 100% !important;
        }
        * { box-sizing: border-box; }

        @media (max-width: 1024px) {
          .login-navbar-item {
            display: none !important;
          }
          .login-navbar {
            padding: 0 16px !important;
          }
          .login-globe-wrapper {
            display: none !important;
          }
          .login-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
            justify-items: center !important;
            text-align: center !important;
          }
          .login-container {
            padding: 80px 16px 40px !important;
          }
          .login-footer {
            flex-direction: column !important;
            gap: 16px !important;
            padding: 24px 20px !important;
          }
          .login-left-column {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            padding-top: 0 !important;
          }
          .login-left-column h1 {
            text-align: center !important;
          }
          .login-left-column p {
            text-align: center !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .login-stats-box {
            margin-left: auto !important;
            margin-right: auto !important;
            width: 100% !important;
            max-width: 380px !important;
          }
          .login-stats-container {
            justify-content: center !important;
            gap: 16px !important;
          }
          .login-badges-container {
            justify-content: center !important;
          }
        }
      `}</style>
    </div>
  );
}
