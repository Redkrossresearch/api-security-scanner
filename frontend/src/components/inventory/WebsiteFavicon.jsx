import React, { useState } from "react";
import { Globe } from "lucide-react";

export default function WebsiteFavicon({ host }) {
  const [imgSrc, setImgSrc] = useState(() => {
    try {
      const domain = new URL(host).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch (e) {
      return null;
    }
  });

  const [hasFailed, setHasFailed] = useState(false);

  const handleError = () => {
    try {
      const domain = new URL(host).hostname;
      if (imgSrc && imgSrc.includes("google.com")) {
        setImgSrc(`https://icons.duckduckgo.com/ip2/${domain}.ico`);
      } else {
        setHasFailed(true);
      }
    } catch (e) {
      setHasFailed(true);
    }
  };

  if (hasFailed || !imgSrc) {
    return (
      <div
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "10px",
          background: "rgba(249,115,22,0.15)",
          border: "1px solid rgba(249,115,22,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Globe size={20} color="#F97316" />
      </div>
    );
  }

  return (
    <div
      style={{
        width: "38px",
        height: "38px",
        borderRadius: "10px",
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: "4px",
      }}
    >
      <img
        src={imgSrc}
        onError={handleError}
        alt="logo"
        style={{ width: "24px", height: "24px", objectFit: "contain", borderRadius: "4px" }}
      />
    </div>
  );
}
