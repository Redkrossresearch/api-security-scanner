import React from "react";

export default function StreamingIndicator() {
  return (
    <>
      <style>{`
        .streaming-cursor {
          display: inline-block;
          width: 6px;
          height: 14px;
          background: #8B5CF6;
          margin-left: 4px;
          animation: blink-cursor 0.8s infinite;
          vertical-align: middle;
        }
        @keyframes blink-cursor {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
      <span className="streaming-cursor" />
    </>
  );
}
