import React from "react";

export default function ChatWorkspace({ chatWindow, promptInput }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      flex: 1,
      minWidth: 0,
      position: "relative"
    }}>
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        {chatWindow}
      </div>
      <div style={{ flexShrink: 0 }}>
        {promptInput}
      </div>
    </div>
  );
}
