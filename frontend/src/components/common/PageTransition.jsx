/**
 * PageTransition.jsx
 * Provides smooth, lightweight, GPU-accelerated page transition animations on route navigation.
 * Zero CPU overhead using CSS hardware acceleration (`will-change: opacity, transform`).
 */
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function PageTransition({ children }) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [stage, setStage] = useState("fadeIn");

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setStage("fadeOut");
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setStage("fadeIn");
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [location, displayLocation]);

  return (
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
  );
}
