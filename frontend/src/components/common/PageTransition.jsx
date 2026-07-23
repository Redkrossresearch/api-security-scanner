/**
 * PageTransition.jsx
 * Ultra-smooth, slow, luxurious page reveal transition with top loading glow indicator & backdrop blur.
 */
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function PageTransition({ children }) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [stage, setStage] = useState("fadeIn");
  const [loadingBar, setLoadingBar] = useState(false);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setStage("fadeOut");
      setLoadingBar(true);
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setStage("fadeIn");
        setTimeout(() => setLoadingBar(false), 750);
      }, 220);
      return () => clearTimeout(timer);
    }
  }, [location, displayLocation]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
      {/* Top glowing progress line */}
      {loadingBar && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, #7C3AED 0%, #38BDF8 50%, #10B981 100%)",
            boxShadow: "0 0 16px rgba(56, 189, 248, 0.8), 0 0 30px rgba(124, 58, 237, 0.5)",
            zIndex: 99999,
            animation: "topLoadingBar 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards"
          }}
        />
      )}

      <div
        key={displayLocation.pathname}
        className={`page-transition-wrapper ${stage}`}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}
